import type { ExamSkill } from "../types/adminTypes";

export type AdminMenuItem =
  | string
  | {
      title: string;
      items: string[];
    };

export type AdminMenuGroup = {
  title: string;
  items: AdminMenuItem[];
};

export const adminMenuGroups: AdminMenuGroup[] = [
  {
    title: "Users",
    items: ["Students", "Teachers", "Blocked users", "Login history"],
  },
  {
    title: "Courses",
    items: [
      "All courses",
      {
        title: "Grammar",
        items: ["Free version", "Paid version"],
      },
      {
        title: "CEFR",
        items: ["Free version", "Paid version"],
      },
      {
        title: "IELTS",
        items: ["Free version", "Paid version"],
      },
      {
        title: "TOEFL",
        items: ["Free version", "Paid version"],
      },
      {
        title: "SAT",
        items: ["Free version", "Paid version"],
      },
    ],
  },
  {
    title: "Tests",
    items: [
      "Vocabulary",
      "Grammar Quiz",
      "Game",
      {
        title: "CEFR",
        items: ["Listening", "Reading", "Writing", "Speaking"],
      },
      {
        title: "IELTS",
        items: ["Listening", "Reading", "Writing", "Speaking"],
      },
      {
        title: "TOEFL",
        items: ["Reading", "Listening", "Speaking", "Writing"],
      },
      {
        title: "SAT",
        items: ["Reading and Writing", "Math"],
      },
    ],
  },
  {
    title: "Content",
    items: [
      "Podcasts",
      "Articles",
      "Cinema",
      "Cartoons",
    ],
  },
  {
    title: "Teachers",
    items: [
      "Teacher profiles",
      "Teacher approvals",
      "Lesson schedule",
      "Bookings",
      "Ratings and reviews",
      "Teacher earnings",
      "Teacher applications",
    ],
  },
  {
    title: "Payments",
    items: [
      "All payments",
      "Subscriptions",
      "Transactions",
      "Refunds",
      "Debts",
      "Invoices / receipts",
      "Payment gateway settings",
      "Payment statistics",
    ],
  },
  {
    title: "Reports",
    items: [
      "Users report",
      "Courses report",
      "Test results report",
      "Skill analysis",
      "Teacher performance",
      "Revenue report",
      "Payments report",
      "Export",
    ],
  },
  {
    title: "Notifications",
    items: [
      "Push messages",
      "Email messages",
      "SMS messages",
      "Telegram messages",
      "Reminders",
      "Message templates",
    ],
  },
  {
    title: "Reviews and requests",
    items: [
      "User reviews",
      "Teacher reviews",
      "Support tickets",
      "Complaints",
      "Suggestions",
      "Moderation",
    ],
  },
  {
    title: "Settings",
    items: [
      "Platform settings",
      "Language settings",
      "File upload settings",
      "Email settings",
      "SMS settings",
    ],
  },
  {
    title: "Security",
    items: [
      "System security settings",
      "Blocked IPs",
      "Login sessions",
    ],
  },
];

export const courseMenus = [
  {
    title: "Multilevel",
    items: ["Listening", "Reading", "Writing", "Speaking"],
  },
  {
    title: "IELTS",
    items: ["Academic", "General Training", "Band score", "Mock exams"],
  },
  {
    title: "TOEFL",
    items: ["iBT", "Reading", "Listening", "Speaking", "Writing"],
  },
  {
    title: "SAT",
    items: ["Math", "Reading and Writing", "Diagnostic test", "Score plan"],
  },
  {
    title: "Free lessons",
    items: ["Video lessons", "Materials", "Exercises"],
  },
];

export const examSkills: ExamSkill[] = ["Listening", "Reading", "Writing", "Speaking", "Vocabulary", "Grammar", "Game"];

export const levelOptions = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const contentMenus = [
  "Podcasts",
  "Articles",
  "Cinema",
  "Cartoons",
];

export const statCards = [
  {
    label: "Total users",
    key: "total",
  },
  {
    label: "Active",
    key: "active",
  },
  {
    label: "Inactive",
    key: "inactive",
  },
] as const;

export function isExamSkill(value: string): value is ExamSkill {
  return examSkills.includes(value as ExamSkill);
}
