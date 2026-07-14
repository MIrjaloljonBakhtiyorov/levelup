import { useCallback, useEffect, useState } from "react";

import { getPublicResources, type AdminContentKind } from "../services/adminContentApi";
import { getPublicCourses } from "../services/adminCoursesApi";
import { getPublicTests, type PublicTestSummary } from "../services/adminTestsApi";
import type { AdminCourse, ExamSkill, ExamType } from "../types/adminTypes";

type ExamCourseCount = { exam: ExamType; free: number; paid: number };
type ContentModuleCount = { key: string; count: number };
type PartCounts = Record<ExamType, { Listening: Record<string, number>; Reading: Record<string, number> }>;

export type DashboardContentStats = {
  courses: ExamCourseCount[];
  content: ContentModuleCount[];
  partCounts: PartCounts;
  testCountsBySkill: Record<ExamSkill, number>;
  totalTests: number;
};

const exams: ExamType[] = ["CEFR", "IELTS", "TOEFL", "SAT"];
const parts = (size: number) => Object.fromEntries(Array.from({ length: size }, (_, i) => [`part${i + 1}`, 0]));

function readStats(
  courses: AdminCourse[],
  tests: PublicTestSummary[] = [],
  contentCounts: Partial<Record<AdminContentKind, number>> = {},
): DashboardContentStats {
  const partCounts = Object.fromEntries(exams.map((exam) => [exam, {
    Listening: parts(6),
    Reading: parts(6),
  }])) as PartCounts;

  tests.forEach((test) => {
    const exam = test.examType as ExamType;
    const partType = test.partType || "part1";

    if (!exams.includes(exam)) {
      return;
    }

    if (test.skill === "Listening" && partType in partCounts[exam].Listening) {
      partCounts[exam].Listening[partType] += 1;
    }

    if (test.skill === "Reading" && partType in partCounts[exam].Reading) {
      partCounts[exam].Reading[partType] += 1;
    }
  });

  const countSkill = (skill: ExamSkill) => tests.filter((test) => test.skill === skill).length;

  return {
    courses: exams.map((exam) => {
      const examCourses = courses.filter((course) => course.categories.includes(exam));
      return {
        exam,
        free: examCourses.filter((course) => course.isFree).length,
        paid: examCourses.filter((course) => !course.isFree).length,
      };
    }),
    content: [
      { key: "podcasts", count: contentCounts.podcasts ?? 0 },
      { key: "articles", count: contentCounts.articles ?? 0 },
      { key: "cinema", count: contentCounts.cinema ?? 0 },
      { key: "cartoons", count: contentCounts.cartoons ?? 0 },
      { key: "grammar", count: 0 },
      { key: "vocabulary", count: 0 },
      { key: "reading-materials", count: 0 },
      { key: "writing-samples", count: 0 },
      { key: "speaking-topics", count: 0 },
      { key: "blog-categories", count: 0 },
      { key: "media-files", count: 0 },
    ],
    partCounts,
    testCountsBySkill: {
      Listening: countSkill("Listening"),
      Reading: countSkill("Reading"),
      Writing: countSkill("Writing"),
      Speaking: countSkill("Speaking"),
      Vocabulary: countSkill("Vocabulary"),
      Grammar: countSkill("Grammar"),
      Game: countSkill("Game"),
    },
    totalTests: tests.length,
  };
}

export function useAdminDashboardContent(): DashboardContentStats {
  const refresh = useCallback(async () => {
    const [coursesResult, resourcesResult, testsResult] = await Promise.all([
      getPublicCourses(),
      getPublicResources(),
      getPublicTests(),
    ]);
    const contentCounts = resourcesResult.resources.reduce<Partial<Record<AdminContentKind, number>>>((counts, resource) => {
      counts[resource.type] = (counts[resource.type] ?? 0) + 1;
      return counts;
    }, {});

    return readStats(coursesResult.courses ?? [], testsResult.tests ?? [], contentCounts);
  }, []);
  const [stats, setStats] = useState<DashboardContentStats>(() => readStats([]));

  useEffect(() => {
    const update = () => {
      refresh()
        .then(setStats)
        .catch(() => setStats(readStats([])));
    };

    update();
    window.addEventListener("focus", update);
    window.addEventListener("storage", update);
    window.addEventListener("admin-data-changed", update);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("admin-data-changed", update);
    };
  }, [refresh]);

  return stats;
}
