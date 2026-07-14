import type { ReactNode } from "react";

export type Tone = "blue" | "purple" | "green" | "orange" | "pink" | "red";

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, disabled = false, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`user-btn user-btn--${variant}`} disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`user-badge user-badge--${tone}`}>{children}</span>;
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: Tone }) {
  return (
    <div className="user-progress" aria-label={`${value}% progress`}>
      <span className={`user-progress__fill user-progress__fill--${tone}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <article className="user-empty-state">
      <span className="user-empty-state__icon">LU</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function StatCard({
  label,
  value,
  caption,
  tone = "blue",
}: {
  label: string;
  value: string;
  caption: string;
  tone?: Tone;
}) {
  return (
    <article className={`user-stat user-stat--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </article>
  );
}

export function ProgressCard({
  title,
  value,
  caption,
  tone = "blue",
}: {
  title: string;
  value: number;
  caption: string;
  tone?: Tone;
}) {
  return (
    <article className="user-card user-progress-card">
      <div>
        <span>{title}</span>
        <strong>{value}%</strong>
      </div>
      <ProgressBar value={value} tone={tone} />
      <p>{caption}</p>
    </article>
  );
}

export type LessonCardData = {
  id: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  mentor: string;
  mentorPhotoUrl?: string;
  progress: number;
  tone: Tone;
  accent?: string;
  actionLabel?: string;
};

export function LessonCard({
  lesson,
  onStart,
}: {
  lesson: LessonCardData;
  onStart?: (lesson: LessonCardData) => void;
}) {
  const initials = lesson.mentor
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "LU";

  return (
    <article className="user-card lesson-card">
      <div className={`lesson-card__cover lesson-card__cover--${lesson.tone}`}>
        <div className="lesson-card__cover-main">
          <Badge tone={lesson.tone}>{lesson.category}</Badge>
          <strong>{lesson.accent ?? lesson.category.slice(0, 2)}</strong>
        </div>
        <span className="lesson-card__progress-ring">{lesson.progress}%</span>
      </div>

      <div className="lesson-card__body">
        <h3>{lesson.title}</h3>
        <p>{lesson.description}</p>
      </div>

      <div className="lesson-card__meta">
        <span><i aria-hidden="true">◆</i>{lesson.level}</span>
        <span><i aria-hidden="true">▶</i>{lesson.duration}</span>
        <span><i aria-hidden="true">★</i>{lesson.category}</span>
      </div>

      <div className="lesson-card__footer">
        <div className="lesson-card__mentor">
          {lesson.mentorPhotoUrl ? (
            <img src={lesson.mentorPhotoUrl} alt={lesson.mentor} />
          ) : (
            <span className="user-avatar user-avatar--small">{initials}</span>
          )}
          <div>
            <span>Mentor</span>
            <strong>{lesson.mentor}</strong>
          </div>
        </div>
        <div className="lesson-card__progress-copy">
          <span>Progress</span>
          <strong>{lesson.progress}%</strong>
        </div>
      </div>

      <ProgressBar value={lesson.progress} tone={lesson.tone} />
      <Button variant="secondary" onClick={() => onStart?.(lesson)}>
        {lesson.actionLabel ?? "Boshlash"}
      </Button>
    </article>
  );
}

export type CourseCardData = {
  id: string;
  title: string;
  description: string;
  skill: string;
  progress: number;
  score: string;
  nextLesson: string;
  teacher: string;
  teacherName: string;
  teacherPhotoUrl?: string;
  certificate: string;
  type: string;
  status: "studying" | "purchased" | "free" | "upcoming" | "live" | "completed";
  statusLabel: string;
  tone: Tone;
};

export function CourseCard({
  course,
  onAction,
}: {
  course: CourseCardData;
  onAction?: (course: CourseCardData) => void;
}) {
  return (
    <article className="user-card course-card">
      <div className={`course-card__cover course-card__cover--${course.tone}`}>
        <div>
          <span>{course.skill}</span>
          <small>{course.type}</small>
        </div>
        <strong>{course.skill.slice(0, 2).toUpperCase()}</strong>
      </div>
      <div className="course-card__body">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
      </div>
      <div className="course-card__details">
        <span><i aria-hidden="true">◆</i>{course.score}</span>
        <span><i aria-hidden="true">▶</i>{course.nextLesson}</span>
      </div>
      <div className="course-card__footer">
        <div className="course-card__teacher">
          {course.teacherPhotoUrl ? (
            <img src={course.teacherPhotoUrl} alt={course.teacherName} />
          ) : (
            <span className="user-avatar user-avatar--small">{course.teacher}</span>
          )}
          <div>
            <span>Mentor</span>
            <strong>{course.teacherName}</strong>
          </div>
        </div>
        <Badge tone={course.tone}>{course.statusLabel}</Badge>
      </div>
      <div className="course-card__progress-row">
        <span>Progress</span>
        <strong>{course.progress}%</strong>
      </div>
      <ProgressBar value={course.progress} tone={course.tone} />
      <Button onClick={() => onAction?.(course)}>
        {course.status === "completed" ? "Ko'rish" : "Davom ettirish"}
      </Button>
    </article>
  );
}

export type TeacherCardData = {
  name: string;
  level: string;
  category: "IELTS" | "CEFR" | "TOEFL" | "SAT";
  rating: string;
  overall: string;
  topSkill: string;
  experience: string;
  price: string;
  discount: string;
  slots: string[];
  tone: Tone;
};

export function TeacherCard({ teacher }: { teacher: TeacherCardData }) {
  const initials = teacher.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className={`user-card teacher-card teacher-card--${teacher.tone}`}>
      <div className="teacher-card__header">
        <div className="teacher-card__profile">
          <span className={`teacher-card__avatar teacher-card__avatar--${teacher.tone}`}>
            {initials}
            <i aria-hidden="true" />
          </span>
          <div className="teacher-card__identity">
            <span>Tasdiqlangan mentor</span>
            <h3>{teacher.name}</h3>
            <p>{teacher.level} · {teacher.experience} tajriba</p>
          </div>
        </div>
        <Badge tone={teacher.tone}>{teacher.category}</Badge>
      </div>

      <div className="teacher-card__spotlight">
        <span>{teacher.rating}</span>
        <div>
          <strong>{teacher.topSkill} bo‘yicha kuchli mentor</strong>
          <small>1:1 dars, individual feedback va natijaga yo‘naltirilgan reja</small>
        </div>
      </div>

      <dl className="teacher-card__details">
        <div className="teacher-card__detail--featured"><dt>Natija</dt><dd>{teacher.overall}</dd></div>
        <div><dt>Kuchli skill</dt><dd>{teacher.topSkill}</dd></div>
        <div><dt>Narx</dt><dd>{teacher.price}</dd></div>
        <div><dt>Chegirma</dt><dd>{teacher.discount}</dd></div>
      </dl>

      <div className="teacher-card__schedule">
        <div>
          <span>Yaqin slotlar</span>
          <strong>{teacher.slots.length} ta vaqt ochiq</strong>
        </div>
        <div className="teacher-card__slots">
          {teacher.slots.map((slot) => <span key={slot}>{slot}</span>)}
        </div>
      </div>

      <div className="teacher-card__actions">
        <Button variant="secondary">Profil</Button>
        <Button>Darsga yozilish</Button>
      </div>
    </article>
  );
}

export type TestCardData = {
  title: string;
  skills: string[];
  count: string;
  duration: string;
  result: string;
  tone: Tone;
};

export function TestCard({ test }: { test: TestCardData }) {
  return (
    <article className="user-card test-card">
      <div className={`test-card__icon test-card__icon--${test.tone}`}>{test.title.slice(0, 2)}</div>
      <h3>{test.title}</h3>
      <p>{test.skills.join(" · ")}</p>
      <div className="test-card__stats">
        <span>{test.count}</span>
        <span>{test.duration}</span>
        <span>{test.result}</span>
      </div>
      <Button>Testni boshlash</Button>
    </article>
  );
}

export type ResourceCardData = {
  category: string;
  title: string;
  level: string;
  duration: string;
  tone: Tone;
};

export function ResourceCard({ resource }: { resource: ResourceCardData }) {
  return (
    <article className="user-card resource-card">
      <div className={`resource-card__cover resource-card__cover--${resource.tone}`}>
        <span>{resource.category}</span>
        <button aria-label="Saqlash" type="button">+</button>
      </div>
      <h3>{resource.title}</h3>
      <p>{resource.level} · {resource.duration}</p>
      <Button variant="secondary">Ko‘rish</Button>
    </article>
  );
}

export type PricingCardData = {
  title: string;
  price: string;
  features: string[];
  active: boolean;
  tone: Tone;
};

export function PricingCard({ plan }: { plan: PricingCardData }) {
  return (
    <article className={`user-card pricing-card ${plan.active ? "pricing-card--active" : ""}`}>
      <div className="user-card__topline">
        <Badge tone={plan.tone}>{plan.active ? "Active" : "Upgrade"}</Badge>
      </div>
      <h3>{plan.title}</h3>
      <strong>{plan.price}</strong>
      <ul>
        {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
      </ul>
      <Button variant={plan.active ? "secondary" : "primary"}>{plan.active ? "Joriy tarif" : "Tanlash"}</Button>
    </article>
  );
}

export type NotificationCardData = {
  title: string;
  text: string;
  time: string;
  status: "new" | "read";
  tone: Tone;
  label?: string;
  priority?: "Yuqori" | "O‘rta" | "Past";
  action?: string;
  channel?: string;
};

export function NotificationCard({ notification }: { notification: NotificationCardData }) {
  return (
    <article className={`notification-card notification-card--${notification.status}`}>
      <span className={`notification-card__icon notification-card__icon--${notification.tone}`}>
        {notification.label ?? "i"}
      </span>
      <div className="notification-card__content">
        <div className="notification-card__topline">
          <span>{notification.channel ?? "Platforma"}</span>
          {notification.priority ? <strong>{notification.priority}</strong> : null}
        </div>
        <h3>{notification.title}</h3>
        <p>{notification.text}</p>
        <small>{notification.time}</small>
      </div>
      <Button variant={notification.status === "new" ? "secondary" : "ghost"}>
        {notification.action ?? (notification.status === "new" ? "Ochish" : "Ko‘rildi")}
      </Button>
    </article>
  );
}
