import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";

import { userMenu } from "../constants/userMenu";
import { useUserI18n } from "../i18n/UserI18n";

type UserSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const GOAL_DEADLINE_KEY = "levelup_goal_deadline";
const GOAL_TIMELINE_KEY = "levelup_goal_timeline";
const LEARNING_PROFILE_KEY = "levelup_learning_profile";
const DEFAULT_GOAL_DAYS = 42;

function getGoalDetails() {
  let targetScore = "7.5";
  let timeline = "Not sure yet";
  try {
    const profile = JSON.parse(localStorage.getItem(LEARNING_PROFILE_KEY) ?? "{}");
    if (typeof profile.targetScore === "string" && profile.targetScore) {
      targetScore = profile.targetScore;
    }
    if (typeof profile.timeline === "string" && profile.timeline) {
      timeline = profile.timeline;
    }
  } catch {
    // Keep the default score when an old profile cannot be parsed.
  }

  let deadline = Number(localStorage.getItem(GOAL_DEADLINE_KEY));
  const savedTimeline = localStorage.getItem(GOAL_TIMELINE_KEY);

  if (!Number.isFinite(deadline) || deadline <= 0 || savedTimeline !== timeline) {
    const targetDate = new Date();

    if (timeline === "1 month") targetDate.setMonth(targetDate.getMonth() + 1);
    else if (timeline === "3 months") targetDate.setMonth(targetDate.getMonth() + 3);
    else if (timeline === "6 months") targetDate.setMonth(targetDate.getMonth() + 6);
    else if (timeline === "1 year") targetDate.setFullYear(targetDate.getFullYear() + 1);
    else targetDate.setDate(targetDate.getDate() + DEFAULT_GOAL_DAYS);

    deadline = targetDate.getTime();
    localStorage.setItem(GOAL_DEADLINE_KEY, String(deadline));
    localStorage.setItem(GOAL_TIMELINE_KEY, timeline);
  }

  const now = new Date();
  const totalSeconds = Math.max(0, Math.floor((deadline - now.getTime()) / 1000));
  const cursor = new Date(now);
  let years = 0;
  let months = 0;

  while (years < 100) {
    const next = new Date(cursor);
    next.setFullYear(next.getFullYear() + 1);
    if (next.getTime() > deadline) break;
    cursor.setTime(next.getTime());
    years += 1;
  }

  while (months < 12) {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + 1);
    if (next.getTime() > deadline) break;
    cursor.setTime(next.getTime());
    months += 1;
  }

  let remainder = Math.max(0, Math.floor((deadline - cursor.getTime()) / 1000));
  const days = Math.floor(remainder / 86_400);
  remainder %= 86_400;
  const hours = Math.floor(remainder / 3_600);
  remainder %= 3_600;
  const minutes = Math.floor(remainder / 60);
  const seconds = remainder % 60;

  return {
    totalSeconds,
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    targetScore,
  };
}

const menuIcons: Record<string, ReactNode> = {
  D: (
    <>
      <rect x="4" y="5" width="7" height="7" rx="1.6" />
      <rect x="13" y="5" width="7" height="7" rx="1.6" />
      <rect x="4" y="14" width="7" height="5" rx="1.6" />
      <rect x="13" y="14" width="7" height="5" rx="1.6" />
    </>
  ),
  B: (
    <>
      <path d="M5 6.5h14" />
      <path d="M7 4.5h10a2 2 0 0 1 2 2v13H5v-13a2 2 0 0 1 2-2Z" />
      <path d="M8 10h8" />
      <path d="M8 14h6" />
    </>
  ),
  R: (
    <>
      <path d="M7 5h10a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M9 9h6" />
      <path d="M9 13h8" />
      <path d="M9 17h4" />
    </>
  ),
  K: (
    <>
      <path d="M6 6.5h12" />
      <path d="M8 4.5h8a2 2 0 0 1 2 2v13l-6-3-6 3v-13a2 2 0 0 1 2-2Z" />
    </>
  ),
  N: (
    <>
      <path d="M5 17l4.5-5 3.5 3 6-8" />
      <path d="M5 5v14h14" />
    </>
  ),
  M: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M4.5 19a4 4 0 0 1 7 0" />
      <path d="M12.5 19a4 4 0 0 1 7 0" />
    </>
  ),
  T: (
    <>
      <path d="M7 5h10a2 2 0 0 1 2 2v12H5V7a2 2 0 0 1 2-2Z" />
      <path d="M8 10h8" />
      <path d="M8 14h3" />
      <path d="m14 15 1.5 1.5L19 13" />
    </>
  ),
  Q: (
    <>
      <path d="M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M9 9h6" />
      <path d="M9 13h4" />
      <path d="M16 16l3 3" />
    </>
  ),
  P: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 15h4" />
    </>
  ),
  X: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 7-2 7-2 9h16c0-2-2-2-2-9" />
      <path d="M10 21h4" />
    </>
  ),
  F: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
};

function MenuIcon({ icon }: { icon: string }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        {menuIcons[icon] ?? menuIcons.D}
      </g>
    </svg>
  );
}

function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [goal, setGoal] = useState(getGoalDetails);
  const { language } = useUserI18n();

  useEffect(() => {
    const updateCountdown = () => setGoal(getGoalDetails());
    const timerId = window.setInterval(updateCountdown, 1_000);
    window.addEventListener("focus", updateCountdown);

    return () => {
      window.clearInterval(timerId);
      window.removeEventListener("focus", updateCountdown);
    };
  }, []);

  useEffect(() => {
    function closeFlyoutsWhenOutside(target: EventTarget | null) {
      if (target instanceof Node && !sidebarRef.current?.contains(target)) {
        setOpenGroups([]);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      closeFlyoutsWhenOutside(event.target);
    }

    function handleFocusIn(event: FocusEvent) {
      closeFlyoutsWhenOutside(event.target);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenGroups([]);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleGroup(path: string) {
    setOpenGroups((currentGroups) =>
      currentGroups.includes(path)
        ? currentGroups.filter((groupPath) => groupPath !== path)
        : [...currentGroups, path],
    );
  }

  return (
    <>
      <aside ref={sidebarRef} className={`user-sidebar ${isOpen ? "user-sidebar--open" : ""}`}>
        <NavLink className="user-brand" to="/user/dashboard" onClick={onClose}>
          <span>LU</span>
          <div>
            <strong>LevelUp</strong>
            <small>Personal learning system</small>
          </div>
        </NavLink>

        <nav className="user-menu" aria-label="User panel menyu">
          {userMenu.map((item) => {
            const hasChildren = Boolean(item.children);
            const isOpen = openGroups.includes(item.path);

            return (
              <div className="user-menu__group" key={item.path}>
                <div className={hasChildren ? "user-menu__row" : undefined}>
                  <NavLink
                    className={({ isActive }) => `user-menu__link ${isActive ? "is-active" : ""}`}
                    to={item.path}
                    onClick={() => { setOpenGroups([]); onClose(); }}
                  >
                    <span className="user-menu__icon">
                      <MenuIcon icon={item.icon} />
                    </span>
                    <strong>{item.label}</strong>
                  </NavLink>

                  {hasChildren && (
                    <button
                      className={`user-menu__collapse ${isOpen ? "user-menu__collapse--open" : ""}`}
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${item.label} bo‘limini ${isOpen ? "yopish" : "ochish"}`}
                      onClick={() => toggleGroup(item.path)}
                    >
                      <span />
                    </button>
                  )}
                </div>

                {item.children && (
                  <div className={`user-menu__children ${isOpen ? "user-menu__children--open" : ""}`}>
                    {item.children.map((child) => (
                      <NavLink
                        to={child.path}
                        key={child.path}
                        className={child.color ? `user-menu__child--${child.color}` : undefined}
                        onClick={() => { setOpenGroups([]); onClose(); }}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="user-sidebar__footer">
          <span>Premium tayyorgarlik</span>
          <strong>
            IELTS {goal.targetScore}:
            <br />
            {language === "en" && `${goal.years > 0 ? `${goal.years} year ` : ""}${goal.months} month ${goal.days} day ${goal.hours} hour ${goal.minutes} min ${goal.seconds} second`}
            {language === "ru" && `${goal.years > 0 ? `${goal.years} г. ` : ""}${goal.months} мес. ${goal.days} д. ${goal.hours} ч. ${goal.minutes} мин. ${goal.seconds} сек.`}
            {language === "uz" && `${goal.years > 0 ? `${goal.years} yil ` : ""}${goal.months} oy ${goal.days} kun ${goal.hours} soat ${goal.minutes} daqiqa ${goal.seconds} sekund`}
          </strong>
          <div className="user-sidebar__progress" aria-hidden="true">
            <i style={{ width: `${Math.min(100, (goal.totalSeconds / (DEFAULT_GOAL_DAYS * 86_400)) * 100)}%` }} />
          </div>
        </div>
      </aside>

      <button
        className={`user-sidebar-backdrop ${isOpen ? "user-sidebar-backdrop--open" : ""}`}
        aria-label="Menyuni yopish"
        type="button"
        onClick={onClose}
      />
    </>
  );
}

export default UserSidebar;
