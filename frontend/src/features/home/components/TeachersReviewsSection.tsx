import "./TeachersReviewsSection.css";
import { useEffect, useRef, useState } from "react";
import { useHomeI18n } from "../i18n/HomeI18n";

type Teacher = {
  id: number;
  name: string;
  exam: "IELTS" | "CEFR" | "SAT" | "TOEFL";
  reading: string;
  listening: string;
  speaking: string;
  writing: string;
  skillLabels?: [string, string, string, string];
  overall: string;
  level: string;
  experience: string;
  initials: string;
  accent: string;
  image: string;
  imagePosition?: string;
  imageScale?: number;
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
    name: "Sulaymonova Gulbahor Umarovna",
    exam: "IELTS",
    reading: "8.0", listening: "8.5", speaking: "8.5", writing: "8.0",
    overall: "8.5", level: "IELTS Instructor",
    experience: "6 years experience",
    initials: "SG",
    accent: "blue",
    image: "/images/teachers/gulbahor-sulaymonova.jpg",
  },
  {
    id: 2,
    name: "Mirjalol Bakhtiyorov Alishervich",
    exam: "IELTS",
    reading: "8.0", listening: "8.0", speaking: "7.5", writing: "8.0",
    overall: "8.0", level: "IELTS Instructor",
    experience: "8 years experience",
    initials: "MB",
    accent: "green",
    image: "/images/teachers/mirjalol-bakhtiyorov.jpg",
  },
  {
    id: 3,
    name: "Karimov Islom Siroch o‘g‘li",
    exam: "SAT",
    reading: "750", listening: "720", speaking: "—", writing: "—",
    skillLabels: ["Grammar", "Math", "Speaking", "Writing"],
    overall: "1470", level: "SAT Instructor",
    experience: "5 years experience",
    initials: "IK",
    accent: "purple",
    image: "/images/teachers/islom-karimov.jpg",
  },
  {
    id: 4,
    name: "Tatyana Alexandarova Aleksovich",
    exam: "TOEFL",
    reading: "30", listening: "29", speaking: "28", writing: "28",
    overall: "115", level: "Advanced",
    experience: "7 years experience",
    initials: "TA",
    accent: "orange",
    image: "/images/teachers/tatyana-alexandarova.jpg",
    imagePosition: "center top",
    imageScale: 1.18,
  },
  {
    id: 5,
    name: "Roza Vitanov Sheyvich",
    exam: "CEFR",
    reading: "72", listening: "74", speaking: "70", writing: "69",
    overall: "71.3 · C1", level: "CEFR Mentor",
    experience: "9 years experience",
    initials: "RV",
    accent: "teal",
    image: "/images/teachers/roza-vitanov.jpg",
    imagePosition: "center top",
  },
];

const reviews: CourseReview[] = [
  {
    id: 1,
    name: "Nodirbek L.",
    course: "IELTS Intensive",
    quote:
      "Before joining the platform, I repeated the same Writing mistakes without understanding why. The structured lessons, detailed teacher comments and weekly progress reports helped me improve every criterion and write with confidence under exam conditions.",
    result: "6.0 to 7.5",
    initials: "NL",
  },
  {
    id: 2,
    name: "Sevinch M.",
    course: "Multilevel C1",
    quote:
      "The CEFR mock tests felt very close to the real exam, so I learned to manage both time and pressure. My mentor used my analytics to build a personal study plan, and every week I could clearly see which skills were improving.",
    result: "B2 to C1",
    initials: "SM",
  },
  {
    id: 3,
    name: "Davron K.",
    course: "TOEFL Preparation",
    quote:
      "I used to run out of time in TOEFL Reading and lose easy points in Listening. The platform taught me practical strategies, gave me realistic timed practice and explained every error, which made my final result much stronger.",
    result: "92 to 108",
    initials: "DK",
  },
  {
    id: 4,
    name: "Malika R.",
    course: "IELTS Speaking",
    quote: "Speaking simulations on the platform felt like sitting in front of a real examiner. Personal feedback on pronunciation, fluency and vocabulary removed my fear of speaking, and within a few weeks my answers became clearer and more natural.",
    result: "6.5 to 8.0",
    initials: "MR",
  },
  {
    id: 5,
    name: "Azizbek T.",
    course: "SAT Preparation",
    quote: "The SAT dashboard showed exactly which question types were costing me the most points. Instead of solving random tests, I followed a focused plan for Grammar and Math, reviewed every mistake and entered the exam with a clear strategy.",
    result: "1210 to 1460",
    initials: "AT",
  },
  {
    id: 6,
    name: "Shahnoza A.",
    course: "CEFR Multilevel",
    quote: "What I valued most was the balance between clear explanations and practical exercises. After every mock test, my teacher gave specific recommendations, and the platform turned them into daily tasks that steadily moved me from B1 to C1.",
    result: "B1 to C1",
    initials: "SA",
  },
  {
    id: 7,
    name: "Javohir S.",
    course: "TOEFL Preparation",
    quote: "The platform made consistent preparation possible even with my busy schedule. Short daily tasks, progress tracking and realistic mock exams kept me motivated, while my mentor helped me fix weaknesses before they became habits.",
    result: "84 to 112",
    initials: "JS",
  },
  {
    id: 8,
    name: "Mohira N.",
    course: "IELTS Intensive",
    quote: "Lessons, homework, teacher feedback and test results are all organized in one place, so I never felt lost during preparation. The clear roadmap helped me study independently while still receiving professional support whenever I needed it.",
    result: "5.5 to 7.0",
    initials: "MN",
  },
];

const reviewStats = [
  { startValue: 12500, target: 13167, suffix: "+", duration: 60000, label: "Active students" },
  { target: 4.9, suffix: "/5", decimals: 1, label: "Average rating" },
  { target: 94, suffix: "%", label: "Recommend us" },
  { target: 38, suffix: "", label: "Countries" },
];

function AnimatedStat({ target, suffix, decimals = 0, startValue = 0, duration = 1600 }: { target: number; suffix: string; decimals?: number; startValue?: number; duration?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(startValue);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || started) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.45 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(startValue + (target - startValue) * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, started, startValue, target]);

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString("en-US");

  return <strong ref={ref}>{formatted}{suffix}</strong>;
}

function TeacherCard({ teacher, active, onSelect }: { teacher: Teacher; active: boolean; onSelect: () => void }) {
  const { t } = useHomeI18n();
  const labels = teacher.skillLabels ?? ["Reading", "Listening", "Speaking", "Writing"];
  const scores = [teacher.reading, teacher.listening, teacher.speaking, teacher.writing]
    .map((score, index) => ({ label: labels[index], score }))
    .filter((item) => item.score !== "—");

  return (
    <article
      className={`teacher-card teacher-card--${teacher.accent}${active ? " teacher-card--active" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
      role="button"
      tabIndex={0}
      aria-pressed={active}
    >
      <div className="teacher-card__premium"><span>◆</span> PREMIUM MENTOR</div>
      <div className="teacher-card__photo">
        <img
          src={teacher.image}
          alt={teacher.name}
          loading="lazy"
          style={{
            objectPosition: teacher.imagePosition ?? "center 22%",
            transform: teacher.imageScale ? `scale(${teacher.imageScale})` : undefined,
            transformOrigin: teacher.imageScale ? "center top" : undefined,
          }}
        />
        <span>{teacher.initials}</span>
      </div>

      <div className="teacher-card__body">
        <strong>{teacher.name}</strong>
        <span className="teacher-card__exam">{teacher.exam}</span>
      </div>

      <div className={`teacher-card__scores teacher-card__scores--${scores.length}`}>
        {scores.map((item) => (
          <div key={item.label}><span>{item.label}</span><strong>{item.score}</strong></div>
        ))}
      </div>

      <div className="teacher-card__summary">
        <div><span>Overall</span><strong>{teacher.overall}</strong></div>
        <div><span>Level</span><strong>{teacher.level}</strong></div>
      </div>

      <div className="teacher-card__experience">
        <span>✦</span> {t(teacher.experience)}
      </div>

      <button type="button">{t("View Profile")}</button>
    </article>
  );
}

function ReviewCard({ review }: { review: CourseReview }) {
  const { t } = useHomeI18n();

  return (
    <article className="course-review-card">
      <div className="course-review-card__top">
        <div className="course-review-card__avatar">
          <img
            src={`/images/students/student-${review.id}.jpg`}
            alt={review.name}
            loading="lazy"
          />
        </div>

        <div>
          <strong>{review.name}</strong>
          <span>{t(review.course)}</span>
        </div>
      </div>

      <p>"{t(review.quote)}"</p>

      <div className="course-review-card__result">
        <span>{t("Result")}</span>
        <strong>{review.result}</strong>
      </div>
    </article>
  );
}

function TeachersReviewsSection() {
  const { t } = useHomeI18n();
  const [activeTeacher, setActiveTeacher] = useState<string | null>(null);

  return (
    <section className="teachers-reviews-section" id="teachers">
      <div className="teachers-reviews-section__container">
        <header className="teachers-reviews-section__heading">
          <span>{t("Teachers & Reviews")}</span>
        </header>

        <div className="teachers-reviews-section__panels">
          <div className="teachers-panel">
            <div className="teachers-panel__heading">
              <span>{t("Our Teachers")}</span>
            </div>

            <div className="teachers-strip" aria-label="Teachers">
              <div className="teachers-strip__track">
                {[...teachers, ...teachers].map((teacher, index) => (
                  <TeacherCard
                    key={`${teacher.id}-${index}`}
                    teacher={teacher}
                    active={activeTeacher === `${teacher.id}-${index}`}
                    onSelect={() => setActiveTeacher(`${teacher.id}-${index}`)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="reviews-panel">
            <div className="course-reviews">
              <div className="course-reviews__intro">
                <span>{t("Student Reviews")}</span>
                <h3>{t("What our students say")}</h3>
                <p>Real results from students who reached their goals with our platform.</p>
                <div className="course-reviews__stats">
                  {reviewStats.map((stat) => (
                    <div key={stat.label}>
                      <AnimatedStat
                        target={stat.target}
                        suffix={stat.suffix}
                        decimals={stat.decimals}
                        startValue={stat.startValue}
                        duration={stat.duration}
                      />
                      <small>{stat.label}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="course-reviews__viewport"
                aria-label="Student reviews"
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
