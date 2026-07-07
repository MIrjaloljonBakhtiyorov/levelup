import { useMemo, useState } from "react";

type ExamType = "IELTS" | "CEFR" | "TOEFL" | "SAT";

type SkillType =
  | "Listening"
  | "Reading"
  | "Writing"
  | "Speaking"
  | "Grammar"
  | "Vocabulary"
  | "Math";

type Mentor = {
  id: number;
  initials: string;
  fullName: string;
  examType: ExamType;
  verified: boolean;
  scoreLabel: string;
  experienceYears: number;
  rating: number;
  studentsCount: number;
  lessonsCount: number;
  topSkill: SkillType;
  title: string;
  description: string;
  price: number;
  discountPercent?: number;
  nextSlots: string[];
  online: boolean;
  premium: boolean;
  bio: string;
  certificates: string[];
};

type ExamFilter = ExamType | "Barchasi";

const examFilters: ExamFilter[] = ["Barchasi", "IELTS", "CEFR", "TOEFL", "SAT"];

const mentors: Mentor[] = [
  {
    id: 1,
    initials: "MU",
    fullName: "Madina Usmonova",
    examType: "IELTS",
    verified: true,
    scoreLabel: "8.0",
    experienceYears: 7,
    rating: 4.9,
    studentsCount: 124,
    lessonsCount: 320,
    topSkill: "Writing",
    title: "Writing bo‘yicha kuchli mentor",
    description: "1:1 dars, individual feedback va natijaga yo‘naltirilgan reja",
    price: 120000,
    discountPercent: 15,
    nextSlots: ["Bugun 18:00", "Ertaga 10:00", "Shanba 16:00"],
    online: true,
    premium: true,
    bio: "Madina IELTS Writing Task 1 va Task 2 bo‘yicha struktura, argument va band descriptor asosida ishlaydi.",
    certificates: ["IELTS 8.0", "TESOL", "Writing Assessment"],
  },
  {
    id: 2,
    initials: "JM",
    fullName: "Jasur Mirzayev",
    examType: "CEFR",
    verified: true,
    scoreLabel: "C1",
    experienceYears: 5,
    rating: 4.8,
    studentsCount: 98,
    lessonsCount: 260,
    topSkill: "Listening",
    title: "Listening strategiyasi bo‘yicha mentor",
    description: "CEFR listening practice, note-taking va xato tahlili bilan ishlaydi",
    price: 90000,
    discountPercent: 10,
    nextSlots: ["Bugun 20:00", "Juma 15:00"],
    online: true,
    premium: false,
    bio: "Jasur CEFR B2-C1 listening savollarida signal words, distractor va timing ustida aniq reja beradi.",
    certificates: ["CEFR C1", "Teacher Training", "Listening Coach"],
  },
  {
    id: 3,
    initials: "DK",
    fullName: "Dilnoza Karimova",
    examType: "TOEFL",
    verified: true,
    scoreLabel: "110",
    experienceYears: 8,
    rating: 5,
    studentsCount: 146,
    lessonsCount: 410,
    topSkill: "Reading",
    title: "TOEFL Reading bo‘yicha premium mentor",
    description: "Academic passages, inference va vocabulary questions bo‘yicha amaliy yondashuv",
    price: 150000,
    discountPercent: 20,
    nextSlots: ["Payshanba 19:00", "Shanba 11:00"],
    online: false,
    premium: true,
    bio: "Dilnoza TOEFL Reading natijasini oshirish uchun passage mapping, speed reading va savol turlarini ajratib o‘rgatadi.",
    certificates: ["TOEFL 110", "Academic Reading", "ETS Workshop"],
  },
  {
    id: 4,
    initials: "AK",
    fullName: "Aziza Karimova",
    examType: "SAT",
    verified: true,
    scoreLabel: "1450",
    experienceYears: 6,
    rating: 4.7,
    studentsCount: 82,
    lessonsCount: 210,
    topSkill: "Reading",
    title: "SAT Reading va evidence savollari mentori",
    description: "Passage analysis, evidence questions va pacing bo‘yicha kuchli metodika",
    price: 130000,
    discountPercent: 12,
    nextSlots: ["Dushanba 17:00", "Yakshanba 12:00"],
    online: false,
    premium: false,
    bio: "Aziza SAT Reading bo‘yicha dalil topish, uzun matnni tez ajratish va xatolar jurnalini yuritishga yordam beradi.",
    certificates: ["SAT 1450", "Reading Specialist", "College Prep"],
  },
  {
    id: 5,
    initials: "FR",
    fullName: "Farrux Rahimov",
    examType: "IELTS",
    verified: true,
    scoreLabel: "8.5",
    experienceYears: 9,
    rating: 4.9,
    studentsCount: 171,
    lessonsCount: 520,
    topSkill: "Speaking",
    title: "Speaking confidence va fluency mentori",
    description: "Part 2 cue card, pronunciation va natural response bo‘yicha jonli coaching",
    price: 160000,
    discountPercent: 18,
    nextSlots: ["Bugun 21:00", "Shanba 16:00"],
    online: true,
    premium: true,
    bio: "Farrux IELTS Speaking uchun fluency, lexical resource va real exam simulation orqali tayyorlaydi.",
    certificates: ["IELTS 8.5", "Speaking Examiner Training", "CELTA"],
  },
  {
    id: 6,
    initials: "SE",
    fullName: "Shahlo Ergasheva",
    examType: "IELTS",
    verified: true,
    scoreLabel: "8.0",
    experienceYears: 6,
    rating: 4.8,
    studentsCount: 112,
    lessonsCount: 285,
    topSkill: "Reading",
    title: "Reading speed va accuracy mentori",
    description: "Skimming, scanning va true/false/not given savollarida aniq taktika",
    price: 110000,
    nextSlots: ["Ertaga 09:00", "Juma 18:00"],
    online: true,
    premium: false,
    bio: "Shahlo IELTS Reading bo‘yicha vaqtni boshqarish va savol turlarini tez tanish strategiyasini beradi.",
    certificates: ["IELTS 8.0", "Reading Strategy", "Lesson Design"],
  },
  {
    id: 7,
    initials: "BA",
    fullName: "Bekzod Aliyev",
    examType: "CEFR",
    verified: false,
    scoreLabel: "C1",
    experienceYears: 4,
    rating: 4.6,
    studentsCount: 76,
    lessonsCount: 190,
    topSkill: "Grammar",
    title: "Grammar foundation va CEFR accuracy mentori",
    description: "B1-C1 grammar, sentence transformation va writing accuracy bo‘yicha reja",
    price: 80000,
    nextSlots: ["Bugun 16:00", "Payshanba 14:00"],
    online: true,
    premium: false,
    bio: "Bekzod grammar xatolarini tizimli tahlil qiladi va CEFR writing uchun aniq strukturalar beradi.",
    certificates: ["CEFR C1", "Grammar Intensive", "Teaching Grammar"],
  },
  {
    id: 8,
    initials: "KS",
    fullName: "Kamola Saidova",
    examType: "TOEFL",
    verified: true,
    scoreLabel: "108",
    experienceYears: 7,
    rating: 4.9,
    studentsCount: 134,
    lessonsCount: 360,
    topSkill: "Speaking",
    title: "TOEFL Speaking response mentori",
    description: "Independent va integrated speaking uchun template, timing va pronunciation",
    price: 140000,
    discountPercent: 10,
    nextSlots: ["Ertaga 19:00", "Yakshanba 10:00"],
    online: false,
    premium: true,
    bio: "Kamola TOEFL Speaking javoblarini aniq strukturaga soladi, recording feedback va pacing bilan ishlaydi.",
    certificates: ["TOEFL 108", "Speaking Coach", "Academic English"],
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("uz-UZ").format(price);
}

function MentorCard({
  mentor,
  onOpenProfile,
  onBook,
}: {
  mentor: Mentor;
  onOpenProfile: (mentor: Mentor) => void;
  onBook: (mentor: Mentor) => void;
}) {
  const secondarySlots = mentor.nextSlots.slice(1);

  return (
    <article className={`mentor-market-card mentor-market-card--${mentor.examType.toLowerCase()}`}>
      <div className="mentor-market-card__top">
        <span className="mentor-exam-badge">{mentor.examType}</span>
        <div>
          {mentor.verified ? <span className="mentor-verified-badge">Tasdiqlangan</span> : null}
          {mentor.discountPercent ? <span className="mentor-discount-badge">-{mentor.discountPercent}%</span> : null}
        </div>
      </div>

      <div className="mentor-market-card__identity">
        <span className="mentor-market-card__avatar">
          {mentor.initials}
          <i className={mentor.online ? "is-online" : ""} aria-hidden="true" />
        </span>
        <div>
          <h3>{mentor.fullName}</h3>
          <p>
            {mentor.examType} {mentor.scoreLabel} · {mentor.experienceYears} yil tajriba
          </p>
          <small>
            {mentor.rating.toFixed(1)} reyting · {mentor.studentsCount} o‘quvchi · {mentor.lessonsCount} dars
          </small>
        </div>
      </div>

      <div className="mentor-market-card__highlight">
        <span>{mentor.scoreLabel}</span>
        <div>
          <strong>{mentor.title}</strong>
          <p>{mentor.description}</p>
        </div>
      </div>

      <div className="mentor-market-card__meta">
        <span>Skill: <strong>{mentor.topSkill}</strong></span>
        <span>Tajriba: <strong>{mentor.experienceYears} yil</strong></span>
        <span>O‘quvchi: <strong>{mentor.studentsCount}</strong></span>
        <span>Dars: <strong>{mentor.lessonsCount}</strong></span>
      </div>

      <div className="mentor-market-card__booking">
        <div>
          <span>Narx</span>
          <strong>{formatPrice(mentor.price)} so‘m / dars</strong>
        </div>
        <div>
          <span>Keyingi bo‘sh vaqt</span>
          <strong>{mentor.nextSlots[0]}</strong>
        </div>
      </div>

      {secondarySlots.length > 0 ? (
        <div className="mentor-market-card__slots">
          {secondarySlots.map((slot) => <span key={slot}>{slot}</span>)}
        </div>
      ) : null}

      <div className="mentor-market-card__actions">
        <button type="button" className="mentor-secondary-btn" onClick={() => onOpenProfile(mentor)}>
          Profil
        </button>
        <button type="button" className="mentor-primary-btn" onClick={() => onBook(mentor)}>
          Darsga yozilish
        </button>
      </div>
    </article>
  );
}

function MentorProfileModal({
  mentor,
  onClose,
  onBook,
}: {
  mentor: Mentor;
  onClose: () => void;
  onBook: (mentor: Mentor) => void;
}) {
  return (
    <div className="mentor-modal" role="presentation">
      <button className="mentor-modal__backdrop" type="button" aria-label="Modalni yopish" onClick={onClose} />
      <section className="mentor-modal__panel" role="dialog" aria-modal="true" aria-labelledby="mentor-modal-title">
        <button className="mentor-modal__close" type="button" aria-label="Yopish" onClick={onClose}>
          ×
        </button>

        <div className="mentor-modal__header">
          <span className="mentor-modal__avatar">{mentor.initials}</span>
          <div>
            <div className="mentor-modal__badges">
              {mentor.verified ? <span className="mentor-verified-badge">Tasdiqlangan</span> : null}
              <span className="mentor-exam-badge">{mentor.examType}</span>
            </div>
            <h2 id="mentor-modal-title">{mentor.fullName}</h2>
            <p>{mentor.examType} {mentor.scoreLabel} · {mentor.experienceYears} yil tajriba</p>
          </div>
        </div>

        <div className="mentor-modal__stats">
          <span><strong>{mentor.rating.toFixed(1)}</strong> reyting</span>
          <span><strong>{mentor.studentsCount}</strong> o‘quvchi</span>
          <span><strong>{mentor.lessonsCount}</strong> dars</span>
        </div>

        <div className="mentor-modal__section">
          <h3>Mentor haqida</h3>
          <p>{mentor.bio}</p>
        </div>

        <div className="mentor-modal__section">
          <h3>Kuchli skilllar</h3>
          <div className="mentor-modal__pills">
            <span>{mentor.topSkill}</span>
            <span>{mentor.title}</span>
          </div>
        </div>

        <div className="mentor-modal__section">
          <h3>Sertifikatlar</h3>
          <div className="mentor-modal__pills">
            {mentor.certificates.map((certificate) => <span key={certificate}>{certificate}</span>)}
          </div>
        </div>

        <div className="mentor-modal__section">
          <h3>Yaqin slotlar</h3>
          <div className="mentor-modal__pills">
            {mentor.nextSlots.map((slot) => <span key={slot}>{slot}</span>)}
          </div>
        </div>

        <div className="mentor-modal__footer">
          <div>
            <span>Narx</span>
            <strong>{formatPrice(mentor.price)} so‘m / dars</strong>
          </div>
          <button type="button" className="mentor-primary-btn" onClick={() => onBook(mentor)}>
            Darsga yozilish
          </button>
        </div>
      </section>
    </div>
  );
}

function MentorsPage() {
  const [activeExam, setActiveExam] = useState<ExamFilter>("Barchasi");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");

  const filteredMentors = useMemo(
    () =>
      mentors.filter((mentor) => {
        return activeExam === "Barchasi" || mentor.examType === activeExam;
      }),
    [activeExam],
  );

  const handleBook = (mentor: Mentor) => {
    setBookingMessage(`${mentor.fullName} bilan darsga yozilish tanlandi.`);
  };

  return (
    <section className="user-page mentors-page mentors-marketplace-page">
      <div className="mentors-premium-hero">
        <div className="mentors-premium-hero__content">
          <span>Ustozlar / Mentorlar</span>
          <h1>Ustozlar / Mentorlar</h1>
          <p>
            Maqsadingizga mos mentorni tanlang. IELTS, CEFR, TOEFL va SAT bo‘yicha tajribali
            ustozlar bilan jonli darslarga yoziling.
          </p>
        </div>
        <div className="mentors-premium-hero__stats">
          <div><strong>24</strong><span>ta mentor</span></div>
          <div><strong>1 200+</strong><span>jonli dars</span></div>
          <div><strong>4.8</strong><span>o‘rtacha reyting</span></div>
        </div>
      </div>

      <div className="mentor-filter-panel">
        <div className="mentor-filter-panel__group">
          <span>Imtihon</span>
          <div>
            {examFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={activeExam === filter ? "is-active" : ""}
                onClick={() => setActiveExam(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

      </div>

      {bookingMessage ? <div className="mentor-booking-message">{bookingMessage}</div> : null}

      {filteredMentors.length > 0 ? (
        <div className="mentor-market-grid">
          {filteredMentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onOpenProfile={setSelectedMentor}
              onBook={handleBook}
            />
          ))}
        </div>
      ) : (
        <article className="mentor-empty-state">
          <span>0</span>
          <h3>Siz tanlagan filter bo‘yicha mentor topilmadi.</h3>
          <p>Filterlarni o‘zgartirib qayta urinib ko‘ring.</p>
        </article>
      )}

      {selectedMentor ? (
        <MentorProfileModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onBook={handleBook}
        />
      ) : null}
    </section>
  );
}

export default MentorsPage;
