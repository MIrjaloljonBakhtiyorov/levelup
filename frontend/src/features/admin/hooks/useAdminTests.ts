import { type FormEvent, useState } from "react";

import { loadStoredExamTests, saveStoredExamTests } from "../services/adminExamStorage";
import type { ExamSkill, ExamTest, ExamType } from "../types/adminTypes";
import { createId } from "../utils/adminFormatters";

const SKILLS: ExamSkill[] = ["Listening", "Reading", "Writing", "Speaking"];

export function useAdminTests(examType: ExamType) {
  const [allTests, setAllTests]     = useState<ExamTest[]>(() => loadStoredExamTests());
  const [selectedSkill, setSelectedSkill] = useState<ExamSkill>("Listening");
  const [formKey, setFormKey]       = useState(0);

  // Bu exam turi uchun testlar
  const examTests = allTests.filter((t) => t.examType === examType);

  // Tanlangan skill testlari
  const selectedSkillTests = examTests.filter((t) => t.skill === selectedSkill);

  // Har bir skill uchun count
  const testCountsBySkill = SKILLS.reduce(
    (acc, skill) => {
      acc[skill] = examTests.filter((t) => t.skill === skill).length;
      return acc;
    },
    {} as Record<ExamSkill, number>
  );

  const totalTests = examTests.length;

  function handleAddTest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const testName   = (fd.get("testName")   as string).trim();
    const testNumber = (fd.get("testNumber") as string).trim();
    const level      = (fd.get("level")      as string).trim();
    const audioFile  = (fd.get("audioFile")  as File | null);

    if (!testName || !testNumber || !level) return;

    const newTest: ExamTest = {
      id:            createId(),
      examType,
      skill:         selectedSkill,
      testName,
      testNumber,
      level,
      audioFileName: audioFile?.name ?? "",
      audioFileSize: audioFile?.size ?? 0,
      createdAt:     new Date().toISOString(),
    };

    const updated = [newTest, ...allTests];
    setAllTests(updated);
    saveStoredExamTests(updated);
    setFormKey((k) => k + 1);
  }

  function handleDeleteTest(id: string) {
    const updated = allTests.filter((t) => t.id !== id);
    setAllTests(updated);
    saveStoredExamTests(updated);
  }

  return {
    selectedSkill,
    selectedSkillTests,
    testCountsBySkill,
    totalTests,
    formKey,
    setSelectedSkill,
    handleAddTest,
    handleDeleteTest,
  };
}
