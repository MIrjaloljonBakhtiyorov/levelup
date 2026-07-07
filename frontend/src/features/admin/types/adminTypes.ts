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

export type ExamSkill = "Listening" | "Reading" | "Writing" | "Speaking";

export type ExamTest = {
  id: string;
  skill: ExamSkill;
  testName: string;
  testNumber: string;
  level: string;
  audioFileName: string;
  audioFileSize: number;
  createdAt: string;
};
