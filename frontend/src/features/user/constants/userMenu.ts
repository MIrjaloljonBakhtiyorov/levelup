export type UserMenuChild = {
  path: string;
  label: string;
  color?: string;
};

export type UserMenuItem = {
  path: string;
  label: string;
  icon: string;
  children?: UserMenuChild[];
};

export const userMenu: UserMenuItem[] = [
  { path: "/user/dashboard", label: "Dashboard", icon: "D" },
  { path: "/user/free-lessons", label: "Bepul darslar", icon: "B" },
  {
    path: "/user/study-plan",
    label: "O‘quv rejam",
    icon: "R",
    children: [
      { path: "/user/study-plan/today", label: "Bugungi reja" },
      { path: "/user/study-plan/week", label: "Haftalik reja" },
    ],
  },
  { path: "/user/courses", label: "Kurslarim", icon: "K" },
  { path: "/user/results", label: "30 kunlik natijalarim", icon: "N" },
  { path: "/user/mentors", label: "Ustozlar / Mentorlar", icon: "M" },
  {
    path: "/user/tests",
    label: "Testlar",
    icon: "T",
    children: [
      { path: "/user/tests/ielts", label: "IELTS", color: "ielts" },
      { path: "/user/tests/cefr", label: "CEFR", color: "cefr" },
      { path: "/user/tests/toefl", label: "TOEFL", color: "toefl" },
      { path: "/user/tests/sat", label: "SAT", color: "sat" },
    ],
  },
  { path: "/user/resources", label: "Resurslar", icon: "Q" },
  { path: "/user/billing", label: "To‘lovlar", icon: "P" },
  { path: "/user/notifications", label: "Bildirishnomalar", icon: "X" },
  { path: "/user/profile", label: "Profil", icon: "F" },
];
