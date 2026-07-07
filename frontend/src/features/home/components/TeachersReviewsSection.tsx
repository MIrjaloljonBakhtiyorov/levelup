import "./TeachersReviewsSection.css";

type Teacher = {
  id: number;
  name: string;
  subject: string;
  score: string;
  experience: string;
  initials: string;
  accent: string;
  image: string;
};

type CourseReview = {
  id: number;
  name: string;
  course: string;
  quote: string;
  result: string;
  initials: string;
};

const teachers: Teacher[] = [
  {
    id: 1,
    name: "Aziza Karimova",
    subject: "IELTS Speaking",
    score: "8.5 IELTS",
    experience: "6 yil tajriba",
    initials: "AK",
    accent: "blue",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: 2,
    name: "Jahongir Rustamov",
    subject: "Multilevel C1",
    score: "C2 daraja",
    experience: "8 yil tajriba",
    initials: "JR",
    accent: "green",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: 3,
    name: "Madina Sobirova",
    subject: "Writing Task 2",
    score: "9.0 Writing",
    experience: "5 yil tajriba",
    initials: "MS",
    accent: "purple",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: 4,
    name: "Sardor Aliyev",
    subject: "TOEFL Reading",
    score: "115 TOEFL",
    experience: "7 yil tajriba",
    initials: "SA",
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&q=80",
  },
  {
    id: 5,
    name: "Nilufar Tursunova",
    subject: "Grammar C1",
    score: "Advanced",
    experience: "9 yil tajriba",
    initials: "NT",
    accent: "teal",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80",
  },
];

const reviews: CourseReview[] = [
  {
    id: 1,
    name: "Nodirbek L.",
    course: "IELTS Intensive",
    quote:
      "Darslar tartibli, feedback aniq. Writing bo‘yicha qayerda xato qilayotganimni tez tushundim.",
    result: "6.0 dan 7.5 gacha",
    initials: "NL",
  },
  {
    id: 2,
    name: "Sevinch M.",
    course: "Multilevel C1",
    quote:
      "Mock testlar va o‘qituvchi tavsiyalari imtihon formatiga ko‘nikishimga juda yordam berdi.",
    result: "B2 dan C1 gacha",
    initials: "SM",
  },
  {
    id: 3,
    name: "Davron K.",
    course: "TOEFL Preparation",
    quote:
      "Reading strategiyalari va vaqt bilan ishlash bo‘yicha mashqlar natijamni ancha oshirdi.",
    result: "92 dan 108 gacha",
    initials: "DK",
  },
];

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <article className={`teacher-card teacher-card--${teacher.accent}`}>
      <div className="teacher-card__photo">
        <img src={teacher.image} alt={teacher.name} loading="lazy" />
        <span>{teacher.initials}</span>
      </div>

      <div className="teacher-card__body">
        <strong>{teacher.name}</strong>
        <span>{teacher.subject}</span>
      </div>

      <div className="teacher-card__meta">
        <span>{teacher.score}</span>
        <span>{teacher.experience}</span>
      </div>

      <button type="button">Profilni ko‘rish</button>
    </article>
  );
}

function ReviewCard({ review }: { review: CourseReview }) {
  return (
    <article className="course-review-card">
      <div className="course-review-card__top">
        <div className="course-review-card__avatar">{review.initials}</div>

        <div>
          <strong>{review.name}</strong>
          <span>{review.course}</span>
        </div>
      </div>

      <p>“{review.quote}”</p>

      <div className="course-review-card__result">
        <span>Natija</span>
        <strong>{review.result}</strong>
      </div>
    </article>
  );
}

function TeachersReviewsSection() {
  return (
    <section className="teachers-reviews-section" id="teachers">
      <div className="teachers-reviews-section__container">
        <header className="teachers-reviews-section__heading">
          <span>O‘qituvchilar va fikrlar</span>
        
        </header>

        <div className="teachers-reviews-section__panels">
          <div className="teachers-panel">
            <div className="teachers-panel__heading">
              <span>Teacherlar</span>
              <h3>Tekshirilgan o‘qituvchilar</h3>
            </div>

            <div className="teachers-strip" aria-label="O‘qituvchilar">
              <div className="teachers-strip__track">
                {[...teachers, ...teachers].map((teacher, index) => (
                  <TeacherCard
                    key={`${teacher.id}-${index}`}
                    teacher={teacher}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="reviews-panel">
            <div className="course-reviews">
              <div className="course-reviews__intro">
                <span>Kurs haqida fikrlar</span>
                <h3>O‘quvchilarimiz nima deydi?</h3>
              </div>

              <div
                className="course-reviews__viewport"
                aria-label="O‘quvchilar fikri"
              >
                <div className="course-reviews__track">
                  {[...reviews, ...reviews].map((review, index) => (
                    <ReviewCard
                      key={`${review.id}-${index}`}
                      review={review}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TeachersReviewsSection;
