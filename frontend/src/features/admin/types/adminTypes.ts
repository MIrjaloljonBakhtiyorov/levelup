export type UserStatus = "active" | "temporary_blocked" | "blocked";

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
  status: UserStatus;
  blockedUntil?: string;
};

export type TeacherStatus = "active" | "inactive" | "pending";

export type TeacherCourse = {
  title: string;
  price: number; // so'm
};

export type AdminTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
  overallScore: number;   // 0–5
  courses: TeacherCourse[];
  status: TeacherStatus;
  createdAt: string;
};

export type CourseCategory =
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

export type CourseLevel = "Beginner" | "Elementary" | "Pre-Intermediate" | "Intermediate" | "Upper-Intermediate" | "Advanced";

export type AdminCourse = {
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
  logoUrl: string;       // base64 yoki URL
  mentorPhotoUrl: string; // base64 yoki URL
  description: string;
  videoUrl?: string;     // YouTube link (ixtiyoriy)
  lessons?: CourseLesson[];
  stats?: CourseStats;
  createdAt: string;
};

export type CourseStats = {
  startedStudents: number;
  activeStudents: number;
  completedStudents: number;
  averageProgress: number;
  lastStartedAt?: string;
  lastOpenedAt?: string;
};

export type CourseLesson = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
  isFree: boolean;
};

export type ExamSkill = "Listening" | "Reading" | "Writing" | "Speaking" | "Vocabulary" | "Grammar" | "Game";

export type ExamType = "IELTS" | "CEFR" | "TOEFL" | "SAT";

// ─── Listening types ──────────────────────────────────────────────

/** Part 1 — MCQ (A/B/C), 8 ta savol */
export type ListeningPart1Question = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correctAnswer: "A" | "B" | "C";
};

export type ListeningPart2Question = {
  id: string;
  answer: string;   
}
export type ListeningPart3Question = {
  id: string;
  statementText: string;               // shart/ko'rsatma matni
  correctAnswer: "A" | "B" | "C" | "D" | "E" | "F";
};
export type ListeningPart4Question = {
  id: string;
  correctAnswer: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";
};

/** Part 5 — 6 ta savol, har biri: shart + A/B/C (+ ixtiyoriy D) + javob matni */
export type ListeningPart5Question = {
  id: string;
  statementText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  hasD: boolean;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
};

/** Part 6 — Passage + 6 ta so'z (audiodan eshitilgan) */
export type ListeningPart6Question = {
  id: string;
  answer: string; // audiodan eshitilgan so'z
};

export type ListeningPartAudio = {
  audioFileName: string;
  audioFileSize: number;
  audioDataUrl?: string;
};

export type ListeningPart =
  | { type: "part1"; audio: ListeningPartAudio; questions: ListeningPart1Question[] }
  | { type: "part2"; audio: ListeningPartAudio; passage: string; questions: ListeningPart2Question[] }
  | { type: "part3"; audio: ListeningPartAudio; optionA: string; optionB: string; optionC: string; optionD: string; optionE: string; optionF: string; questions: ListeningPart3Question[] }
  | { type: "part4"; audio: ListeningPartAudio; imageBase64: string; statementText: string; optionA: string; optionB: string; optionC: string; optionD: string; optionE: string; optionF: string; optionG: string; optionH: string; optionI: string; optionJ: string; optionK: string; questions: ListeningPart4Question[] }
  | { type: "part5"; audio: ListeningPartAudio; questions: ListeningPart5Question[] }
  | { type: "part6"; audio: ListeningPartAudio; passage: string; questions: ListeningPart6Question[] };

export type ListeningTest = {
  id: string;
  examType: ExamType;
  testName: string;
  level: string;
  part: ListeningPart;
  createdAt: string;
};

// ─── Reading types ────────────────────────────────────────────────

/**
 * Part 1 — Gap Fill
 * passage: matn, `___` bilan belgilangan 6 ta bo'sh joy
 * answers: 6 ta to'g'ri javob so'zi (tartib bo'yicha)
 */
export type ReadingPart1 = {
  type: "part1";
  title: string;          // exercise nomi/sarlavhasi
  passage: string;        // ___ bo'sh joylar bilan
  answers: string[];      // 6 ta javob so'zi
};

/**
 * Part 2 — Matching (8 savol, 10 variant A–J)
 * questions: 8 ta savol matni
 * options: 10 ta variant (A–J)
 * correctAnswers: har bir savol uchun to'g'ri variant (A–J)
 */
export type ReadingPart2Option = {
  key: string;   // "A" | "B" | ... | "J"
  text: string;
};

export type ReadingPart2Question = {
  id: string;
  questionText: string;
  correctAnswer: string; // "A" – "J"
};

export type ReadingPart2 = {
  type: "part2";
  options: ReadingPart2Option[];      // 10 ta variant
  questions: ReadingPart2Question[];  // 8 ta savol
};

/**
 * Part 3 — Matching (6 savol, 8 variant A–H)
 * instruction: umumiy shart matni
 * options: 8 ta variant (A–H)
 * questions: 6 ta savol, har biri savol matni + to'g'ri javob
 */
export type ReadingPart3Option = {
  key: string;  // "A" – "H"
  text: string;
};

export type ReadingPart3Question = {
  id: string;
  questionText: string;
  correctAnswer: string; // "A" – "H"
};

export type ReadingPart3 = {
  type: "part3";
  instruction: string;
  options: ReadingPart3Option[];     // 8 ta variant
  questions: ReadingPart3Question[]; // 6 ta savol
};

/**
 * Part 4 — 2 section
 * instruction: umumiy shart
 * text1: 1-matn (section 1 uchun)
 * text2: 2-matn (section 2 uchun)
 * section1: 4 ta MCQ savol (A/B/C/D)
 * section2: 5 ta True/False/Not Given savol
 */
export type ReadingPart4McqQuestion = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
};

export type ReadingPart4TfngQuestion = {
  id: string;
  questionText: string;
  correctAnswer: "True" | "False" | "Not Given";
};

export type ReadingPart4 = {
  type: "part4";
  instruction: string;
  text1: string;
  text2: string;
  section1: ReadingPart4McqQuestion[];   // 4 ta savol
  section2: ReadingPart4TfngQuestion[];  // 5 ta savol
};

/**
 * Part 5 — 2 section, 1 ta katta text
 * passage: umumiy katta matn
 * instruction: umumiy shart
 * section1: 4 ta gap-fill (matndan so'z topish)
 * section2: 4 ta MCQ (A/B/C/D)
 */
export type ReadingPart5GapQuestion = {
  id: string;
  answer: string; // matndan topilgan to'g'ri so'z
};

export type ReadingPart5McqQuestion = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
};

export type ReadingPart5 = {
  type: "part5";
  passage: string;
  instruction: string;
  section1: ReadingPart5GapQuestion[];  // 4 ta gap-fill
  section2: ReadingPart5McqQuestion[];  // 2 ta MCQ
};

export type ReadingPart = ReadingPart1 | ReadingPart2 | ReadingPart3 | ReadingPart4 | ReadingPart5;

export type ReadingTest = {
  id: string;
  examType: ExamType;
  testName: string;
  level: string;
  part: ReadingPart;
  createdAt: string;
};

// ─── Writing types ────────────────────────────────────────────────

/**
 * Writing Task 1
 * taskPrompt: vazifa matni (task description)
 * imageBase64: rasm (optional, graph/chart uchun)
 * sampleAnswer: namuna javob (optional)
 * wordLimit: so'z soni chegarasi (e.g. "150 words minimum")
 */
export type WritingTask1 = {
  type: "task1";
  taskPrompt: string;
  imageBase64?: string;
  sampleAnswer?: string;
  wordLimit: string;
};

/**
 * Writing Task 2
 * taskPrompt: vazifa matni (essay topic)
 * sampleAnswer: namuna javob (optional)
 * wordLimit: so'z soni chegarasi (e.g. "250 words minimum")
 */
export type WritingTask2 = {
  type: "task2";
  taskPrompt: string;
  sampleAnswer?: string;
  wordLimit: string;
};

export type WritingTask = WritingTask1 | WritingTask2;

export type WritingTest = {
  id: string;
  examType: ExamType;
  testName: string;
  level: string;
  task: WritingTask;
  createdAt: string;
};

// ─── Speaking types ───────────────────────────────────────────────

/** Part 1 — 3 ta oddiy savol */
export type SpeakingPart1 = {
  type: "part1";
  questions: string[]; // 3 ta
};

/** Part 1.2 — rasm + 2 ta savol */
export type SpeakingPart12 = {
  type: "part1_2";
  imageBase64: string;
  questions: string[]; // 2 ta
};

/** Part 2 — 3 ta savol */
export type SpeakingPart2 = {
  type: "part2";
  questions: string[]; // 3 ta
};

/** Part 3 — jadval + savollar */
export type SpeakingTableCell = {
  value: string;
};

export type SpeakingPart3 = {
  type: "part3";
  tableTitle: string;
  tableHeaders: string[];   // ustun sarlavhalari
  tableRows: string[][];    // qatorlar (har biri headers.length ta cell)
  questions: string[];      // jadval ostidagi savollar
};

export type SpeakingPart = SpeakingPart1 | SpeakingPart12 | SpeakingPart2 | SpeakingPart3;

export type SpeakingTest = {
  id: string;
  examType: ExamType;
  testName: string;
  level: string;
  part: SpeakingPart;
  createdAt: string;
};

// ─── Vocabulary / Grammar / Game quick tests ─────────────────────

export type ExtraTestSkill = "Vocabulary" | "Grammar" | "Game";
export type ExtraTestDifficulty = "Easy" | "Medium" | "Hard";

export type ExtraTest = {
  id: string;
  examType: ExamType | "General";
  skill: ExtraTestSkill;
  testName: string;
  level: string;
  difficulty: ExtraTestDifficulty;
  questionCount: number;
  description: string;
  createdAt: string;
};

// ─── Podcast types ────────────────────────────────────────────────

export type PodcastLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type AdminPodcast = {
  id: string;
  title: string;
  author: string;
  videoType: "link" | "file";   // link yoki yuklangan fayl
  videoUrl: string;              // link bo'lsa URL, file bo'lsa base64 yoki blob URL
  videoFileName?: string;        // fayl nomi (file rejimida)
  level: PodcastLevel;
  createdAt: string;
};

// ─── Article types ────────────────────────────────────────────────

export type ArticleLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type AdminArticle = {
  id: string;
  title: string;
  fileType: "pdf" | "word" | "image";
  fileUrl: string;       // base64 yoki blob URL
  fileName: string;
  level: ArticleLevel;
  createdAt: string;
};

// ─── Cinema types ─────────────────────────────────────────────────

export type CinemaLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type AdminCinema = {
  id: string;
  title: string;
  videoType: "link" | "file";
  videoUrl: string;
  videoFileName?: string;
  level: CinemaLevel;
  createdAt: string;
};

// ─── Cartoon types ────────────────────────────────────────────────

export type CartoonLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type AdminCartoon = {
  id: string;
  title: string;
  videoType: "link" | "file";
  videoUrl: string;
  videoFileName?: string;
  level: CartoonLevel;
  createdAt: string;
};

// ─── Teacher Profile types ────────────────────────────────────────

export type TeacherCourseType = "IELTS" | "CEFR" | "TOEFL" | "SAT" | "General English";

export type AdminTeacherProfile = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;          // base64
  courses: TeacherCourseType[];
  experience: number;        // yillar soni
  about: string;             // qisqacha bio
  status: "active" | "inactive";
  createdAt: string;
};

// ─── Old ExamTest (kept for compatibility) ────────────────────────
export type ExamTest = {
  id: string;
  examType: ExamType;
  skill: ExamSkill;
  testName: string;
  testNumber: string;
  level: string;
  audioFileName: string;
  audioFileSize: number;
  createdAt: string;
};
