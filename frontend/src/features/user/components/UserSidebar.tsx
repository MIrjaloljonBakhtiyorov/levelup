import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";

import { userMenu } from "../constants/userMenu";

type UserSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

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
          <strong>IELTS 7.5 sari 42 kun</strong>
          <div className="user-sidebar__progress" aria-hidden="true">
            <i />
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
