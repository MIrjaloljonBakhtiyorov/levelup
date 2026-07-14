import { type ReactNode, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router";

import { adminMenuGroups, type AdminMenuItem } from "../constants/adminNavigation";
import { getAdminToken } from "../../auth/services/adminSession";
import { getAdminCourses } from "../services/adminCoursesApi";
import { getAdminTests } from "../services/adminTestsApi";
import type { CourseCategory } from "../types/adminTypes";

const COURSE_MENU_CATEGORIES = ["Grammar", "CEFR", "IELTS", "TOEFL", "SAT"] as const;
type CourseMenuCategory = Extract<CourseCategory, (typeof COURSE_MENU_CATEGORIES)[number]>;
type CourseCounts = Partial<Record<CourseMenuCategory, number>>;
type TestCountKey = "CEFR" | "IELTS" | "TOEFL" | "SAT" | "Vocabulary" | "Grammar Quiz" | "Game";
type TestCounts = Partial<Record<TestCountKey, number>>;

// ── Route map: menu item → URL ────────────────────────────────────
const ROUTE_MAP: Record<string, string> = {
  // Users
  "Users-Students": "/admin/users/pupils",
  "Users-Teachers": "/admin/users/teachers",
  "Users-Blocked users": "/admin/users/blocked",
  "Users-Login history": "/admin/users/login-history",

  // Courses
  "Courses-All courses": "/admin/courses/add",
  "Courses-Grammar-Free version": "/admin/courses/grammar?tab=free",
  "Courses-Grammar-Paid version": "/admin/courses/grammar?tab=paid",
  "Courses-CEFR-Free version": "/admin/courses/cefr?tab=free",
  "Courses-CEFR-Paid version": "/admin/courses/cefr?tab=paid",
  "Courses-IELTS-Free version": "/admin/courses/ielts?tab=free",
  "Courses-IELTS-Paid version": "/admin/courses/ielts?tab=paid",
  "Courses-TOEFL-Free version": "/admin/courses/toefl?tab=free",
  "Courses-TOEFL-Paid version": "/admin/courses/toefl?tab=paid",
  "Courses-SAT-Free version": "/admin/courses/sat?tab=free",
  "Courses-SAT-Paid version": "/admin/courses/sat?tab=paid",

  "Teachers-Teacher profiles": "/admin/teachers/profiles",
  "Teachers-Teacher approvals": "/admin/teachers/approvals",

  // Content
  "Content-Podcasts": "/admin/content/podcasts",
  "Content-Articles": "/admin/content/articles",
  "Content-Cinema": "/admin/content/cinema",
  "Content-Cartoons": "/admin/content/cartoons",

  // Tests
  "Tests-Vocabulary": "/admin/tests/vocabulary",
  "Tests-Grammar Quiz": "/admin/tests/grammar",
  "Tests-Game": "/admin/tests/game",
  "Tests-CEFR-Listening": "/admin/tests/cefr/listening",
  "Tests-CEFR-Reading": "/admin/tests/cefr/reading",
  "Tests-CEFR-Writing": "/admin/tests/cefr/writing",
  "Tests-CEFR-Speaking": "/admin/tests/cefr/speaking",
  "Tests-IELTS-Listening": "/admin/tests/ielts/listening",
  "Tests-IELTS-Reading": "/admin/tests/ielts/reading",
  "Tests-IELTS-Writing": "/admin/tests/ielts/writing",
  "Tests-IELTS-Speaking": "/admin/tests/ielts/speaking",
  "Tests-TOEFL-Listening": "/admin/tests/toefl/listening",
  "Tests-TOEFL-Reading": "/admin/tests/toefl/reading",
  "Tests-TOEFL-Writing": "/admin/tests/toefl/writing",
  "Tests-TOEFL-Speaking": "/admin/tests/toefl/speaking",
  "Tests-SAT-Reading and Writing": "/admin/tests/sat/reading",
  "Tests-SAT-Math": "/admin/tests/sat/math",

  // Security
  "Security-System security settings": "/admin/security/settings",
  "Security-Blocked IPs": "/admin/security/blocked-ips",
  "Security-Login sessions": "/admin/security/login-sessions",
};

function itemRoute(groupTitle: string, itemTitle: string): string {
  const key = `${groupTitle}-${itemTitle}`;
  if (ROUTE_MAP[key]) return ROUTE_MAP[key];
  // fallback slug
  const slug = itemTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  const gSlug = groupTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  return `/admin/${gSlug}/${slug}`;
}

// ── Icons ─────────────────────────────────────────────────────────
const groupIcons: Record<string, ReactNode> = {
  Dashboard: (
    <>
      <rect x="4" y="5" width="7" height="7" rx="1.6" />
      <rect x="13" y="5" width="7" height="7" rx="1.6" />
      <rect x="4" y="14" width="7" height="5" rx="1.6" />
      <rect x="13" y="14" width="7" height="5" rx="1.6" />
    </>
  ),
  Users: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <circle cx="17" cy="7" r="3" />
      <path d="M21 21v-2a3 3 0 0 0-2-2.8" />
    </>
  ),
  Courses: (
    <>
      <path d="M6 6.5h12" />
      <path d="M8 4.5h8a2 2 0 0 1 2 2v13l-6-3-6 3v-13a2 2 0 0 1 2-2Z" />
    </>
  ),
  Tests: (
    <>
      <path d="M7 5h10a2 2 0 0 1 2 2v12H5V7a2 2 0 0 1 2-2Z" />
      <path d="M8 10h8" />
      <path d="M8 14h3" />
      <path d="m14 15 1.5 1.5L19 13" />
    </>
  ),
  "AI Study Plan": (
    <>
      <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Z" />
      <path d="M9 14h6" />
      <path d="M12 11v6" />
    </>
  ),
  Content: (
    <>
      <path d="M5 6.5h14" />
      <path d="M7 4.5h10a2 2 0 0 1 2 2v13H5v-13a2 2 0 0 1 2-2Z" />
      <path d="M8 10h8" />
      <path d="M8 14h6" />
    </>
  ),
  Teachers: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M4.5 19a4 4 0 0 1 7 0" />
      <path d="M12.5 19a4 4 0 0 1 7 0" />
    </>
  ),
  "Pricing and plans": (
    <>
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  Payments: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 15h4" />
    </>
  ),
  Reports: (
    <>
      <path d="M5 17l4.5-5 3.5 3 6-8" />
      <path d="M5 5v14h14" />
    </>
  ),
  Notifications: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 7-2 7-2 9h16c0-2-2-2-2-9" />
      <path d="M10 21h4" />
    </>
  ),
  "Reviews and requests": (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h8" />
      <path d="M8 14h4" />
    </>
  ),
  Settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </>
  ),
  Security: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
};

function GroupIcon({ title }: { title: string }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        {groupIcons[title] ?? groupIcons.Dashboard}
      </g>
    </svg>
  );
}

// ── Flyout Panel ──────────────────────────────────────────────────
type FlyoutProps = {
  group: (typeof adminMenuGroups)[number];
  btnRect: DOMRect;
  onClose: () => void;
  courseCounts: CourseCounts;
  testCounts: TestCounts;
};

function FlyoutPanel({ group, btnRect, onClose, courseCounts, testCounts }: FlyoutProps) {
  const panelRef    = useRef<HTMLDivElement>(null);
  const [openNested, setOpenNested] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const simpleItems: string[] = [];
  const nestedGroups: { title: string; items: string[] }[] = [];
  group.items.forEach((item: AdminMenuItem) => {
    if (typeof item === "string") simpleItems.push(item);
    else nestedGroups.push(item);
  });

  const PANEL_W = 240;
  const estH    = Math.min(window.innerHeight - 48, 480);
  const left    = btnRect.right + 8;
  const top     = Math.max(16, Math.min(btnRect.top, window.innerHeight - estH - 16));
  const finalLeft = left + PANEL_W > window.innerWidth ? btnRect.left - PANEL_W - 8 : left;

  function navigate_and_close(to: string) {
    navigate(to);
    onClose();
  }

  const panel = (
    <div
      ref={panelRef}
      className="admin-flyout"
      style={{ left: finalLeft, top }}
      role="menu"
      aria-label={`${group.title} menu`}
    >
      <div className="admin-flyout__head">
        <span className="admin-flyout__heading">{group.title}</span>
        <button className="admin-flyout__x" type="button" aria-label="Close" onClick={onClose}>✕</button>
      </div>

      <div className="admin-flyout__body">
        {/* Nested groups */}
        {nestedGroups.map((nested) => {
          const isOpen = openNested === nested.title;
          return (
            <div key={nested.title} className="admin-flyout__group">
              <button
                className={`admin-flyout__group-row ${isOpen ? "is-open" : ""}`}
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenNested(isOpen ? null : nested.title)}
              >
                <span>{nested.title}</span>
                <span className="admin-flyout__row-right">
                  <span className="admin-flyout__badge">
                    {group.title === "Courses"
                      ? courseCounts[nested.title as CourseMenuCategory] ?? 0
                      : group.title === "Tests"
                        ? testCounts[nested.title as keyof TestCounts] ?? 0
                        : nested.items.length}
                  </span>
                  <svg className={`admin-flyout__arrow ${isOpen ? "rotated" : ""}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="admin-flyout__sub">
                  {nested.items.map((subItem) => (
                    <button
                      key={subItem}
                      className="admin-flyout__item admin-flyout__item--child"
                      type="button"
                      onClick={() => navigate_and_close(itemRoute(`${group.title}-${nested.title}`, subItem))}
                    >
                      <span className="admin-flyout__dot" />
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {nestedGroups.length > 0 && simpleItems.length > 0 && (
          <div className="admin-flyout__sep" />
        )}

        {/* Simple items → NavLink */}
        {simpleItems.map((item) => {
          const to = itemRoute(group.title, item);
          return (
            <NavLink
              key={item}
              to={to}
              className={({ isActive }) =>
                `admin-flyout__item ${isActive ? "is-active" : ""}`
              }
              onClick={onClose}
            >
              <span className="admin-flyout__dot" />
              {item}
              {group.title === "Tests" && (
                <span className="admin-flyout__badge" style={{ marginLeft: "auto" }}>
                  {testCounts[item as TestCountKey] ?? 0}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

// ── Sidebar ───────────────────────────────────────────────────────
function AdminSidebar() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [btnRect, setBtnRect]     = useState<DOMRect | null>(null);
  const [courseCounts, setCourseCounts] = useState<CourseCounts>({});
  const [testCounts, setTestCounts] = useState<TestCounts>({});

  const loadCourseCounts = async () => {
    const token = getAdminToken();
    if (!token) return;

    try {
      const result = await getAdminCourses(token);
      const nextCounts: CourseCounts = Object.fromEntries(
        COURSE_MENU_CATEGORIES.map((category) => [
          category,
          result.courses.filter((course) => course.categories.includes(category)).length,
        ]),
      );
      setCourseCounts(nextCounts);
    } catch {
      // The course pages handle authorization/API errors; keep the sidebar usable.
    }
  };

  const loadTestCounts = async () => {
    const token = getAdminToken();
    if (!token) return;

    try {
      const result = await getAdminTests(token);
      const examTypes = ["CEFR", "IELTS", "TOEFL", "SAT"] as const;
      setTestCounts(Object.fromEntries(
        [
          ...examTypes.map((examType) => [
          examType,
          result.tests.filter((test) => test.examType === examType).length,
          ]),
          ["Vocabulary", result.tests.filter((test) => "skill" in test && test.skill === "Vocabulary").length],
          ["Grammar Quiz", result.tests.filter((test) => "skill" in test && test.skill === "Grammar").length],
          ["Game", result.tests.filter((test) => "skill" in test && test.skill === "Game").length],
        ],
      ));
    } catch {
      // Test pages display API errors; the navigation remains available.
    }
  };

  const handleGroupClick = (title: string, btn: HTMLButtonElement) => {
    if (openGroup === title) {
      setOpenGroup(null);
      setBtnRect(null);
    } else {
      if (title === "Courses") void loadCourseCounts();
      if (title === "Tests") void loadTestCounts();
      setBtnRect(btn.getBoundingClientRect());
      setOpenGroup(title);
    }
  };

  const activeGroupData = adminMenuGroups.find((g) => g.title === openGroup) ?? null;

  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" to="/" aria-label="Mister Italiano">
        <span className="admin-brand__mark">MI</span>
        <div>
          <strong>Mister Italiano</strong>
          <small>Admin workspace</small>
        </div>
      </Link>

      <nav className="admin-menu" aria-label="Admin menu">
        {/* Dashboard */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-menu__link admin-menu__primary ${isActive ? "is-active" : ""}`
          }
          onClick={() => { setOpenGroup(null); setBtnRect(null); }}
        >
          <span className="admin-menu__icon"><GroupIcon title="Dashboard" /></span>
          <strong>Dashboard</strong>
        </NavLink>

        {/* Menu groups */}
        {adminMenuGroups.map((group) => {
          const isOpen = openGroup === group.title;
          return (
            <button
              key={group.title}
              className={`admin-menu__link ${isOpen ? "is-open" : ""}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={(e) => handleGroupClick(group.title, e.currentTarget)}
            >
              <span className="admin-menu__icon"><GroupIcon title={group.title} /></span>
              <strong>{group.title}</strong>
              <svg
                className={`admin-menu__caret ${isOpen ? "rotated" : ""}`}
                fill="none" viewBox="0 0 24 24" aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar__footer">
        <span>ADMIN LOGIN</span>
        <strong>mister_italiano</strong>
        <div className="admin-sidebar__progress" aria-hidden="true"><i /></div>
      </div>

      {activeGroupData && btnRect && (
        <FlyoutPanel
          group={activeGroupData}
          btnRect={btnRect}
          courseCounts={courseCounts}
          testCounts={testCounts}
          onClose={() => { setOpenGroup(null); setBtnRect(null); }}
        />
      )}
    </aside>
  );
}

export default AdminSidebar;
