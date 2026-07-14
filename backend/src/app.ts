import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const app = express();
// Development uchun qiymatlar saqlab qolingan, productionda esa ularni .env
// orqali berish kerak. Token hech qachon statik bo'lmaydi.
const ADMIN_LOGIN = process.env.ADMIN_LOGIN?.trim() || "mister_italiano";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mister_italiano";
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const dataDirectory = path.resolve(
  process.env.DATA_DIRECTORY?.trim() || path.resolve(process.cwd(), "data"),
);
const usersFilePath    = path.join(dataDirectory, "users.json");
const teachersFilePath = path.join(dataDirectory, "teachers.json");
const logsFilePath     = path.join(dataDirectory, "admin_logs.json");
const coursesFilePath  = path.join(dataDirectory, "courses.json");
const userCoursesFilePath = path.join(dataDirectory, "user_courses.json");
const lessonNotesFilePath = path.join(dataDirectory, "lesson_notes.json");
const studyPlansFilePath = path.join(dataDirectory, "study_plans.json");
const contentFilePath = path.join(dataDirectory, "content.json");
const testsFilePath = path.join(dataDirectory, "tests.json");
const securityFilePath = path.join(dataDirectory, "security.json");

// Server qayta ishga tushganda sessionlar avtomatik tugaydi. Bu statik token
// orqali admin endpointlariga ruxsatsiz kirishning oldini oladi.
const adminSessions = new Map<string, AdminSession>();

type UserStatus = "active" | "temporary_blocked" | "blocked";
type TeacherStatus = "active" | "inactive" | "pending";
type CourseCategory =
  | "Listening"
  | "Reading"
  | "Writing"
  | "Speaking"
  | "Grammar"
  | "Vocabulary"
  | "IELTS"
  | "TOEFL"
  | "SAT"
  | "CEFR";
type CourseLevel =
  | "Beginner"
  | "Elementary"
  | "Pre-Intermediate"
  | "Intermediate"
  | "Upper-Intermediate"
  | "Advanced";
type ContentKind = "podcasts" | "articles" | "cinema" | "cartoons";
type TestKind = "listening" | "reading" | "writing" | "speaking" | "extra";
type ResourceLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type TeacherCourse = {
  title: string;
  price: number;
};

type StoredTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
  overallScore: number;
  courses: TeacherCourse[];
  status: TeacherStatus;
  createdAt: string;
};

type AdminLog = {
  id: string;
  ip: string;
  userAgent: string;
  device: string;
  os: string;
  browser: string;
  deviceId?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  loginCount?: number;
  lastSeenAt?: string;
  loggedInAt: string;
  loggedOutAt?: string;
  expiresAt?: string;
  status?: "active" | "logged_out" | "expired" | "failed";
  success: boolean;
};

type AdminSession = {
  expiresAt: number;
  logId: string;
};

type StoredCourse = {
  id: string;
  title: string;
  categories: CourseCategory[];
  level: CourseLevel;
  price: number;
  isFree: boolean;
  isActive: boolean;
  mentorFirstName: string;
  mentorLastName: string;
  mentorTelegram: string;
  logoUrl: string;
  mentorPhotoUrl: string;
  description: string;
  videoUrl?: string;
  lessons?: StoredCourseLesson[];
  createdAt: string;
};

type StoredCourseLesson = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
  isFree: boolean;
};

type StoredUserCourse = {
  userId: string;
  courseId: string;
  startedAt: string;
  lastOpenedAt: string;
  progress: number;
  viewedLessonIds?: string[];
  completedLessonIds?: string[];
};

type CourseStats = {
  startedStudents: number;
  activeStudents: number;
  completedStudents: number;
  averageProgress: number;
  lastStartedAt?: string;
  lastOpenedAt?: string;
};

type StoredLessonNote = {
  userId: string;
  courseId: string;
  lessonId: string;
  grammar: string;
  important: string;
  vocabulary: string;
  personal: string;
  updatedAt: string;
};

type StudyPlanType = "daily" | "weekly" | "custom";
type StudyPlanStatus = "active" | "paused" | "completed";

type StoredStudyPlanItem = {
  id: string;
  day: string;
  title: string;
  details: string;
  order: number;
  completed: boolean;
};

type StoredStudyPlan = {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: StudyPlanType;
  status: StudyPlanStatus;
  items: StoredStudyPlanItem[];
  createdAt: string;
  updatedAt: string;
};

type StoredContentItem = {
  id: string;
  type: ContentKind;
  title: string;
  level: ResourceLevel;
  createdAt: string;
  author?: string;
  videoType?: "link" | "file";
  videoUrl?: string;
  videoFileName?: string;
  fileType?: "pdf" | "word" | "image";
  fileUrl?: string;
  fileName?: string;
};

type StoredTestItem = {
  id: string;
  kind: TestKind;
  examType?: string;
  skill?: string;
  testName: string;
  level?: string;
  createdAt: string;
  [key: string]: unknown;
};

type SecurityAlert = {
  id: string;
  type: "brute_force" | "blocked_request" | "protection_enabled";
  severity: "info" | "warning" | "critical";
  ip: string;
  message: string;
  createdAt: string;
};

type SecurityAttempt = {
  ip: string;
  route: string;
  success: boolean;
  createdAt: string;
};

type BlockedIp = {
  ip: string;
  reason: string;
  blockedUntil: string;
  createdAt: string;
};

type SecurityState = {
  settings: {
    selfProtectionEnabled: boolean;
    failedLoginLimit: number;
    windowMs: number;
    blockMs: number;
  };
  attempts: SecurityAttempt[];
  alerts: SecurityAlert[];
  blockedIps: BlockedIp[];
  attackCounters: {
    total: number;
    bruteForce: number;
    blockedRequests: number;
    lastAttackAt?: string;
  };
};

type StoredUser = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
  status: UserStatus;
  blockedUntil?: string;
};

type PublicUser = Omit<StoredUser, "passwordHash">;

const registerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  middleName: z.string().trim().optional().default(""),
  phoneNumber: z.string().trim().min(5),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const adminLoginSchema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
});

const userLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const statusSchema = z
  .object({
    status: z.enum(["active", "temporary_blocked", "blocked"]),
    blockedUntil: z.string().datetime().optional(),
  })
  .superRefine((data, context) => {
    if (data.status !== "temporary_blocked") {
      return;
    }

    if (!data.blockedUntil) {
      context.addIssue({
        code: "custom",
        path: ["blockedUntil"],
        message: "Vaqtincha bloklash uchun muddatni kiriting",
      });
      return;
    }

    if (Date.parse(data.blockedUntil) <= Date.now()) {
      context.addIssue({
        code: "custom",
        path: ["blockedUntil"],
        message: "Bloklash muddati kelajakdagi vaqt bo'lishi kerak",
      });
    }
  });

const updateUserSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  middleName: z.string().trim().optional().default(""),
  phoneNumber: z.string().trim().min(5),
  email: z.string().trim().email(),
});

const courseCategorySchema = z.enum([
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "Grammar",
  "Vocabulary",
  "IELTS",
  "TOEFL",
  "SAT",
  "CEFR",
]);

const courseLevelSchema = z.enum([
  "Beginner",
  "Elementary",
  "Pre-Intermediate",
  "Intermediate",
  "Upper-Intermediate",
  "Advanced",
]);

const courseSchema = z
  .object({
    title: z.string().trim().min(1),
    categories: z.array(courseCategorySchema).min(1),
    level: courseLevelSchema,
    price: z.number().min(0),
    isFree: z.boolean(),
    isActive: z.boolean().optional().default(true),
    mentorFirstName: z.string().trim().min(1),
    mentorLastName: z.string().trim().min(1),
    mentorTelegram: z.string().trim().optional().default(""),
    logoUrl: z.string().optional().default(""),
    mentorPhotoUrl: z.string().optional().default(""),
    description: z.string().trim().optional().default(""),
    videoUrl: z.string().trim().optional(),
    lessons: z
      .array(
        z.object({
          id: z.string().trim().optional(),
          title: z.string().trim().min(1),
          description: z.string().trim().optional().default(""),
          videoUrl: z.string().trim().optional().default(""),
          duration: z.string().trim().optional().default(""),
          order: z.number().int().min(1).optional(),
          isFree: z.boolean().optional().default(false),
        }),
      )
      .optional()
      .default([]),
  })
  .superRefine((course, context) => {
    if (!course.isFree && course.price <= 0) {
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "Pullik kurs uchun narx kiriting",
      });
    }
  });

const studyPlanItemSchema = z.object({
  id: z.string().trim().optional(),
  day: z.string().trim().min(1),
  title: z.string().trim().min(1),
  details: z.string().trim().optional().default(""),
  order: z.number().int().min(1).optional(),
  completed: z.boolean().optional().default(false),
});

const studyPlanSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
  type: z.enum(["daily", "weekly", "custom"]).optional().default("weekly"),
  status: z.enum(["active", "paused", "completed"]).optional().default("active"),
  items: z.array(studyPlanItemSchema).min(1),
});

const contentKindSchema = z.enum(["podcasts", "articles", "cinema", "cartoons"]);
const testKindSchema = z.enum(["listening", "reading", "writing", "speaking", "extra"]);
const resourceLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);
const videoTypeSchema = z.enum(["link", "file"]);

const podcastSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  videoType: videoTypeSchema,
  videoUrl: z.string().trim().min(1),
  videoFileName: z.string().trim().optional(),
  level: resourceLevelSchema,
});

const articleSchema = z.object({
  title: z.string().trim().min(1),
  fileType: z.enum(["pdf", "word", "image"]),
  fileUrl: z.string().min(1),
  fileName: z.string().trim().min(1),
  level: resourceLevelSchema,
});

const videoContentSchema = z.object({
  title: z.string().trim().min(1),
  videoType: videoTypeSchema,
  videoUrl: z.string().trim().min(1),
  videoFileName: z.string().trim().optional(),
  level: resourceLevelSchema,
});

const lessonNoteSchema = z.object({
  grammar: z.string().trim().max(10000).optional().default(""),
  important: z.string().trim().max(10000).optional().default(""),
  vocabulary: z.string().trim().max(10000).optional().default(""),
  personal: z.string().trim().max(10000).optional().default(""),
});

function getContentSchema(kind: ContentKind) {
  if (kind === "podcasts") return podcastSchema;
  if (kind === "articles") return articleSchema;
  return videoContentSchema;
}

function ensureDataFile() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }
  if (!fs.existsSync(usersFilePath))    fs.writeFileSync(usersFilePath,    "[]", "utf8");
  if (!fs.existsSync(teachersFilePath)) fs.writeFileSync(teachersFilePath, "[]", "utf8");
  if (!fs.existsSync(logsFilePath))     fs.writeFileSync(logsFilePath,     "[]", "utf8");
  if (!fs.existsSync(coursesFilePath))  fs.writeFileSync(coursesFilePath,  "[]", "utf8");
  if (!fs.existsSync(userCoursesFilePath)) fs.writeFileSync(userCoursesFilePath, "[]", "utf8");
  if (!fs.existsSync(lessonNotesFilePath)) fs.writeFileSync(lessonNotesFilePath, "[]", "utf8");
  if (!fs.existsSync(studyPlansFilePath)) fs.writeFileSync(studyPlansFilePath, "[]", "utf8");
  if (!fs.existsSync(contentFilePath)) fs.writeFileSync(contentFilePath, "[]", "utf8");
  if (!fs.existsSync(testsFilePath)) fs.writeFileSync(testsFilePath, "[]", "utf8");
  if (!fs.existsSync(securityFilePath)) {
    fs.writeFileSync(securityFilePath, JSON.stringify(defaultSecurityState(), null, 2), "utf8");
  }
}

function readLogs(): AdminLog[] {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(logsFilePath, "utf8")) as AdminLog[];
}

function writeLogs(logs: AdminLog[]) {
  ensureDataFile();
  fs.writeFileSync(logsFilePath, JSON.stringify(logs, null, 2), "utf8");
}

/** User-Agent satridan device / os / browser ajratib oladi */
function parseUserAgent(ua: string): { device: string; os: string; browser: string } {
  // OS
  let os = "Noma'lum OS";
  if (/Windows NT 10/i.test(ua))      os = "Windows 10/11";
  else if (/Windows NT 6\.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6\.1/i.test(ua)) os = "Windows 7";
  else if (/Windows/i.test(ua))         os = "Windows";
  else if (/Mac OS X/i.test(ua))        os = "macOS";
  else if (/Android/i.test(ua))         os = "Android";
  else if (/iPhone|iPad/i.test(ua))     os = "iOS";
  else if (/Linux/i.test(ua))           os = "Linux";

  // Browser
  let browser = "Noma'lum brauzer";
  if (/Edg\//i.test(ua))               browser = "Microsoft Edge";
  else if (/OPR\//i.test(ua))          browser = "Opera";
  else if (/Chrome\//i.test(ua))       browser = "Chrome";
  else if (/Firefox\//i.test(ua))      browser = "Firefox";
  else if (/Safari\//i.test(ua))       browser = "Safari";

  // Device type
  let device = "Desktop";
  if (/Mobile/i.test(ua))             device = "Mobile";
  else if (/Tablet|iPad/i.test(ua))   device = "Tablet";

  return { device, os, browser };
}

function isPrivateIp(ip: string) {
  const normalized = ip.replace(/^::ffff:/, "");
  return normalized === "::1" || normalized === "127.0.0.1" || normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(normalized);
}

async function getIpLocation(ip: string) {
  if (isPrivateIp(ip)) {
    return { location: "Mahalliy tarmoq", address: "Server bilan bir tarmoq" };
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(1800),
    });
    const data = await response.json() as {
      success?: boolean; city?: string; region?: string; country?: string;
      latitude?: number; longitude?: number;
    };
    if (!response.ok || data.success === false) return {};
    const parts = [data.city, data.region, data.country].filter(Boolean);
    return {
      location: parts.join(", "),
      address: parts.join(", "),
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return {};
  }
}

async function appendLog(req: express.Request, success: boolean) {
  const ua  = req.headers["user-agent"] ?? "";
  const ip  = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
              ?? req.socket.remoteAddress
              ?? "0.0.0.0";
  const { device, os, browser } = parseUserAgent(ua);
  const suppliedDeviceId = req.headers["x-device-id"]?.toString().trim();
  const deviceId = suppliedDeviceId || createHash("sha256").update(ua).digest("hex").slice(0, 16);
  const location = success ? await getIpLocation(ip) : {};
  const now = new Date().toISOString();

  const logs = readLogs();
  const existingIndex = success
    ? logs.findIndex((item) => item.success && item.ip === ip && item.deviceId === deviceId)
    : -1;

  if (existingIndex >= 0) {
    const existing = logs[existingIndex];
    const updated: AdminLog = {
      ...existing,
      ...location,
      userAgent: ua,
      device,
      os,
      browser,
      loggedInAt: now,
      loggedOutAt: undefined,
      expiresAt: undefined,
      status: "active",
      loginCount: (existing.loginCount ?? 1) + 1,
      lastSeenAt: now,
    };
    logs.splice(existingIndex, 1);
    logs.unshift(updated);
    writeLogs(logs);
    return updated;
  }

  const log: AdminLog = {
    id:          randomUUID(),
    ip,
    userAgent:   ua,
    device,
    os,
    browser,
    deviceId,
    ...location,
    loggedInAt: now,
    lastSeenAt: now,
    loginCount: 1,
    status: success ? "active" : "failed",
    success,
  };

  logs.unshift(log);           // yangi yozuv tepada
  if (logs.length > 500) logs.splice(500); // max 500 ta satr
  writeLogs(logs);
  return log;
}

function updateAdminLog(logId: string, patch: Partial<AdminLog>) {
  const logs = readLogs();
  const index = logs.findIndex((log) => log.id === logId);

  if (index === -1) {
    return;
  }

  logs[index] = {
    ...logs[index],
    ...patch,
  };
  writeLogs(logs);
}

function syncAdminSessionLogs() {
  const logs = readLogs();
  const activeSessionLogIds = new Set(
    Array.from(adminSessions.values()).map((session) => session.logId),
  );
  let changed = false;

  logs.forEach((log, index) => {
    if (!log.success || log.status !== "active") {
      return;
    }

    const expiresAt = log.expiresAt ? Date.parse(log.expiresAt) : Number.NaN;
    if (!activeSessionLogIds.has(log.id) || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      logs[index] = {
        ...log,
        status: "expired",
      };
      changed = true;
    }
  });

  if (changed) {
    writeLogs(logs);
  }
}

function getAdminLoginHistory() {
  syncAdminSessionLogs();
  return readLogs()
    .slice()
    .sort((left, right) => Date.parse(right.loggedInAt) - Date.parse(left.loggedInAt))
    .slice(0, 100)
    .map((log) => ({
      ...log,
      status: log.status ?? (log.success ? "expired" : "failed"),
    }));
}

function readUsers(): StoredUser[] {
  ensureDataFile();

  const rawUsers = fs.readFileSync(usersFilePath, "utf8");
  return JSON.parse(rawUsers) as StoredUser[];
}

function writeUsers(users: StoredUser[]) {
  ensureDataFile();
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
}

function readCourses(): StoredCourse[] {
  ensureDataFile();
  return (JSON.parse(fs.readFileSync(coursesFilePath, "utf8")) as StoredCourse[])
    .map((course) => ({
      ...course,
      isActive: course.isActive ?? true,
    }));
}

function writeCourses(courses: StoredCourse[]) {
  ensureDataFile();
  fs.writeFileSync(coursesFilePath, JSON.stringify(courses, null, 2), "utf8");
}

function readUserCourses(): StoredUserCourse[] {
  ensureDataFile();
  return (JSON.parse(fs.readFileSync(userCoursesFilePath, "utf8")) as StoredUserCourse[])
    .map(normalizeUserCourseProgress);
}

function writeUserCourses(userCourses: StoredUserCourse[]) {
  ensureDataFile();
  fs.writeFileSync(userCoursesFilePath, JSON.stringify(userCourses, null, 2), "utf8");
}

function readLessonNotes(): StoredLessonNote[] {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(lessonNotesFilePath, "utf8")) as StoredLessonNote[];
}

function writeLessonNotes(notes: StoredLessonNote[]) {
  ensureDataFile();
  fs.writeFileSync(lessonNotesFilePath, JSON.stringify(notes, null, 2), "utf8");
}

function readStudyPlans(): StoredStudyPlan[] {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(studyPlansFilePath, "utf8")) as StoredStudyPlan[];
}

function writeStudyPlans(plans: StoredStudyPlan[]) {
  ensureDataFile();
  fs.writeFileSync(studyPlansFilePath, JSON.stringify(plans, null, 2), "utf8");
}

function readContentItems(): StoredContentItem[] {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(contentFilePath, "utf8")) as StoredContentItem[];
}

function writeContentItems(items: StoredContentItem[]) {
  ensureDataFile();
  fs.writeFileSync(contentFilePath, JSON.stringify(items, null, 2), "utf8");
}

function readTestItems(): StoredTestItem[] {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(testsFilePath, "utf8")) as StoredTestItem[];
}

function writeTestItems(items: StoredTestItem[]) {
  ensureDataFile();
  fs.writeFileSync(testsFilePath, JSON.stringify(items, null, 2), "utf8");
}

function defaultSecurityState(): SecurityState {
  return {
    settings: {
      selfProtectionEnabled: true,
      failedLoginLimit: 5,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    },
    attempts: [],
    alerts: [],
    blockedIps: [],
    attackCounters: {
      total: 0,
      bruteForce: 0,
      blockedRequests: 0,
    },
  };
}

function readSecurityState(): SecurityState {
  ensureDataFile();
  try {
    const stored = JSON.parse(fs.readFileSync(securityFilePath, "utf8")) as Partial<SecurityState>;
    const defaults = defaultSecurityState();
    return {
      settings: {
        ...defaults.settings,
        ...(stored.settings ?? {}),
      },
      attempts: Array.isArray(stored.attempts) ? stored.attempts : defaults.attempts,
      alerts: Array.isArray(stored.alerts) ? stored.alerts : defaults.alerts,
      blockedIps: Array.isArray(stored.blockedIps) ? stored.blockedIps : defaults.blockedIps,
      attackCounters: {
        ...defaults.attackCounters,
        ...(stored.attackCounters ?? {}),
      },
    };
  } catch {
    return defaultSecurityState();
  }
}

function writeSecurityState(state: SecurityState) {
  ensureDataFile();
  fs.writeFileSync(securityFilePath, JSON.stringify(state, null, 2), "utf8");
}

function getClientIp(req: express.Request) {
  return (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
    ?? req.socket.remoteAddress
    ?? "0.0.0.0";
}

function cleanupSecurityState(state: SecurityState) {
  const now = Date.now();
  state.blockedIps = state.blockedIps.filter((item) => Date.parse(item.blockedUntil) > now);
  state.attempts = state.attempts.filter((item) => Date.parse(item.createdAt) > now - 24 * 60 * 60 * 1000);
  state.alerts = state.alerts.slice(0, 200);
  return state;
}

function addSecurityAlert(state: SecurityState, alert: Omit<SecurityAlert, "id" | "createdAt">) {
  state.alerts.unshift({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...alert,
  });
}

function recordDetectedAttack(
  state: SecurityState,
  type: "brute_force" | "blocked_request",
  ip: string,
  message: string,
) {
  const createdAt = new Date().toISOString();
  state.attackCounters.total += 1;
  state.attackCounters.lastAttackAt = createdAt;
  if (type === "brute_force") state.attackCounters.bruteForce += 1;
  if (type === "blocked_request") state.attackCounters.blockedRequests += 1;
  state.alerts.unshift({
    id: randomUUID(),
    type,
    severity: type === "brute_force" ? "critical" : "warning",
    ip,
    message,
    createdAt,
  });
}

function findActiveBlock(state: SecurityState, ip: string) {
  return state.blockedIps.find((item) => item.ip === ip && Date.parse(item.blockedUntil) > Date.now());
}

function registerSecurityAttempt(req: express.Request, route: string, success: boolean) {
  const ip = getClientIp(req);
  const state = cleanupSecurityState(readSecurityState());

  state.attempts.unshift({
    ip,
    route,
    success,
    createdAt: new Date().toISOString(),
  });

  if (success || !state.settings.selfProtectionEnabled) {
    writeSecurityState(state);
    return;
  }

  const since = Date.now() - state.settings.windowMs;
  const failedCount = state.attempts.filter((attempt) =>
    attempt.ip === ip &&
    !attempt.success &&
    Date.parse(attempt.createdAt) >= since
  ).length;

  if (failedCount >= state.settings.failedLoginLimit && !findActiveBlock(state, ip)) {
    const blockedUntil = new Date(Date.now() + state.settings.blockMs).toISOString();
    state.blockedIps.unshift({
      ip,
      reason: `${failedCount} ta muvaffaqiyatsiz login urinishi`,
      blockedUntil,
      createdAt: new Date().toISOString(),
    });
    recordDetectedAttack(
      state,
      "brute_force",
      ip,
      `Hujumga o'xshash faollik aniqlandi: ${failedCount} ta xato login. IP vaqtincha bloklandi.`,
    );
  }

  writeSecurityState(state);
}

function securityProtectionMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const state = cleanupSecurityState(readSecurityState());
  const ip = getClientIp(req);
  const activeBlock = state.settings.selfProtectionEnabled ? findActiveBlock(state, ip) : undefined;

  if (!activeBlock) {
    writeSecurityState(state);
    next();
    return;
  }

  recordDetectedAttack(
    state,
    "blocked_request",
    ip,
    `Bloklangan IP tizimga kirishga urindi: ${req.method} ${req.path}`,
  );
  writeSecurityState(state);

  res.status(429).json({
    success: false,
    message: `Xavfsizlik himoyasi faollashgan. IP ${new Date(activeBlock.blockedUntil).toLocaleString("uz-UZ")} gacha bloklangan.`,
  });
}

function sortCourses(courses: StoredCourse[]) {
  return courses
    .slice()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

function normalizeCourseLessons(
  lessons: Array<Omit<StoredCourseLesson, "id" | "order"> & { id?: string; order?: number }>,
): StoredCourseLesson[] {
  return lessons.map((lesson, index) => ({
    id: lesson.id?.trim() || randomUUID(),
    title: lesson.title.trim(),
    description: lesson.description?.trim() ?? "",
    videoUrl: lesson.videoUrl?.trim() ?? "",
    duration: lesson.duration?.trim() ?? "",
    order: index + 1,
    isFree: Boolean(lesson.isFree),
  }));
}

function getCourseLessons(course: StoredCourse): StoredCourseLesson[] {
  const lessons = course.lessons?.length
    ? course.lessons
    : course.videoUrl
      ? [
          {
            id: `${course.id}-intro`,
            title: course.title,
            description: course.description,
            videoUrl: course.videoUrl,
            duration: "Video dars",
            order: 1,
            isFree: course.isFree,
          },
        ]
      : [
          {
            id: `${course.id}-overview`,
            title: course.title,
            description: course.description,
            videoUrl: "",
            duration: "Erkin o'qish",
            order: 1,
            isFree: course.isFree,
          },
        ];

  return lessons
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));
}

function getCompletedLessonCount(progress: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(total, Math.max(0, Math.round((progress / 100) * total)));
}

function getCompletedLessonIdsFromProgress(progress: number, lessons: StoredCourseLesson[]) {
  return lessons
    .slice(0, getCompletedLessonCount(progress, lessons.length))
    .map((lesson) => lesson.id);
}

function uniqueStrings(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function normalizeUserCourseProgress(progress: StoredUserCourse): StoredUserCourse {
  return {
    ...progress,
    viewedLessonIds: uniqueStrings(progress.viewedLessonIds ?? []),
    completedLessonIds: uniqueStrings(progress.completedLessonIds ?? []),
  };
}

function normalizeStudyPlanItems(
  items: Array<z.infer<typeof studyPlanItemSchema>>,
): StoredStudyPlanItem[] {
  return items.map((item, index) => ({
    id: item.id?.trim() || randomUUID(),
    day: item.day.trim(),
    title: item.title.trim(),
    details: item.details?.trim() ?? "",
    order: index + 1,
    completed: Boolean(item.completed),
  }));
}

function getCourseStats(course: StoredCourse, userCourses: StoredUserCourse[]): CourseStats {
  const lessons = getCourseLessons(course);
  const progressRows = userCourses.filter((progress) => progress.courseId === course.id);
  const completedStudents = progressRows.filter((progress) => {
    const completedLessonIds = uniqueStrings([
      ...getCompletedLessonIdsFromProgress(progress.progress, lessons),
      ...(progress.completedLessonIds ?? []),
    ]);

    return progress.progress >= 100 || (lessons.length > 0 && completedLessonIds.length >= lessons.length);
  }).length;
  const startedStudents = progressRows.length;
  const activeStudents = Math.max(0, startedStudents - completedStudents);
  const averageProgress = startedStudents > 0
    ? Math.round(progressRows.reduce((sum, progress) => sum + Math.min(100, Math.max(0, progress.progress)), 0) / startedStudents)
    : 0;
  const lastStartedAt = progressRows
    .map((progress) => progress.startedAt)
    .filter(Boolean)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];
  const lastOpenedAt = progressRows
    .map((progress) => progress.lastOpenedAt)
    .filter(Boolean)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];

  return {
    startedStudents,
    activeStudents,
    completedStudents,
    averageProgress,
    lastStartedAt,
    lastOpenedAt,
  };
}

function toAdminCourse(course: StoredCourse, userCourses: StoredUserCourse[]) {
  return {
    ...course,
    stats: getCourseStats(course, userCourses),
  };
}

function sortContentItems<T extends { createdAt: string }>(items: T[]) {
  return items
    .slice()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

function toResourceItem(item: StoredContentItem) {
  const categoryByType: Record<ContentKind, string> = {
    podcasts: "Podcast",
    articles: "Article",
    cinema: "Cinema",
    cartoons: "Cartoon",
  };
  const formatByType: Record<ContentKind, string> = {
    podcasts: "Podcast",
    articles: item.fileType === "image" ? "Image" : item.fileType === "word" ? "Word" : "PDF",
    cinema: "Video",
    cartoons: "Video",
  };
  const toneByType: Record<ContentKind, string> = {
    podcasts: "blue",
    articles: "green",
    cinema: "purple",
    cartoons: "orange",
  };

  return {
    id: item.id,
    type: item.type,
    section: item.type === "podcasts" ? "Podcast" : item.level,
    category: categoryByType[item.type],
    title: item.title,
    level: item.level,
    duration: item.type === "articles" ? "O'qish materiali" : "Video material",
    tone: toneByType[item.type],
    format: formatByType[item.type],
    url: item.type === "articles" ? item.fileUrl : item.videoUrl,
    fileName: item.fileName ?? item.videoFileName,
    createdAt: item.createdAt,
  };
}

function toPublicTestItem(item: StoredTestItem) {
  const part = item.part as { type?: string } | undefined;
  const task = item.task as { type?: string } | undefined;

  return {
    id: item.id,
    kind: item.kind,
    examType: item.examType ?? "General",
    skill: item.skill ?? (
      item.kind === "extra"
        ? "Practice"
        : item.kind.charAt(0).toUpperCase() + item.kind.slice(1)
    ),
    testName: item.testName,
    level: item.level ?? "",
    questionCount:
      typeof item.questionCount === "number"
        ? item.questionCount
        : getStoredTestQuestionCount(item),
    partType: part?.type ?? task?.type ?? "",
    createdAt: item.createdAt,
  };
}

function getStoredTestQuestionCount(item: StoredTestItem) {
  if (item.kind === "listening") {
    const part = item.part as { questions?: unknown[] } | undefined;
    return Array.isArray(part?.questions) ? part.questions.length : 0;
  }

  if (item.kind === "reading") {
    const part = item.part as {
      answers?: unknown[];
      questions?: unknown[];
      section1?: unknown[];
      section2?: unknown[];
    } | undefined;
    if (Array.isArray(part?.answers)) return part.answers.length;
    if (Array.isArray(part?.questions)) return part.questions.length;
    return (Array.isArray(part?.section1) ? part.section1.length : 0)
      + (Array.isArray(part?.section2) ? part.section2.length : 0);
  }

  if (item.kind === "speaking") {
    const part = item.part as { questions?: unknown[] } | undefined;
    return Array.isArray(part?.questions) ? part.questions.length : 0;
  }

  return 1;
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, hash] = passwordHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const expectedHash = Buffer.from(hash, "hex");
  const actualHash = scryptSync(password, salt, 64);

  return (
    expectedHash.length === actualHash.length &&
    timingSafeEqual(expectedHash, actualHash)
  );
}

function createUserToken(userId: string) {
  return `levelup_user_${userId}`;
}

function createAdminSession(logId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  adminSessions.set(token, { expiresAt, logId });
  updateAdminLog(logId, {
    expiresAt: new Date(expiresAt).toISOString(),
    status: "active",
  });
  return token;
}

function toPublicUser(user: StoredUser): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function isTemporaryBlockExpired(user: StoredUser) {
  if (user.status !== "temporary_blocked") {
    return false;
  }

  const blockedUntil = user.blockedUntil
    ? Date.parse(user.blockedUntil)
    : Number.NaN;

  // Eski yoki buzilgan yozuv foydalanuvchini abadiy blokda qoldirmasin.
  return Number.isNaN(blockedUntil) || blockedUntil <= Date.now();
}

function releaseExpiredTemporaryBlocks(users: StoredUser[]) {
  let changed = false;

  users.forEach((user, index) => {
    if (!isTemporaryBlockExpired(user)) {
      return;
    }

    users[index] = {
      ...user,
      status: "active",
      blockedUntil: undefined,
    };
    changed = true;
  });

  return changed;
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const session = token ? adminSessions.get(token) : undefined;

  if (!token || !session || session.expiresAt <= Date.now()) {
    if (token && session) {
      updateAdminLog(session.logId, { status: "expired" });
      adminSessions.delete(token);
    }

    res.status(401).json({
      success: false,
      message: "Admin sifatida kirish talab qilinadi",
    });
    return;
  }

  next();
}

function getBearerToken(req: express.Request) {
  const authorization = req.headers.authorization;
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
}

function getUserFromRequest(req: express.Request, res: express.Response) {
  const token = getBearerToken(req);
  const userId = token?.startsWith("levelup_user_")
    ? token.slice("levelup_user_".length)
    : undefined;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Foydalanuvchi sifatida kirish talab qilinadi",
    });
    return null;
  }

  const users = readUsers();
  const userIndex = users.findIndex((user) => user.id === userId);
  const user = users[userIndex];

  if (!user) {
    res.status(401).json({
      success: false,
      message: "Foydalanuvchi topilmadi",
    });
    return null;
  }

  if (isTemporaryBlockExpired(user)) {
    users[userIndex] = {
      ...user,
      blockedUntil: undefined,
      status: "active",
    };
    writeUsers(users);
    return users[userIndex];
  }

  if (user.status === "temporary_blocked") {
    res.status(403).json({
      success: false,
      message: `Profilingiz ${new Date(user.blockedUntil as string).toLocaleString("uz-UZ")} gacha vaqtincha bloklangan`,
    });
    return null;
  }

  if (user.status === "blocked") {
    res.status(403).json({
      success: false,
      message: "Profilingiz butunlay bloklangan",
    });
    return null;
  }

  return user;
}

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(securityProtectionMiddleware);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend muvaffaqiyatli ishlayapti",
  });
});

app.post("/api/auth/login", async (req, res) => {
  const result = adminLoginSchema.safeParse(req.body);

  if (!result.success) {
    await appendLog(req, false);
    res.status(400).json({
      success: false,
      message: "Login va parolni to‘g‘ri kiriting",
    });
    return;
  }

  if (
    result.data.login !== ADMIN_LOGIN ||
    result.data.password !== ADMIN_PASSWORD
  ) {
    await appendLog(req, false);
    registerSecurityAttempt(req, "admin_login", false);
    res.status(401).json({
      success: false,
      message: "Login yoki parol noto‘g‘ri",
    });
    return;
  }

  const loginLog = await appendLog(req, true);
  registerSecurityAttempt(req, "admin_login", true);
  res.status(200).json({
    success: true,
    token: createAdminSession(loginLog.id),
    user: {
      login: ADMIN_LOGIN,
      role: "admin",
    },
  });
});

app.post("/api/auth/logout", (req, res) => {
  const token = getBearerToken(req);
  const session = token ? adminSessions.get(token) : undefined;

  if (token && session) {
    adminSessions.delete(token);
    const sameDeviceStillActive = Array.from(adminSessions.values())
      .some((item) => item.logId === session.logId && item.expiresAt > Date.now());
    if (!sameDeviceStillActive) {
      updateAdminLog(session.logId, {
        loggedOutAt: new Date().toISOString(),
        status: "logged_out",
      });
    }
  }

  res.status(200).json({
    success: true,
    message: "Admin sessiyasi yopildi",
  });
});

app.post("/api/auth/register", (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Ro‘yxatdan o‘tish ma’lumotlarini to‘liq kiriting",
    });
    return;
  }

  const users = readUsers();
  const normalizedEmail = result.data.email.toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    res.status(409).json({
      success: false,
      message: "Bu email bilan foydalanuvchi ro‘yxatdan o‘tgan",
    });
    return;
  }

  const newUser: StoredUser = {
    id: randomUUID(),
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    middleName: result.data.middleName,
    phoneNumber: result.data.phoneNumber,
    email: normalizedEmail,
    passwordHash: createPasswordHash(result.data.password),
    createdAt: new Date().toISOString(),
    status: "active",
  };

  users.unshift(newUser);
  writeUsers(users);

  res.status(201).json({
    success: true,
    token: createUserToken(newUser.id),
    user: toPublicUser(newUser),
  });
});

app.post("/api/auth/user-login", (req, res) => {
  const result = userLoginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Email va parolni to‘g‘ri kiriting",
    });
    return;
  }

  const users = readUsers();
  const userIndex = users.findIndex(
    (storedUser) =>
      storedUser.email.toLowerCase() === result.data.email.toLowerCase(),
  );
  const user = users[userIndex];

  if (!user?.passwordHash || !verifyPassword(result.data.password, user.passwordHash)) {
    registerSecurityAttempt(req, "user_login", false);
    res.status(401).json({
      success: false,
      message: "Email yoki parol noto‘g‘ri",
    });
    return;
  }

  if (isTemporaryBlockExpired(user)) {
    users[userIndex] = {
      ...user,
      blockedUntil: undefined,
      status: "active",
    };
    writeUsers(users);
  } else if (user.status === "temporary_blocked") {
    res.status(403).json({
      success: false,
      message: `Profilingiz ${new Date(user.blockedUntil as string).toLocaleString("uz-UZ")} gacha vaqtincha bloklangan`,
    });
    return;
  } else if (user.status === "blocked") {
    res.status(403).json({
      success: false,
      message: "Profilingiz butunlay bloklangan",
    });
    return;
  }

  registerSecurityAttempt(req, "user_login", true);
  res.status(200).json({
    success: true,
    token: createUserToken(users[userIndex].id),
    user: toPublicUser(users[userIndex]),
  });
});

app.get("/api/admin/users", requireAdmin, (_req, res) => {
  const users = readUsers();

  if (releaseExpiredTemporaryBlocks(users)) {
    writeUsers(users);
  }

  res.status(200).json({
    success: true,
    users: users
      .slice()
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
      .map(toPublicUser),
  });
});

app.get("/api/admin/security", requireAdmin, (_req, res) => {
  const state = cleanupSecurityState(readSecurityState());
  writeSecurityState(state);
  const loginHistory = getAdminLoginHistory();

  const failedAttempts24h = state.attempts.filter((attempt) => !attempt.success).length;
  const latestCriticalAlert =
    state.alerts.find((alert) => alert.severity === "critical") ?? null;

  res.status(200).json({
    success: true,
    security: {
      ...state,
      activeBlocks: state.blockedIps.length,
      failedAttempts24h,
      latestCriticalAlert,
      loginHistory,
    },
  });
});

app.put("/api/admin/security/settings", requireAdmin, (req, res) => {
  const settingsSchema = z.object({
    selfProtectionEnabled: z.boolean(),
    failedLoginLimit: z.number().int().min(3).max(50),
    windowMs: z.number().int().min(60_000).max(60 * 60 * 1000),
    blockMs: z.number().int().min(60_000).max(24 * 60 * 60 * 1000),
  });
  const result = settingsSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Xavfsizlik sozlamalarini tekshiring",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const state = cleanupSecurityState(readSecurityState());
  state.settings = result.data;
  addSecurityAlert(state, {
    type: "protection_enabled",
    severity: result.data.selfProtectionEnabled ? "info" : "warning",
    ip: "system",
    message: result.data.selfProtectionEnabled
      ? "Tizimning o'zini-o'zi himoya qilish funksiyasi yoqildi."
      : "Tizimning o'zini-o'zi himoya qilish funksiyasi o'chirildi.",
  });
  writeSecurityState(state);

  res.status(200).json({
    success: true,
    security: {
      ...state,
      activeBlocks: state.blockedIps.length,
      failedAttempts24h: state.attempts.filter((attempt) => !attempt.success).length,
      latestCriticalAlert:
        state.alerts.find((alert) => alert.severity === "critical") ?? null,
      loginHistory: getAdminLoginHistory(),
    },
  });
});

app.post("/api/admin/security/blocked-ips", requireAdmin, (req, res) => {
  const manualBlockSchema = z.object({
    ip: z.string().trim().min(3).max(80),
    reason: z.string().trim().min(3).max(240),
    blockMs: z.number().int().min(60_000).max(24 * 60 * 60 * 1000),
  });
  const result = manualBlockSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "IP bloklash ma'lumotlarini tekshiring",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const state = cleanupSecurityState(readSecurityState());
  state.blockedIps = state.blockedIps.filter((item) => item.ip !== result.data.ip);
  state.blockedIps.unshift({
    ip: result.data.ip,
    reason: result.data.reason,
    blockedUntil: new Date(Date.now() + result.data.blockMs).toISOString(),
    createdAt: new Date().toISOString(),
  });
  addSecurityAlert(state, {
    type: "blocked_request",
    severity: "warning",
    ip: result.data.ip,
    message: `Admin tomonidan IP bloklandi: ${result.data.reason}`,
  });
  writeSecurityState(state);

  res.status(201).json({
    success: true,
    security: {
      ...state,
      activeBlocks: state.blockedIps.length,
      failedAttempts24h: state.attempts.filter((attempt) => !attempt.success).length,
      latestCriticalAlert:
        state.alerts.find((alert) => alert.severity === "critical") ?? null,
      loginHistory: getAdminLoginHistory(),
    },
  });
});

app.delete("/api/admin/security/blocked-ips/:ip", requireAdmin, (req, res) => {
  const ip = decodeURIComponent(req.params.ip);
  const state = cleanupSecurityState(readSecurityState());
  const before = state.blockedIps.length;
  state.blockedIps = state.blockedIps.filter((item) => item.ip !== ip);

  if (state.blockedIps.length === before) {
    res.status(404).json({
      success: false,
      message: "Bloklangan IP topilmadi",
    });
    return;
  }

  addSecurityAlert(state, {
    type: "protection_enabled",
    severity: "info",
    ip,
    message: "Admin tomonidan IP blokdan chiqarildi.",
  });
  writeSecurityState(state);

  res.status(200).json({
    success: true,
    security: {
      ...state,
      activeBlocks: state.blockedIps.length,
      failedAttempts24h: state.attempts.filter((attempt) => !attempt.success).length,
      latestCriticalAlert:
        state.alerts.find((alert) => alert.severity === "critical") ?? null,
      loginHistory: getAdminLoginHistory(),
    },
  });
});

app.get("/api/courses", (_req, res) => {
  res.status(200).json({
    success: true,
    courses: sortCourses(readCourses().filter((course) => course.isActive)),
  });
});

app.get("/api/free-lessons", (_req, res) => {
  const courses = sortCourses(readCourses().filter((course) => course.isActive))
    .map((course) => {
      const lessons = getCourseLessons(course);
      const freeLessons = course.isFree ? lessons : lessons.filter((lesson) => lesson.isFree);

      return {
        id: course.id,
        title: course.title,
        category: course.categories[0] ?? "General English",
        level: course.level,
        description: course.description,
        logoUrl: course.logoUrl,
        mentorPhotoUrl: course.mentorPhotoUrl,
        mentorName: `${course.mentorFirstName} ${course.mentorLastName}`.trim(),
        lessonCount: freeLessons.length,
        totalLessonCount: lessons.length,
      };
    })
    .filter((course) => course.lessonCount > 0);

  res.status(200).json({
    success: true,
    courses,
  });
});

app.get("/api/resources", (_req, res) => {
  res.status(200).json({
    success: true,
    resources: sortContentItems(readContentItems()).map(toResourceItem),
  });
});

app.get("/api/tests", (_req, res) => {
  res.status(200).json({
    success: true,
    tests: sortContentItems(readTestItems()).map(toPublicTestItem),
  });
});

app.get("/api/tests/:id", (req, res) => {
  const test = readTestItems().find((item) => item.id === req.params.id);

  if (!test) {
    res.status(404).json({ success: false, message: "Test topilmadi" });
    return;
  }

  res.status(200).json({
    success: true,
    test: { ...test, ...toPublicTestItem(test) },
  });
});

app.get("/api/admin/tests", requireAdmin, (req, res) => {
  const kind = typeof req.query.kind === "string" ? req.query.kind : undefined;
  const examType = typeof req.query.examType === "string" ? req.query.examType.toUpperCase() : undefined;
  const skill = typeof req.query.skill === "string" ? req.query.skill : undefined;
  const kindResult = kind ? testKindSchema.safeParse(kind) : undefined;

  if (kindResult && !kindResult.success) {
    res.status(400).json({
      success: false,
      message: "Test turi noto'g'ri",
    });
    return;
  }

  const tests = readTestItems().filter((test) => {
    if (kindResult?.success && test.kind !== kindResult.data) return false;
    if (examType && test.examType !== examType) return false;
    if (skill && test.skill !== skill) return false;
    return true;
  });

  res.status(200).json({
    success: true,
    tests: sortContentItems(tests),
  });
});

app.post("/api/admin/tests/:kind", requireAdmin, (req, res) => {
  const kindResult = testKindSchema.safeParse(req.params.kind);

  if (!kindResult.success) {
    res.status(404).json({
      success: false,
      message: "Test turi topilmadi",
    });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const testName = typeof body.testName === "string" ? body.testName.trim() : "";

  if (!testName) {
    res.status(400).json({
      success: false,
      message: "Test nomini kiriting",
    });
    return;
  }

  const newTest: StoredTestItem = {
    ...body,
    id: randomUUID(),
    kind: kindResult.data,
    examType: typeof body.examType === "string" ? body.examType : undefined,
    skill: typeof body.skill === "string" ? body.skill : undefined,
    testName,
    level: typeof body.level === "string" ? body.level : undefined,
    createdAt: new Date().toISOString(),
  };

  const tests = readTestItems();
  tests.unshift(newTest);
  writeTestItems(tests);

  res.status(201).json({
    success: true,
    test: newTest,
  });
});

app.delete("/api/admin/tests/:kind/:id", requireAdmin, (req, res) => {
  const kindResult = testKindSchema.safeParse(req.params.kind);

  if (!kindResult.success) {
    res.status(404).json({
      success: false,
      message: "Test turi topilmadi",
    });
    return;
  }

  const tests = readTestItems();
  const testIndex = tests.findIndex((test) => test.kind === kindResult.data && test.id === req.params.id);

  if (testIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Test topilmadi",
    });
    return;
  }

  tests.splice(testIndex, 1);
  writeTestItems(tests);

  res.status(200).json({
    success: true,
    message: "Test o'chirildi",
  });
});

app.get("/api/admin/content/:kind", requireAdmin, (req, res) => {
  const kindResult = contentKindSchema.safeParse(req.params.kind);

  if (!kindResult.success) {
    res.status(404).json({
      success: false,
      message: "Content turi topilmadi",
    });
    return;
  }

  res.status(200).json({
    success: true,
    items: sortContentItems(readContentItems().filter((item) => item.type === kindResult.data)),
  });
});

app.post("/api/admin/content/:kind", requireAdmin, (req, res) => {
  const kindResult = contentKindSchema.safeParse(req.params.kind);

  if (!kindResult.success) {
    res.status(404).json({
      success: false,
      message: "Content turi topilmadi",
    });
    return;
  }

  const result = getContentSchema(kindResult.data).safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Content ma'lumotlarini tekshiring",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const newItem: StoredContentItem = {
    id: randomUUID(),
    type: kindResult.data,
    ...result.data,
    createdAt: new Date().toISOString(),
  };
  const items = readContentItems();
  items.unshift(newItem);
  writeContentItems(items);

  res.status(201).json({
    success: true,
    item: newItem,
  });
});

app.put("/api/admin/content/:kind/:id", requireAdmin, (req, res) => {
  const kindResult = contentKindSchema.safeParse(req.params.kind);

  if (!kindResult.success) {
    res.status(404).json({
      success: false,
      message: "Content turi topilmadi",
    });
    return;
  }

  const result = getContentSchema(kindResult.data).safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Content ma'lumotlarini tekshiring",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const items = readContentItems();
  const itemIndex = items.findIndex((item) => item.type === kindResult.data && item.id === req.params.id);

  if (itemIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Content topilmadi",
    });
    return;
  }

  items[itemIndex] = {
    id: items[itemIndex].id,
    type: kindResult.data,
    ...result.data,
    createdAt: items[itemIndex].createdAt,
  };
  writeContentItems(items);

  res.status(200).json({
    success: true,
    item: items[itemIndex],
  });
});

app.delete("/api/admin/content/:kind/:id", requireAdmin, (req, res) => {
  const kindResult = contentKindSchema.safeParse(req.params.kind);

  if (!kindResult.success) {
    res.status(404).json({
      success: false,
      message: "Content turi topilmadi",
    });
    return;
  }

  const items = readContentItems();
  const itemIndex = items.findIndex((item) => item.type === kindResult.data && item.id === req.params.id);

  if (itemIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Content topilmadi",
    });
    return;
  }

  items.splice(itemIndex, 1);
  writeContentItems(items);

  res.status(200).json({
    success: true,
    message: "Content o'chirildi",
  });
});

app.get("/api/user/study-plans", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const plans = readStudyPlans()
    .filter((plan) => plan.userId === user.id)
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));

  res.status(200).json({
    success: true,
    plans,
  });
});

app.post("/api/user/study-plans", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const result = studyPlanSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "O'quv reja ma'lumotlarini tekshiring",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const now = new Date().toISOString();
  const plan: StoredStudyPlan = {
    id: randomUUID(),
    userId: user.id,
    title: result.data.title,
    description: result.data.description,
    type: result.data.type,
    status: result.data.status,
    items: normalizeStudyPlanItems(result.data.items),
    createdAt: now,
    updatedAt: now,
  };
  const plans = readStudyPlans();
  plans.unshift(plan);
  writeStudyPlans(plans);

  res.status(201).json({
    success: true,
    plan,
  });
});

app.put("/api/user/study-plans/:id", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const result = studyPlanSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "O'quv reja ma'lumotlarini tekshiring",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const plans = readStudyPlans();
  const planIndex = plans.findIndex((plan) => plan.id === req.params.id && plan.userId === user.id);

  if (planIndex === -1) {
    res.status(404).json({
      success: false,
      message: "O'quv reja topilmadi",
    });
    return;
  }

  plans[planIndex] = {
    ...plans[planIndex],
    title: result.data.title,
    description: result.data.description,
    type: result.data.type,
    status: result.data.status,
    items: normalizeStudyPlanItems(result.data.items),
    updatedAt: new Date().toISOString(),
  };
  writeStudyPlans(plans);

  res.status(200).json({
    success: true,
    plan: plans[planIndex],
  });
});

app.patch("/api/user/study-plans/:planId/items/:itemId/toggle", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const plans = readStudyPlans();
  const planIndex = plans.findIndex((plan) => plan.id === req.params.planId && plan.userId === user.id);

  if (planIndex === -1) {
    res.status(404).json({
      success: false,
      message: "O'quv reja topilmadi",
    });
    return;
  }

  const itemIndex = plans[planIndex].items.findIndex((item) => item.id === req.params.itemId);

  if (itemIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Reja vazifasi topilmadi",
    });
    return;
  }

  plans[planIndex].items[itemIndex] = {
    ...plans[planIndex].items[itemIndex],
    completed: !plans[planIndex].items[itemIndex].completed,
  };
  plans[planIndex].updatedAt = new Date().toISOString();
  writeStudyPlans(plans);

  res.status(200).json({
    success: true,
    plan: plans[planIndex],
  });
});

app.delete("/api/user/study-plans/:id", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const plans = readStudyPlans();
  const planIndex = plans.findIndex((plan) => plan.id === req.params.id && plan.userId === user.id);

  if (planIndex === -1) {
    res.status(404).json({
      success: false,
      message: "O'quv reja topilmadi",
    });
    return;
  }

  plans.splice(planIndex, 1);
  writeStudyPlans(plans);

  res.status(200).json({
    success: true,
    message: "O'quv reja o'chirildi",
  });
});

app.get("/api/user/courses", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const courses = readCourses().filter((course) => course.isActive);
  const startedCourses = readUserCourses()
    .filter((item) => item.userId === user.id)
    .slice()
    .sort((left, right) => Date.parse(right.lastOpenedAt) - Date.parse(left.lastOpenedAt))
    .map((progress) => {
      const course = courses.find((item) => item.id === progress.courseId);

      if (!course) {
        return null;
      }

      return {
        ...course,
        progress: progress.progress,
        startedAt: progress.startedAt,
        lastOpenedAt: progress.lastOpenedAt,
        viewedLessonIds: progress.viewedLessonIds,
        completedLessonIds: progress.completedLessonIds,
      };
    })
    .filter(Boolean);

  res.status(200).json({
    success: true,
    courses: startedCourses,
  });
});

app.post("/api/user/courses/:id/start", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const course = readCourses().find((item) => item.id === req.params.id && item.isActive);

  if (!course) {
    res.status(404).json({
      success: false,
      message: "Kurs topilmadi",
    });
    return;
  }

  const now = new Date().toISOString();
  const userCourses = readUserCourses();
  const existingIndex = userCourses.findIndex(
    (item) => item.userId === user.id && item.courseId === course.id,
  );

  const progress: StoredUserCourse =
    existingIndex >= 0
      ? {
          ...userCourses[existingIndex],
          lastOpenedAt: now,
          progress: Math.max(userCourses[existingIndex].progress, 1),
          viewedLessonIds: userCourses[existingIndex].viewedLessonIds ?? [],
          completedLessonIds: userCourses[existingIndex].completedLessonIds ?? [],
        }
      : {
          userId: user.id,
          courseId: course.id,
          startedAt: now,
          lastOpenedAt: now,
          progress: 1,
          viewedLessonIds: [],
          completedLessonIds: [],
        };

  if (existingIndex >= 0) {
    userCourses[existingIndex] = progress;
  } else {
    userCourses.unshift(progress);
  }
  writeUserCourses(userCourses);

  res.status(200).json({
    success: true,
    course: {
      ...course,
      progress: progress.progress,
      startedAt: progress.startedAt,
      lastOpenedAt: progress.lastOpenedAt,
      viewedLessonIds: progress.viewedLessonIds,
      completedLessonIds: progress.completedLessonIds,
    },
  });
});

app.get("/api/user/courses/:id/learn", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const course = readCourses().find((item) => item.id === req.params.id && item.isActive);

  if (!course) {
    res.status(404).json({
      success: false,
      message: "Kurs topilmadi",
    });
    return;
  }

  const now = new Date().toISOString();
  const lessons = getCourseLessons(course);
  const userCourses = readUserCourses();
  const existingIndex = userCourses.findIndex(
    (item) => item.userId === user.id && item.courseId === course.id,
  );
  const existingCompletedLessonIds = existingIndex >= 0
    ? uniqueStrings([
        ...getCompletedLessonIdsFromProgress(userCourses[existingIndex].progress, lessons),
        ...(userCourses[existingIndex].completedLessonIds ?? []),
      ])
    : [];
  const completedLessonCount = existingCompletedLessonIds.length;
  const requestedLessonId = typeof req.query.lessonId === "string" ? req.query.lessonId : undefined;
  const firstUnlockedLessonId = lessons[Math.min(completedLessonCount, Math.max(lessons.length - 1, 0))]?.id
    ?? lessons[0]?.id;
  const lessonIdToOpen = requestedLessonId ?? firstUnlockedLessonId;
  const requestedLessonIndex = lessonIdToOpen
    ? lessons.findIndex((lesson) => lesson.id === lessonIdToOpen)
    : -1;
  const viewedLessonId = requestedLessonIndex >= 0 && requestedLessonIndex <= completedLessonCount
    ? lessonIdToOpen
    : undefined;
  const progress: StoredUserCourse =
    existingIndex >= 0
      ? {
          ...userCourses[existingIndex],
          lastOpenedAt: now,
          progress: Math.max(userCourses[existingIndex].progress, 1),
          viewedLessonIds: uniqueStrings([
            ...(userCourses[existingIndex].viewedLessonIds ?? []),
            viewedLessonId,
          ]),
          completedLessonIds: existingCompletedLessonIds,
        }
      : {
          userId: user.id,
          courseId: course.id,
          startedAt: now,
          lastOpenedAt: now,
          progress: 1,
          viewedLessonIds: viewedLessonId ? [viewedLessonId] : [],
          completedLessonIds: [],
        };

  if (existingIndex >= 0) {
    userCourses[existingIndex] = progress;
  } else {
    userCourses.unshift(progress);
  }
  writeUserCourses(userCourses);

  res.status(200).json({
    success: true,
    course: {
      ...course,
      progress: progress.progress,
      startedAt: progress.startedAt,
      lastOpenedAt: progress.lastOpenedAt,
      viewedLessonIds: progress.viewedLessonIds,
      completedLessonIds: progress.completedLessonIds,
      lessons,
    },
    notes: readLessonNotes().filter(
      (note) => note.userId === user.id && note.courseId === course.id,
    ),
  });
});

app.post("/api/user/courses/:courseId/lessons/:lessonId/notes", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const course = readCourses().find((item) => item.id === req.params.courseId && item.isActive);

  if (!course) {
    res.status(404).json({
      success: false,
      message: "Kurs topilmadi",
    });
    return;
  }

  const lesson = getCourseLessons(course).find((item) => item.id === req.params.lessonId);

  if (!lesson) {
    res.status(404).json({
      success: false,
      message: "Dars topilmadi",
    });
    return;
  }

  const result = lessonNoteSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Note ma'lumotlarini tekshiring",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const notes = readLessonNotes();
  const noteIndex = notes.findIndex(
    (note) => note.userId === user.id
      && note.courseId === course.id
      && note.lessonId === lesson.id,
  );
  const note: StoredLessonNote = {
    userId: user.id,
    courseId: course.id,
    lessonId: lesson.id,
    ...result.data,
    updatedAt: new Date().toISOString(),
  };

  if (noteIndex >= 0) {
    notes[noteIndex] = note;
  } else {
    notes.unshift(note);
  }

  writeLessonNotes(notes);

  res.status(200).json({
    success: true,
    note,
  });
});

app.post("/api/user/courses/:courseId/lessons/:lessonId/complete", (req, res) => {
  const user = getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const course = readCourses().find((item) => item.id === req.params.courseId && item.isActive);

  if (!course) {
    res.status(404).json({
      success: false,
      message: "Kurs topilmadi",
    });
    return;
  }

  const lessons = getCourseLessons(course);
  const lessonIndex = lessons.findIndex((item) => item.id === req.params.lessonId);

  if (lessonIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Dars topilmadi",
    });
    return;
  }

  const now = new Date().toISOString();
  const userCourses = readUserCourses();
  const existingIndex = userCourses.findIndex(
    (item) => item.userId === user.id && item.courseId === course.id,
  );
  const existingCompletedLessonIds = existingIndex >= 0
    ? uniqueStrings([
        ...getCompletedLessonIdsFromProgress(userCourses[existingIndex].progress, lessons),
        ...(userCourses[existingIndex].completedLessonIds ?? []),
      ])
    : [];
  const completedLessonCount = existingCompletedLessonIds.length;

  if (lessonIndex > completedLessonCount) {
    res.status(403).json({
      success: false,
      message: "Avval oldingi darsni tugating, keyin keyingi dars ochiladi.",
    });
    return;
  }

  const completedLessonIds = uniqueStrings([
    ...existingCompletedLessonIds,
    lessons[lessonIndex].id,
  ]);
  const viewedLessonIds = uniqueStrings([
    ...(existingIndex >= 0 ? userCourses[existingIndex].viewedLessonIds ?? [] : []),
    lessons[lessonIndex].id,
  ]);
  const calculatedProgress = Math.min(100, Math.round((completedLessonIds.length / lessons.length) * 100));
  const progress: StoredUserCourse =
    existingIndex >= 0
      ? {
          ...userCourses[existingIndex],
          lastOpenedAt: now,
          progress: Math.max(userCourses[existingIndex].progress, calculatedProgress),
          viewedLessonIds,
          completedLessonIds,
        }
      : {
          userId: user.id,
          courseId: course.id,
          startedAt: now,
          lastOpenedAt: now,
          progress: calculatedProgress,
          viewedLessonIds,
          completedLessonIds,
        };

  if (existingIndex >= 0) {
    userCourses[existingIndex] = progress;
  } else {
    userCourses.unshift(progress);
  }
  writeUserCourses(userCourses);

  res.status(200).json({
    success: true,
    progress: progress.progress,
    viewedLessonIds: progress.viewedLessonIds,
    completedLessonIds: progress.completedLessonIds,
  });
});

app.get("/api/admin/courses", requireAdmin, (_req, res) => {
  const userCourses = readUserCourses();

  res.status(200).json({
    success: true,
    courses: sortCourses(readCourses()).map((course) => toAdminCourse(course, userCourses)),
  });
});

app.get("/api/admin/courses/:id", requireAdmin, (req, res) => {
  const userCourses = readUserCourses();
  const course = readCourses().find((item) => item.id === req.params.id);

  if (!course) {
    res.status(404).json({
      success: false,
      message: "Kurs topilmadi",
    });
    return;
  }

  res.status(200).json({
    success: true,
    course: toAdminCourse(course, userCourses),
  });
});

app.post("/api/admin/courses", requireAdmin, (req, res) => {
  const result = courseSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Kurs ma'lumotlarini to'g'ri kiriting",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const newCourse: StoredCourse = {
    ...result.data,
    id: randomUUID(),
    price: result.data.isFree ? 0 : result.data.price,
    videoUrl: result.data.videoUrl || undefined,
    lessons: normalizeCourseLessons(result.data.lessons),
    createdAt: new Date().toISOString(),
  };
  const courses = readCourses();
  courses.unshift(newCourse);
  writeCourses(courses);

  res.status(201).json({
    success: true,
    course: toAdminCourse(newCourse, readUserCourses()),
  });
});

app.put("/api/admin/courses/:id", requireAdmin, (req, res) => {
  const result = courseSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Kurs ma'lumotlarini to'g'ri kiriting",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const courses = readCourses();
  const courseIndex = courses.findIndex((course) => course.id === req.params.id);

  if (courseIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Kurs topilmadi",
    });
    return;
  }

  courses[courseIndex] = {
    ...courses[courseIndex],
    ...result.data,
    price: result.data.isFree ? 0 : result.data.price,
    videoUrl: result.data.videoUrl || undefined,
    lessons: normalizeCourseLessons(result.data.lessons),
  };
  writeCourses(courses);

  res.status(200).json({
    success: true,
    course: toAdminCourse(courses[courseIndex], readUserCourses()),
  });
});

app.patch("/api/admin/courses/:id/status", requireAdmin, (req, res) => {
  const result = z.object({ isActive: z.boolean() }).safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Kurs statusi active yoki inactive bo'lishi kerak",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const courses = readCourses();
  const courseIndex = courses.findIndex((course) => course.id === req.params.id);

  if (courseIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Kurs topilmadi",
    });
    return;
  }

  courses[courseIndex] = {
    ...courses[courseIndex],
    isActive: result.data.isActive,
  };
  writeCourses(courses);

  res.status(200).json({
    success: true,
    course: toAdminCourse(courses[courseIndex], readUserCourses()),
  });
});

app.delete("/api/admin/courses/:id", requireAdmin, (req, res) => {
  const courses = readCourses();
  const courseIndex = courses.findIndex((course) => course.id === req.params.id);

  if (courseIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Kurs topilmadi",
    });
    return;
  }

  courses.splice(courseIndex, 1);
  writeCourses(courses);
  writeUserCourses(readUserCourses().filter((item) => item.courseId !== req.params.id));
  writeLessonNotes(readLessonNotes().filter((note) => note.courseId !== req.params.id));

  res.status(200).json({
    success: true,
    message: "Kurs o'chirildi",
  });
});

app.patch("/api/admin/users/:id/status", requireAdmin, (req, res) => {
  const result = statusSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Status active, temporary_blocked yoki blocked bo‘lishi kerak",
    });
    return;
  }

  const users = readUsers();
  const userIndex = users.findIndex((user) => user.id === req.params.id);

  if (userIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Foydalanuvchi topilmadi",
    });
    return;
  }

  users[userIndex] = {
    ...users[userIndex],
    blockedUntil:
      result.data.status === "temporary_blocked"
        ? result.data.blockedUntil
        : undefined,
    status: result.data.status,
  };
  writeUsers(users);

  res.status(200).json({
    success: true,
    user: toPublicUser(users[userIndex]),
  });
});

// ── Update user (PUT) ──
app.put("/api/admin/users/:id", requireAdmin, (req, res) => {
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ success: false, message: "Ma'lumotlarni to'g'ri kiriting" });
    return;
  }

  const users = readUsers();
  const userIndex = users.findIndex((user) => user.id === req.params.id);

  if (userIndex === -1) {
    res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    return;
  }

  const normalizedEmail = result.data.email.toLowerCase();
  const emailTaken = users.some(
    (user, idx) => idx !== userIndex && user.email.toLowerCase() === normalizedEmail,
  );

  if (emailTaken) {
    res.status(409).json({ success: false, message: "Bu email boshqa foydalanuvchida mavjud" });
    return;
  }

  users[userIndex] = {
    ...users[userIndex],
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    middleName: result.data.middleName,
    phoneNumber: result.data.phoneNumber,
    email: normalizedEmail,
  };
  writeUsers(users);

  res.status(200).json({ success: true, user: toPublicUser(users[userIndex]) });
});

// ── Delete user ──
app.delete("/api/admin/users/:id", requireAdmin, (req, res) => {
  const users = readUsers();
  const userIndex = users.findIndex((user) => user.id === req.params.id);

  if (userIndex === -1) {
    res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    return;
  }

  users.splice(userIndex, 1);
  writeUsers(users);
  writeUserCourses(readUserCourses().filter((item) => item.userId !== req.params.id));
  writeLessonNotes(readLessonNotes().filter((note) => note.userId !== req.params.id));

  res.status(200).json({ success: true, message: "Foydalanuvchi o'chirildi" });
});

export default app;
