import { useMemo, useState } from "react";

import { NotificationCard, type NotificationCardData } from "../components/UserUI";

type NotificationGroup = "Bugun" | "Kecha" | "Oldinroq";

type PremiumNotification = NotificationCardData & {
  group: NotificationGroup;
};

const notifications: PremiumNotification[] = [
  {
    group: "Bugun",
    title: "Writing clinic 19:00 da boshlanadi",
    text: "Mentor Madina Usmonova bugungi live clinicda Task 2 introduction va body paragraph feedback beradi.",
    time: "10 daqiqa oldin",
    status: "new",
    tone: "blue",
    label: "LC",
    priority: "Yuqori",
    action: "Darsga kirish",
    channel: "Live dars",
  },
  {
    group: "Bugun",
    title: "Reading mini mock testingiz tayyor",
    text: "B2 daraja uchun 28 daqiqalik passage set yaratildi. Natija AI analyticsga qo‘shiladi.",
    time: "1 soat oldin",
    status: "new",
    tone: "green",
    label: "RT",
    priority: "O‘rta",
    action: "Testni boshlash",
    channel: "Test markazi",
  },
  {
    group: "Bugun",
    title: "AI study plan yangilandi",
    text: "So‘nggi xatolaringiz asosida listening distractor va academic verbs mashqlari bugungi rejaga qo‘shildi.",
    time: "3 soat oldin",
    status: "new",
    tone: "purple",
    label: "AI",
    priority: "Yuqori",
    action: "Rejani ko‘rish",
    channel: "AI tavsiya",
  },
  {
    group: "Kecha",
    title: "Essay feedback qaytdi",
    text: "Ustoz Jasur coherence, lexical range va conclusion bo‘yicha 6 ta aniq izoh qoldirdi.",
    time: "Kecha 21:15",
    status: "read",
    tone: "orange",
    label: "EF",
    priority: "O‘rta",
    action: "Feedback",
    channel: "Ustoz xabari",
  },
  {
    group: "Kecha",
    title: "Podcast tavsiyasi qo‘shildi",
    text: "B2-C1 speaking fluency uchun Fluent speaking habits podcasti resurslar kutubxonasiga saqlandi.",
    time: "Kecha 16:40",
    status: "read",
    tone: "pink",
    label: "P",
    priority: "Past",
    action: "Tinglash",
    channel: "Resurslar",
  },
  {
    group: "Oldinroq",
    title: "Premium obuna eslatmasi",
    text: "Keyingi to‘lov 15 iyul 2026 kuni amalga oshadi. LEVELUP20 chegirmasi avtomatik qo‘llanadi.",
    time: "2 kun oldin",
    status: "read",
    tone: "blue",
    label: "₽",
    priority: "O‘rta",
    action: "To‘lovlar",
    channel: "Billing",
  },
  {
    group: "Oldinroq",
    title: "Haftalik progress hisoboti tayyor",
    text: "Writing +12%, listening +8%. Eng ko‘p xato qilgan mavzu: matching headings.",
    time: "3 kun oldin",
    status: "read",
    tone: "green",
    label: "PR",
    priority: "Past",
    action: "Hisobot",
    channel: "Analytics",
  },
  {
    group: "Oldinroq",
    title: "Speaking mock uchun slot ochildi",
    text: "Farrux Rahimov bilan shanba kuni 16:00 sloti bo‘shadi. Joylar soni cheklangan.",
    time: "4 kun oldin",
    status: "read",
    tone: "purple",
    label: "SM",
    priority: "O‘rta",
    action: "Slotni ko‘rish",
    channel: "Mentor",
  },
  {
    group: "Oldinroq",
    title: "Vocabulary review yakunlanmadi",
    text: "Academic verbs setida 14 ta so‘z qoldi. Bugungi study plan yakunlanishi uchun reviewni tugating.",
    time: "4 kun oldin",
    status: "read",
    tone: "orange",
    label: "VR",
    priority: "Past",
    action: "Davom etish",
    channel: "Study plan",
  },
  {
    group: "Oldinroq",
    title: "Yangi B2 listening resursi qo‘shildi",
    text: "Fast speech and connected sounds audiosi listening bo‘limida mavjud.",
    time: "5 kun oldin",
    status: "read",
    tone: "blue",
    label: "L",
    priority: "Past",
    action: "Resurs",
    channel: "Kutubxona",
  },
  {
    group: "Oldinroq",
    title: "Mock test natijasi saqlandi",
    text: "Reading mini mock natijangiz 68%. Matching headings bo‘yicha qo‘shimcha mashq tavsiya qilindi.",
    time: "5 kun oldin",
    status: "read",
    tone: "green",
    label: "MT",
    priority: "O‘rta",
    action: "Natija",
    channel: "Test markazi",
  },
  {
    group: "Oldinroq",
    title: "Account xavfsizlik tekshiruvi",
    text: "Email va telefon tasdiqlangan. Parolni yangilash tavsiya etiladi.",
    time: "6 kun oldin",
    status: "read",
    tone: "pink",
    label: "AC",
    priority: "Past",
    action: "Profil",
    channel: "Account",
  },
  {
    group: "Oldinroq",
    title: "Mentor feedback arxivi yangilandi",
    text: "Oxirgi 3 ta essay feedback bir joyga jamlandi va writing progress kartasiga ulandi.",
    time: "6 kun oldin",
    status: "read",
    tone: "purple",
    label: "MF",
    priority: "Past",
    action: "Arxiv",
    channel: "Ustoz xabari",
  },
  {
    group: "Oldinroq",
    title: "Premium tarif imkoniyatlari ochiq",
    text: "AI Study Plan, mock analytics va writing feedback imkoniyatlari faol holatda.",
    time: "1 hafta oldin",
    status: "read",
    tone: "blue",
    label: "PR",
    priority: "Past",
    action: "Tarif",
    channel: "Billing",
  },
  {
    group: "Oldinroq",
    title: "C1 reading material tavsiya qilindi",
    text: "Long-form academic analysis materiali reading accuracy uchun mos deb belgilandi.",
    time: "1 hafta oldin",
    status: "read",
    tone: "orange",
    label: "C1",
    priority: "Past",
    action: "O‘qish",
    channel: "Resurslar",
  },
  {
    group: "Oldinroq",
    title: "Daily streak 10 kunga yetdi",
    text: "Ketma-ket o‘qish ritmingiz yaxshi. Bugungi plan bajarilsa streak 13 kunga chiqadi.",
    time: "1 hafta oldin",
    status: "read",
    tone: "green",
    label: "ST",
    priority: "Past",
    action: "Plan",
    channel: "Progress",
  },
  {
    group: "Oldinroq",
    title: "Platforma yangilanishi",
    text: "Resurslar sahifasiga A1, A2, B1, B2, C1, Listening va Podcast filterlari qo‘shildi.",
    time: "8 kun oldin",
    status: "read",
    tone: "pink",
    label: "UP",
    priority: "Past",
    action: "Ko‘rish",
    channel: "Yangilik",
  },
  {
    group: "Oldinroq",
    title: "IELTS goal qayta hisoblandi",
    text: "7.5 maqsad uchun study plan 42 kunlik sprint sifatida optimallashtirildi.",
    time: "9 kun oldin",
    status: "read",
    tone: "blue",
    label: "G",
    priority: "O‘rta",
    action: "Reja",
    channel: "AI tavsiya",
  },
];

const groups: NotificationGroup[] = ["Bugun", "Kecha", "Oldinroq"];
const NOTIFICATIONS_PER_PAGE = 10;

function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const unreadCount = notifications.filter((notification) => notification.status === "new").length;
  const highPriorityCount = notifications.filter((notification) => notification.priority === "Yuqori").length;
  const totalPages = Math.ceil(notifications.length / NOTIFICATIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
  const visibleNotifications = useMemo(() => {
    return notifications.slice(startIndex, startIndex + NOTIFICATIONS_PER_PAGE);
  }, [startIndex]);
  const visibleStart = startIndex + 1;
  const visibleEnd = Math.min(startIndex + NOTIFICATIONS_PER_PAGE, notifications.length);

  function goToPage(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  return (
    <section className="user-page notifications-page">
      <div className="user-page-header notifications-hero">
        <div>
          <span>Bildirishnomalar</span>
          <h1>Premium notification center</h1>
          <p>Dars, test, mentor feedback, AI reja, to‘lov va progress xabarlarini bitta joyda nazorat qiling.</p>
        </div>

        <div className="notifications-hero__stats">
          <div>
            <span>Yangi</span>
            <strong>{unreadCount}</strong>
          </div>
          <div>
            <span>Muhim</span>
            <strong>{highPriorityCount}</strong>
          </div>
          <div>
            <span>Jami</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>
      </div>

      <div className="notifications-toolbar">
        <div>
          <span>Priority inbox</span>
          <strong>{unreadCount} ta yangi xabar sizni kutyapti</strong>
        </div>
        <small>{visibleStart}-{visibleEnd} / {notifications.length} xabar</small>
      </div>

      {groups.map((group) => {
        const groupNotifications = visibleNotifications.filter((notification) => notification.group === group);

        if (groupNotifications.length === 0) {
          return null;
        }

        return (
          <section className="notification-group" key={group}>
            <div className="notification-group__header">
              <h2>{group}</h2>
              <span>{groupNotifications.length} ta xabar</span>
            </div>

            <div className="notification-list notification-list--premium">
              {groupNotifications.map((notification) => (
                <NotificationCard notification={notification} key={`${notification.title}-${notification.time}`} />
              ))}
            </div>
          </section>
        );
      })}

      {totalPages > 1 ? (
        <nav className="notifications-pagination" aria-label="Bildirishnomalar sahifalari">
          <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            Oldingi
          </button>

          <div>
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  className={page === currentPage ? "is-active" : ""}
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Keyingi
          </button>
        </nav>
      ) : null}
    </section>
  );
}

export default NotificationsPage;
