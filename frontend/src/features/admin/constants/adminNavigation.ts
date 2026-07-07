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
    title: "Foydalanuvchilar",
    items: ["O‘quvchilar", "Ustozlar", "Bloklangan foydalanuvchilar", "Login tarixi"],
  },
  {
    title: "Kurslar",
    items: [
      "Barcha kurslar",
      {
        title: "CEFR",
        items: ["Bepul versiya", "Pullik versiya"],
      },
      {
        title: "IELTS",
        items: ["Bepul versiya", "Pullik versiya"],
      },
      {
        title: "TOEFL",
        items: ["Bepul versiya", "Pullik versiya"],
      },
      {
        title: "SAT",
        items: ["Bepul versiya", "Pullik versiya"],
      },
    ],
  },
  {
    title: "Testlar",
    items: [
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
      "Mock testlar",
      "Savollar banki",
      "Audio fayllar",
      "Reading matnlari",
      "Writing tasklar",
      "Speaking savollari",
      "Javob kalitlari",
      "Baholash mezonlari",
    ],
  },
  {
    title: "AI Study Plan",
    items: [
      "Shaxsiy o‘quv rejalar",
      "AI tavsiyalar",
      "Haftalik rejalar",
      "Zaif skill tahlili",
      "Progress tracking",
      "Maqsad ball sozlamalari",
      "Study plan qoidalari",
    ],
  },
  {
    title: "Kontent",
    items: [
      "Podcastlar",
      "Articllar",
      "Cinema",
      "Cartoons",
      "Grammar",
      "Vocabulary",
      "Reading materials",
      "Writing samples",
      "Speaking topics",
      "Blog kategoriyalar",
      "Media fayllar",
    ],
  },
  {
    title: "Ustozlar",
    items: [
      "Ustoz profillari",
      "Ustozlarni tasdiqlash",
      "Dars jadvali",
      "Band qilish / booking",
      "Reyting va sharhlar",
      "Ustoz daromadlari",
      "Ustoz arizalari",
    ],
  },
  {
    title: "Narxlar va tariflar",
    items: [
      "Tarif rejalari",
      "Bepul tarif",
      "Premium tarif",
      "Individual dars narxlari",
      "Guruh kurs narxlari",
      "Mock test narxlari",
      "Promokodlar",
      "Chegirmalar",
      "Trial muddatlari",
      "Tarif imkoniyatlari",
    ],
  },
  {
    title: "To‘lovlar",
    items: [
      "Barcha to‘lovlar",
      "Obunalar",
      "Tranzaksiyalar",
      "Qaytarilgan to‘lovlar",
      "Qarzdorliklar",
      "Invoice / chek",
      "Payment gateway sozlamalari",
      "To‘lov statistikasi",
    ],
  },
  {
    title: "Hisobotlar",
    items: [
      "Foydalanuvchilar hisoboti",
      "Kurslar hisoboti",
      "Test natijalari hisoboti",
      "Skill bo‘yicha tahlil",
      "Ustozlar samaradorligi",
      "Daromad hisoboti",
      "To‘lovlar hisoboti",
      "Eksport qilish",
    ],
  },
  {
    title: "Bildirishnomalar",
    items: [
      "Push xabarlar",
      "Email xabarlar",
      "SMS xabarlar",
      "Telegram xabarlari",
      "Eslatmalar",
      "Xabar shablonlari",
    ],
  },
  {
    title: "Sharhlar va murojaatlar",
    items: [
      "Foydalanuvchi sharhlari",
      "Ustozlar sharhlari",
      "Support ticketlar",
      "Shikoyatlar",
      "Takliflar",
      "Moderatsiya",
    ],
  },
  {
    title: "Sozlamalar",
    items: [
      "Platforma sozlamalari",
      "Til sozlamalari",
      "SEO sozlamalari",
      "Fayl yuklash sozlamalari",
      "Email sozlamalari",
      "SMS sozlamalari",
      "Integratsiyalar",
      "Backup sozlamalari",
    ],
  },
  {
    title: "Xavfsizlik",
    items: [
      "Audit log",
      "Login urinishlari",
      "Sessiyalar",
      "IP bloklash",
      "Ruxsatlar boshqaruvi",
      "Ikki bosqichli himoya",
      "Tizim xavfsizlik sozlamalari",
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
    title: "Bepul darslar",
    items: ["Video darslar", "Materiallar", "Mashqlar"],
  },
];

export const examSkills: ExamSkill[] = ["Listening", "Reading", "Writing", "Speaking"];

export const levelOptions = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const contentMenus = [
  "Podcastlar",
  "Articllar",
  "Cinema",
  "Cartoons",
  "Grammar",
  "Vocabulary",
  "Reading materials",
  "Writing samples",
  "Speaking topics",
  "Blog kategoriyalar",
  "Media fayllar",
];

export const statCards = [
  {
    label: "Jami foydalanuvchi",
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
