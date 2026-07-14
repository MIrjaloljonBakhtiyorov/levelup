import { type ClipboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import type { CourseLesson } from "../../admin/types/adminTypes";
import { getUserToken } from "../../auth/services/userSession";
import { Button, EmptyState, ProgressBar } from "../components/UserUI";
import {
  completeLesson,
  getCourseLearning,
  saveLessonNote,
  type LessonNote,
  type StartedCourse,
} from "../services/userCoursesApi";

type NotesForm = Pick<LessonNote, "grammar" | "important" | "vocabulary" | "personal">;

const emptyNotes: NotesForm = {
  grammar: "",
  important: "",
  vocabulary: "",
  personal: "",
};

const noteColors = ["#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const lessonsPerPage = 5;

function getCompletedLessonCount(progress: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(total, Math.max(0, Math.round((progress / 100) * total)));
}

function RichNoteEditor({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current || document.activeElement === editorRef.current) {
      return;
    }

    editorRef.current.innerHTML = value;
  }, [value]);

  function handleColor(color: string) {
    editorRef.current?.focus();
    document.execCommand("foreColor", false, color);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  return (
    <div className="rich-note-editor">
      <div className="rich-note-editor__topline">
        <span>{label}</span>
        <div aria-label={`${label} ranglari`} className="rich-note-editor__colors">
          {noteColors.map((color) => (
            <button
              aria-label={`${label} uchun rang ${color}`}
              key={color}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleColor(color)}
              style={{ backgroundColor: color }}
              type="button"
            />
          ))}
        </div>
      </div>
      <div
        className="rich-note-editor__field"
        contentEditable
        data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onPaste={handlePaste}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
      />
    </div>
  );
}

function getYoutubeEmbedUrl(videoUrl: string) {
  if (!videoUrl.trim()) {
    return "";
  }

  const buildEmbedUrl = (videoId: string) => {
    const params = new URLSearchParams({
      controls: "1",
      rel: "0",
      modestbranding: "1",
      iv_load_policy: "3",
      playsinline: "1",
      fs: "1",
      disablekb: "0",
      cc_load_policy: "0",
    });

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return buildEmbedUrl(url.pathname.slice(1));
    }

    if (host.includes("youtube.com")) {
      const videoId = url.searchParams.get("v") || url.pathname.split("/").pop();
      return videoId ? buildEmbedUrl(videoId) : videoUrl;
    }
  } catch {
    return videoUrl;
  }

  return videoUrl;
}

function isYoutubeVideo(videoUrl: string) {
  return /youtube\.com|youtu\.be/i.test(videoUrl);
}

function LessonVideo({ lesson }: { lesson: CourseLesson }) {
  if (!lesson.videoUrl) {
    return (
      <div className="lesson-player__empty-video">
        <span>LV</span>
        <h3>Video hali yuklanmagan</h3>
        <p>Admin bu dars uchun video link qo‘shsa, shu oynada avtomatik ko‘rinadi.</p>
      </div>
    );
  }

  if (isYoutubeVideo(lesson.videoUrl)) {
    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        src={getYoutubeEmbedUrl(lesson.videoUrl)}
        title={lesson.title}
      />
    );
  }

  return (
    <video controls playsInline src={lesson.videoUrl}>
      Brauzeringiz video playerni qo‘llab-quvvatlamaydi.
    </video>
  );
}

function LessonPlayerPage() {
  const navigate = useNavigate();
  const { courseId = "", lessonId } = useParams();
  const [course, setCourse] = useState<StartedCourse | null>(null);
  const [notes, setNotes] = useState<Record<string, NotesForm>>({});
  const [noteForm, setNoteForm] = useState<NotesForm>(emptyNotes);
  const [activeLessonId, setActiveLessonId] = useState(lessonId ?? "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonPage, setLessonPage] = useState(1);
  const [message, setMessage] = useState("");
  const [showCourseInfo, setShowCourseInfo] = useState(false);

  useEffect(() => {
    const token = getUserToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    getCourseLearning(token, courseId, lessonId)
      .then((result) => {
        const lessons = result.course.lessons ?? [];
        const firstLessonId = lessons[0]?.id ?? "";
        const completedCount = result.course.completedLessonIds?.length
          ?? getCompletedLessonCount(result.course.progress, lessons.length);
        const requestedLessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
        const unlockedLessonId = lessons[Math.min(completedCount, Math.max(lessons.length - 1, 0))]?.id ?? firstLessonId;
        const nextActiveLessonId =
          requestedLessonIndex > completedCount
            ? unlockedLessonId
            : lessonId || firstLessonId;

        setCourse(result.course);
        setActiveLessonId(nextActiveLessonId);
        setNotes(
          Object.fromEntries(
            result.notes.map((note) => [
              note.lessonId,
              {
                grammar: [note.grammar, note.important].filter(Boolean).join("<br>"),
                important: "",
                vocabulary: note.vocabulary,
                personal: "",
              },
            ]),
          ),
        );

        if ((!lessonId && firstLessonId) || requestedLessonIndex > completedCount) {
          navigate(`/user/courses/${courseId}/learn/${nextActiveLessonId}`, { replace: true });
        }

        setMessage("");
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Darsni yuklab bo'lmadi");
      })
      .finally(() => setLoading(false));
  }, [courseId, lessonId, navigate]);

  const lessons = useMemo(() => course?.lessons ?? [], [course]);
  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0],
    [activeLessonId, lessons],
  );
  const completedLessonCount = useMemo(
    () => course?.completedLessonIds?.length ?? getCompletedLessonCount(course?.progress ?? 0, lessons.length),
    [course?.completedLessonIds?.length, course?.progress, lessons.length],
  );
  const activeLessonIndex = useMemo(
    () => lessons.findIndex((lesson) => lesson.id === activeLesson?.id),
    [activeLesson, lessons],
  );
  const isActiveLessonCompleted = activeLessonIndex >= 0 && activeLessonIndex < completedLessonCount;
  const totalLessonPages = Math.max(1, Math.ceil(lessons.length / lessonsPerPage));
  const lessonPageStart = (lessonPage - 1) * lessonsPerPage;
  const visibleLessons = useMemo(
    () => lessons.slice(lessonPageStart, lessonPageStart + lessonsPerPage),
    [lessonPageStart, lessons],
  );

  useEffect(() => {
    if (!activeLesson) {
      setNoteForm(emptyNotes);
      return;
    }

    setNoteForm(notes[activeLesson.id] ?? emptyNotes);
  }, [activeLesson, notes]);

  useEffect(() => {
    if (activeLessonIndex < 0) {
      return;
    }

    setLessonPage(Math.floor(activeLessonIndex / lessonsPerPage) + 1);
  }, [activeLessonIndex]);

  function handleSelectLesson(nextLesson: CourseLesson) {
    const nextLessonIndex = lessons.findIndex((lesson) => lesson.id === nextLesson.id);

    if (nextLessonIndex > completedLessonCount) {
      setMessage("Avval oldingi darsni tugating, keyin keyingi dars ochiladi.");
      return;
    }

    setActiveLessonId(nextLesson.id);
    navigate(`/user/courses/${courseId}/learn/${nextLesson.id}`);
  }

  async function handleSaveNotes() {
    const token = getUserToken();

    if (!token || !activeLesson) {
      return;
    }

    setSaving(true);
    try {
      const result = await saveLessonNote(token, courseId, activeLesson.id, {
        grammar: noteForm.grammar,
        important: "",
        vocabulary: noteForm.vocabulary,
        personal: "",
      });
      setNotes((current) => ({
        ...current,
        [result.note.lessonId]: {
          grammar: result.note.grammar,
          important: "",
          vocabulary: result.note.vocabulary,
          personal: "",
        },
      }));
      setMessage("Notes saqlandi");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notes saqlanmadi");
    } finally {
      setSaving(false);
    }
  }

  async function handleCompleteLesson() {
    const token = getUserToken();

    if (!token || !activeLesson) {
      return;
    }

    try {
      const result = await completeLesson(token, courseId, activeLesson.id);
      setCourse((current) => current ? {
        ...current,
        progress: result.progress,
        viewedLessonIds: result.viewedLessonIds ?? current.viewedLessonIds,
        completedLessonIds: result.completedLessonIds ?? current.completedLessonIds,
      } : current);
      const nextLesson = lessons[activeLessonIndex + 1];

      if (nextLesson) {
        setActiveLessonId(nextLesson.id);
        setLessonPage(Math.floor((activeLessonIndex + 1) / lessonsPerPage) + 1);
        navigate(`/user/courses/${courseId}/learn/${nextLesson.id}`);
        setMessage("Dars yakunlandi. Keyingi dars ochildi.");
      } else {
        setMessage("Kurs yakunlandi. Barakalla!");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Progress yangilanmadi");
    }
  }

  if (loading) {
    return (
      <section className="user-page">
        <EmptyState title="Dars yuklanmoqda" text="Admin yuklagan video va notes olinmoqda." />
      </section>
    );
  }

  if (!course || !activeLesson) {
    return (
      <section className="user-page">
        <EmptyState title="Dars topilmadi" text="Bu kursda hali dars qo'shilmagan." />
      </section>
    );
  }

  return (
    <section className="user-page lesson-player-page">
      <div className="lesson-player-hero">
        <div>
          <span>{course.categories?.[0] ?? "Kurs"}</span>
          <h1>{course.title}</h1>
          <p>{course.description || "Admin tomonidan yuklangan darslarni shu yerda ko‘rasiz."}</p>
          <button
            className="lesson-player-hero__more"
            type="button"
            onClick={() => setShowCourseInfo(true)}
          >
            More information about course
          </button>
        </div>
        <div className="lesson-player-hero__progress">
          <strong>{course.progress}%</strong>
          <span>Kurs progressi</span>
          <ProgressBar value={course.progress} tone="blue" />
        </div>
      </div>

      {showCourseInfo && (
        <div className="course-info-modal" role="dialog" aria-modal="true" aria-label="Course information">
          <article className="course-info-modal__card">
            <div className="course-info-modal__header">
              <div>
                <span>{course.categories?.[0] ?? "Course"}</span>
                <h2>{course.title}</h2>
              </div>
              <button aria-label="Close course information" type="button" onClick={() => setShowCourseInfo(false)}>
                ×
              </button>
            </div>

            <p className="course-info-modal__description">
              {course.description || "Bu kurs uchun batafsil ma'lumot hali kiritilmagan."}
            </p>

            <div className="course-info-modal__stats">
              <div>
                <span>Level</span>
                <strong>{course.level}</strong>
              </div>
              <div>
                <span>Lessons</span>
                <strong>{lessons.length} ta</strong>
              </div>
              <div>
                <span>Progress</span>
                <strong>{course.progress}%</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>{course.isFree ? "Free course" : "Premium course"}</strong>
              </div>
            </div>

            <div className="course-info-modal__mentor">
              <div className="course-info-modal__mentor-photo">
                {course.mentorPhotoUrl ? (
                  <img src={course.mentorPhotoUrl} alt={`${course.mentorFirstName} ${course.mentorLastName}`} />
                ) : (
                  <span>{course.mentorFirstName[0]}{course.mentorLastName[0]}</span>
                )}
              </div>
              <div>
                <small>Mentor / course provider</small>
                <strong>{course.mentorFirstName} {course.mentorLastName}</strong>
                <p>{course.title}</p>
                <ul>
                  <li>{course.categories?.join(" · ") || "Course"}</li>
                  <li>{course.level}</li>
                  {course.mentorTelegram && <li>{course.mentorTelegram}</li>}
                </ul>
              </div>
              <div className="course-info-modal__provider-logo">
                {course.logoUrl ? (
                  <img src={course.logoUrl} alt={`${course.title} logo`} />
                ) : (
                  <span>{course.categories?.[0]?.slice(0, 2).toUpperCase() ?? "LU"}</span>
                )}
              </div>
            </div>

            <div className="course-info-modal__timeline">
              <div>
                <span>Started at</span>
                <strong>{new Date(course.startedAt).toLocaleString("uz-UZ")}</strong>
              </div>
              <div>
                <span>Last opened</span>
                <strong>{new Date(course.lastOpenedAt).toLocaleString("uz-UZ")}</strong>
              </div>
            </div>

            <button className="course-info-modal__close" type="button" onClick={() => setShowCourseInfo(false)}>
              Close
            </button>
          </article>
        </div>
      )}

      {message && <p className="user-alert">{message}</p>}

      <div className="lesson-player-shell">
        <main className="lesson-player-main">
          <div className="lesson-player-video">
            <LessonVideo lesson={activeLesson} />
          </div>

          <article className="lesson-player-info">
            <div>
              <span>Dars #{activeLesson.order}</span>
              <h2>{activeLesson.title}</h2>
              <p>{activeLesson.description || "Bu dars uchun qisqa izoh hali kiritilmagan."}</p>
            </div>
            <Button disabled={isActiveLessonCompleted} onClick={handleCompleteLesson}>
              {isActiveLessonCompleted ? "Dars tugagan" : "Darsni tugatdim"}
            </Button>
          </article>
        </main>

        <aside className="lesson-player-sidebar">
          <div className="lesson-list-card">
            <div className="lesson-list-card__header">
              <span>Darslar</span>
              <strong>{lessons.length} ta</strong>
            </div>
            <div className="lesson-list-card__items">
              {visibleLessons.map((lesson, visibleIndex) => {
                const lessonIndex = lessonPageStart + visibleIndex;
                const isLocked = lessonIndex > completedLessonCount;
                const isCompleted = lessonIndex < completedLessonCount;

                return (
                  <button
                    aria-disabled={isLocked}
                    className={[
                      lesson.id === activeLesson.id ? "is-active" : "",
                      isLocked ? "is-locked" : "",
                      isCompleted ? "is-completed" : "",
                    ].filter(Boolean).join(" ")}
                    key={lesson.id}
                    type="button"
                    onClick={() => handleSelectLesson(lesson)}
                  >
                    <span>{isLocked ? "🔒" : isCompleted ? "✓" : lesson.order}</span>
                    <div>
                      <strong>{lesson.title}</strong>
                      <small>{isLocked ? "Oldingi darsni tugating" : lesson.duration || "Video dars"}</small>
                    </div>
                  </button>
                );
              })}
            </div>
            {lessons.length > lessonsPerPage ? (
              <div className="lesson-list-card__pagination">
                <button
                  disabled={lessonPage <= 1}
                  type="button"
                  onClick={() => setLessonPage((page) => Math.max(1, page - 1))}
                >
                  Oldingi
                </button>
                <span>
                  {lessonPage} / {totalLessonPages}
                </span>
                <button
                  disabled={lessonPage >= totalLessonPages}
                  type="button"
                  onClick={() => setLessonPage((page) => Math.min(totalLessonPages, page + 1))}
                >
                  Keyingi
                </button>
              </div>
            ) : null}
          </div>

          <div className="lesson-notes-card">
            <div className="lesson-notes-card__header">
              <span>Personal notes</span>
              <strong>{activeLesson.title}</strong>
            </div>

            <p className="lesson-notes-card__hint">
              Matnni belgilang va 6 xil rangdan birini tanlab, muhim joylarni ajratib qo‘ying.
            </p>

            <RichNoteEditor
              label="Grammar va muhim eslatmalar"
              value={noteForm.grammar}
              onChange={(value) => setNoteForm((current) => ({ ...current, grammar: value, important: "" }))}
              placeholder="Grammar qoidalari, muhim eslatmalar, formulalar va patternlarni shu yerga yozing..."
            />

            <RichNoteEditor
              label="Vocabulary"
              value={noteForm.vocabulary}
              onChange={(value) => setNoteForm((current) => ({ ...current, vocabulary: value }))}
              placeholder="Yangi so‘zlar, tarjimalar, collocationlar va misollar..."
            />

            <Button disabled={saving} onClick={handleSaveNotes}>
              {saving ? "Saqlanmoqda..." : "Notes saqlash"}
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default LessonPlayerPage;
