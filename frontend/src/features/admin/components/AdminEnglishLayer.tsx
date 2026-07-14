import { type ReactNode, useEffect, useRef } from "react";

type AdminEnglishLayerProps = {
  children: ReactNode;
};

const dictionary: Record<string, string> = {
  "Admin workspace": "Admin workspace",
  "Boshqaruv paneli": "Management dashboard",
  "Foydalanuvchilar, kurslar va tizimni bitta joydan boshqaring.": "Manage users, courses, and the system from one place.",
  "Chiqish": "Logout",
  "Xavfsizlik": "Security",
  "Tizim himoyasi yuklanmoqda": "System protection is loading",
  "Real vaqtli himoya holati tekshirilmoqda.": "Real-time protection status is being checked.",
  "Hujumga o'xshash faollik aniqlandi": "Attack-like activity detected",
  "Self protection": "Self protection",
  "Yoqilgan": "Enabled",
  "O'chirilgan": "Disabled",
  "Login hujumlarini avtomatik ushlaydi": "Automatically detects login attacks",
  "Xato loginlar": "Failed logins",
  "Oxirgi 24 soat ichida": "In the last 24 hours",
  "Bloklangan IP": "Blocked IP",
  "Hozir faol bloklar": "Currently active blocks",
  "Active session": "Active session",
  "Hozir tizimda ochiq admin sessiyalar": "Open admin sessions right now",
  "Tizim xavfsizlik sozlamalari": "System security settings",
  "Avtomatik himoya rejimi": "Automatic protection mode",
  "Bir IP qisqa vaqt ichida ko'p marta noto'g'ri login qilsa, tizim uni avtomatik bloklaydi va admin panelda ogohlantiradi.": "If one IP makes too many failed login attempts in a short time, the system blocks it automatically and alerts the admin panel.",
  "Sozlamani saqlash": "Save settings",
  "Saqlanmoqda...": "Saving...",
  "O'zini-o'zi himoya qilish": "Self-protection",
  "Hujum aniqlansa IP vaqtincha bloklanadi.": "If an attack is detected, the IP is temporarily blocked.",
  "Xato login limiti": "Failed login limit",
  "Kuzatuv oynasi (daqiqa)": "Monitoring window (minutes)",
  "Bloklash vaqti (daqiqa)": "Block duration (minutes)",
  "IP bloklash": "IP blocking",
  "Bloklangan IP'lar": "Blocked IPs",
  "Hujumga o'xshash urinishlardan keyin yoki admin tomonidan bloklangan manzillar.": "Addresses blocked automatically after attack-like attempts or manually by an admin.",
  "IP manzil": "IP address",
  "Sabab": "Reason",
  "Blok vaqti": "Block time",
  "Bloklanmoqda...": "Blocking...",
  "Hozircha bloklangan IP yo'q": "No blocked IPs yet",
  "Tizim tinch ishlayapti.": "The system is running quietly.",
  "Blokdan chiqarish": "Unblock",
  "Login sessionlar": "Login sessions",
  "Admin kirgan-chiqqan sessionlari": "Admin login/logout sessions",
  "Admin panelga kirish, chiqish, IP, qurilma va session holati ko'rsatiladi.": "Admin login, logout, IP, device, and session status are shown.",
  "Login session yo'q": "No login sessions",
  "Admin tizimga kirganda yoki chiqqanda shu yerda ko'rinadi.": "Admin sign-ins and sign-outs will appear here.",
  "Kirgan": "Signed in",
  "Chiqqan": "Signed out",
  "Chiqdi": "Logged out",
  "Xato": "Error",
  "Hali tizimda": "Still online",
  "Ogohlantirishlar": "Alerts",
  "Security alertlar": "Security alerts",
  "Himoya moduli yaratgan oxirgi signal va ogohlantirishlar.": "The latest signals and alerts created by the protection module.",
  "Ogohlantirish yo'q": "No alerts",
  "Xavfli faollik aniqlanmadi.": "No dangerous activity detected.",
  "Xavfsizlik ma'lumotlarini yuklab bo'lmadi": "Could not load security data",
  "Xavfsizlik sozlamalari saqlandi": "Security settings saved",
  "Sozlamalarni saqlab bo'lmadi": "Could not save settings",
  "Bu qism dasturchi tomonidan tez orada yaratiladi.": "This section will be created by the developer soon.",
  "IP manzil bloklandi": "IP address blocked",
  "IP bloklab bo'lmadi": "Could not block IP",
  "IP blokdan chiqarildi": "IP unblocked",
  "IP blokdan chiqarilmadi": "Could not unblock IP",

  "Yangi kurs qo'shish": "Add new course",
  "Yangi kursi qo'shish": "Add new course",
  "kursini tahrirlash": "Edit course",
  "Kurs ma'lumotlarini to'ldiring va saqlang.": "Fill in course information and save it.",
  "Kurs ma'lumotlari": "Course information",
  "Kurs ma'lumotlari yuklanmoqda...": "Course information is loading...",
  "Kurs ma'lumotlarini yuklab bo'lmadi": "Could not load course information",
  "Kurs haqida": "About the course",
  "Kurs nomi *": "Course name *",
  "Daraja *": "Level *",
  "Darajani tanlang": "Select a level",
  "— Darajani tanlang —": "— Select a level —",
  "Bepul kurs": "Free course",
  "Narx (so'm) *": "Price (UZS) *",
  "Kurs tavsifi": "Course description",
  "Kurs logosi": "Course logo",
  "Mentor ma'lumotlari": "Mentor information",
  "Ismi *": "First name *",
  "Familiyasi *": "Last name *",
  "Telegram username": "Telegram username",
  "Media fayllar": "Media files",
  "Mentor rasmi": "Mentor photo",
  "Video dars havolasi": "Video lesson URL",
  "Kursni saqlash": "Save course",
  "O'zgarishlarni saqlash": "Save changes",
  "Saqlandi ✓": "Saved ✓",
  "Saqlanmoqda…": "Saving…",
  "Kurs muvaffaqiyatli saqlandi": "Course saved successfully",
  "Kurs muvaffaqiyatli yangilandi": "Course updated successfully",
  "Yo'naltirilmoqda…": "Redirecting…",
  "Kursni saqlab bo'lmadi": "Could not save the course",
  "Kurs nomini kiriting": "Enter the course name",
  "Narxni kiriting": "Enter the price",
  "Kurslarni yuklab bo'lmadi": "Could not load courses",
  "Kursni o'chirib bo'lmadi": "Could not delete the course",
  "Kursni o'chirish": "Delete course",
  "O'chirish": "Delete",
  "Bepul kurslar": "Free courses",
  "Pullik kurslar": "Paid courses",
  "Kurs nomi": "Course name",
  "Daraja": "Level",
  "Narx": "Price",
  "Narx (so'm)": "Price (UZS)",
  "Qo'shilgan": "Added",
  "Amallar": "Actions",
  "Bepul": "Free",
  "Kurslar yuklanmoqda...": "Courses are loading...",
  "Bepul kurs yo'q": "No free courses",
  "Pullik kurs yo'q": "No paid courses",
  "Yangi kurs qo'shish uchun yuqoridagi": "To add a new course, use the",

  "Foydalanuvchilar ro'yxati": "Users list",
  "Yangi ro'yxatdan o'tganlar birinchi qatorda ko'rinadi.": "Newly registered users appear first.",
  "Foydalanuvchilarni yuklab bo'lmadi": "Could not load users",
  "Foydalanuvchilar ro'yxatini yuklab bo'lmadi": "Could not load users list",
  "Foydalanuvchilar holati": "User status",
  "Jami foydalanuvchi": "Total users",
  "Yangi (1 oyda)": "New (this month)",
  "Ustozlar": "Teachers",
  "Bloklangan": "Blocked",
  "Ism / Foydalanuvchi": "Name / User",
  "Ro'yxatdan o'tgan": "Registered",
  "Blok muddati": "Block period",
  "Ma'lumotlarni tahrirlash": "Edit information",
  "Foydalanuvchini tahrirlash": "Edit user",
  "Foydalanuvchini o'chirish": "Delete user",
  "O'chirishni tasdiqlash": "Confirm deletion",
  "Ha, o'chirish": "Yes, delete",
  "O'chirilmoqda…": "Deleting…",
  "Xatolik yuz berdi": "An error occurred",
  "Foydalanuvchini o'chirib bo'lmadi": "Could not delete user",
  "Qidiruv bo'yicha natija topilmadi": "No results found for your search",
  "Hozircha foydalanuvchi yo'q": "No users yet",
  "Ro'yxatdan o'tganlar shu yerda paydo bo'ladi.": "Registered users will appear here.",
  "Ro'yxatdan o'tganlar shu yerda ko'rinadi.": "Registered users will appear here.",
  "boshqa so'z bilan qidiring": "try another keyword",
  "Qidirish": "Search",
  "Ism, familiya, email yoki telefon...": "Name, surname, email, or phone...",
  "Status": "Status",
  "Telefon": "Phone",

  "Test qo'shish": "Add test",
  "Testni saqlash": "Save test",
  "Test saqlanmadi": "Test was not saved",
  "Test nomini kiriting": "Enter the test name",
  "Test nomi": "Test name",
  "Test nomi *": "Test name *",
  "Test raqami": "Test number",
  "Test audiosi": "Test audio",
  "Test ma'lumotlari": "Test information",
  "Yangi test qo'shish uchun": "To add a new test",
  "Testni o'chirish": "Delete test",
  "Test muvaffaqiyatli saqlandi!": "Test saved successfully!",
  "Testlar yuklanmadi": "Tests could not be loaded",
  "Test turlari": "Test types",
  "Testlar (skill bo'yicha)": "Tests by skill",
  "Test natijalari hisoboti": "Test results report",
  "Hozircha test yo'q": "No tests yet",
  "uchun test yo'q": "has no tests yet",
  "Barcha qismlarni to'ldiring va saqlang.": "Fill in all parts and save.",
  "Yangi": "New",
  "testi": "test",
  "test": "test",
  "bo'limi uchun test qo'shish oynasi ochiq.": "test creation panel is open for this section.",

  "Kontent bo‘limlari": "Content sections",
  "Kontent boshqaruvi backendga ulangandan keyin shu yerda ko‘rinadi.": "Content management will appear here after it is connected to the backend.",
  "Kontent": "Content",
  "Kontent ma’lumotlari mavjud bo‘lganda shu bo‘limda ko‘rsatiladi.": "Content data will be displayed in this section when available.",
  "Kontent modullari": "Content modules",
  "Podcastlar": "Podcasts",
  "Articllar": "Articles",

  "Kurslar va narxlar": "Courses and prices",
  "Bu qism hali ishlab chiqish jarayonida. Ma'lumotlar backend bilan to'liq ulangandan so'ng real ko'rsatiladi.": "This section is still under development. Real data will be shown after it is fully connected to the backend.",
  "O'quvchilar": "Students",
  "Barcha kurslar": "All courses",
  "Bepul versiya": "Free version",
  "Pullik versiya": "Paid version",
  "Ustoz profillari": "Teacher profiles",
  "Ustozlarni tasdiqlash": "Teacher approvals",
  "Dars jadvali": "Lesson schedule",
  "Band qilish / booking": "Bookings",
  "Reyting va sharhlar": "Ratings and reviews",
  "Ustoz daromadlari": "Teacher earnings",
  "Ustoz arizalari": "Teacher applications",
  "To'lovlar": "Payments",
  "Barcha to'lovlar": "All payments",
  "Obunalar": "Subscriptions",
  "Tranzaksiyalar": "Transactions",
  "Qaytarilgan to'lovlar": "Refunds",
  "Qarzdorliklar": "Debts",
  "Invoice / chek": "Invoices / receipts",
  "Payment gateway sozlamalari": "Payment gateway settings",
  "To'lov statistikasi": "Payment statistics",
  "Hisobotlar": "Reports",
  "Foydalanuvchilar hisoboti": "Users report",
  "Kurslar hisoboti": "Courses report",
  "Skill bo'yicha tahlil": "Skill analysis",
  "Ustozlar samaradorligi": "Teacher performance",
  "Daromad hisoboti": "Revenue report",
  "To'lovlar hisoboti": "Payments report",
  "Eksport qilish": "Export",
  "Bildirishnomalar": "Notifications",
  "Push xabarlar": "Push messages",
  "Email xabarlar": "Email messages",
  "SMS xabarlar": "SMS messages",
  "Telegram xabarlari": "Telegram messages",
  "Eslatmalar": "Reminders",
  "Xabar shablonlari": "Message templates",
  "Sharhlar va murojaatlar": "Reviews and requests",
  "Foydalanuvchi sharhlari": "User reviews",
  "Ustozlar sharhlari": "Teacher reviews",
  "Support ticketlar": "Support tickets",
  "Shikoyatlar": "Complaints",
  "Takliflar": "Suggestions",
  "Moderatsiya": "Moderation",
  "Sozlamalar": "Settings",
  "Platforma sozlamalari": "Platform settings",
  "Til sozlamalari": "Language settings",
  "SEO sozlamalari": "SEO settings",
  "Fayl yuklash sozlamalari": "File upload settings",
  "Email sozlamalari": "Email settings",
  "SMS sozlamalari": "SMS settings",
  "Integratsiyalar": "Integrations",
  "Backup sozlamalari": "Backup settings",
  "Bepul darslar": "Free lessons",
  "Video darslar": "Video lessons",
  "Materiallar": "Materials",
  "Mashqlar": "Exercises",

  "Saqlash": "Save",
  "Bekor qilish": "Cancel",
  "Yopish": "Close",
  "Tahrirlash": "Edit",
  "Ko'rish": "View",
  "Ko‘rish": "View",
  "Yuklanmoqda": "Loading",
  "Ma'lumotlarni saqlashda xatolik": "Error while saving data",
};

const replacements: Array<[RegExp, string]> = [
  [/Foydalanuvchilar/g, "Users"],
  [/Foydalanuvchi/g, "User"],
  [/foydalanuvchi/g, "user"],
  [/Kurslar/g, "Courses"],
  [/Kursni/g, "Course"],
  [/Kurs/g, "Course"],
  [/kurs/g, "course"],
  [/Testlar/g, "Tests"],
  [/Testni/g, "Test"],
  [/Test/g, "Test"],
  [/Ustozlar/g, "Teachers"],
  [/Ustoz/g, "Teacher"],
  [/Kontent/g, "Content"],
  [/Xavfsizlik/g, "Security"],
  [/Sozlamalar/g, "Settings"],
  [/Hisobotlar/g, "Reports"],
  [/Bildirishnomalar/g, "Notifications"],
  [/Bepul/g, "Free"],
  [/Pullik/g, "Paid"],
  [/Daraja/g, "Level"],
  [/Narx/g, "Price"],
  [/Qo'shilgan/g, "Added"],
  [/Qo‘shilgan/g, "Added"],
  [/Amallar/g, "Actions"],
  [/Saqlanmoqda/g, "Saving"],
  [/Saqlash/g, "Save"],
  [/Saqlandi/g, "Saved"],
  [/O'chirish/g, "Delete"],
  [/O‘chirish/g, "Delete"],
  [/Qidiruv/g, "Search"],
  [/Qidirish/g, "Search"],
  [/Yangi/g, "New"],
  [/Hozircha/g, "Currently"],
  [/Muvaffaqiyatli/g, "Successfully"],
  [/muvaffaqiyatli/g, "successfully"],
  [/Yo'naltirilmoqda/g, "Redirecting"],
  [/yuklab bo'lmadi/g, "could not be loaded"],
  [/bo'lmadi/g, "failed"],
  [/so'm/g, "UZS"],
  [/gacha/g, "until"],
];

function translateRaw(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return value;

  let translated = dictionary[compact] ?? compact;
  if (translated === compact) {
    replacements.forEach(([pattern, replacement]) => {
      translated = translated.replace(pattern, replacement);
    });
  }

  if (translated === compact) return value;

  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

function translateElement(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  textNodes.forEach((node) => {
    const next = translateRaw(node.nodeValue ?? "");
    if (next !== node.nodeValue) node.nodeValue = next;
  });

  root
    .querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]")
    .forEach((element) => {
      ["placeholder", "aria-label", "title"].forEach((attr) => {
        const current = element.getAttribute(attr);
        if (!current) return;
        const next = translateRaw(current);
        if (next !== current) element.setAttribute(attr, next);
      });
    });
}

function AdminEnglishLayer({ children }: AdminEnglishLayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => translateElement(root);
    update();

    const observer = new MutationObserver(() => window.requestAnimationFrame(update));
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title"],
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}

export default AdminEnglishLayer;
