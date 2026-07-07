import { useState } from "react";
import { Link } from "react-router";

import { clearUserSession, getUserProfile } from "../../features/auth/services/userSession";
import "./Navbar.css";

type NavigationItem = {
  label: string;
  path: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Bosh sahifa",
    path: "/",
  },
  {
    label: "Testlar",
    path: "/#tests",
  },
  {
    label: "O‘qituvchilar",
    path: "/#teachers",
  },
  {
    label: "Resurslar",
    path: "/#resources",
  },
  {
    label: "Podcastlar",
    path: "/#podcasts",
  },
  {
    label: "Articllar",
    path: "/#articles",
  },
  {
    label: "Cinema",
    path: "/#cinema",
  },
  {
    label: "Cartoons",
    path: "/#cartoons",
  },
  {
    label: "Hamkorlar",
    path: "/#partners",
  },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getUserProfile());

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function toggleMenu() {
    setIsMenuOpen((currentState) => !currentState);
  }

  function logoutUser() {
    clearUserSession();
    setUserProfile(null);
    closeMenu();
  }

  const authActions = userProfile ? (
    <>
      <span className="navbar-user">{userProfile.firstName}</span>

      <button className="navbar-login" type="button" onClick={logoutUser}>
        Chiqish
      </button>
    </>
  ) : (
    <>
      <Link
        className="navbar-login"
        to="/login"
        onClick={closeMenu}
      >
        Kirish
      </Link>

      <Link
        className="navbar-start-button"
        to="/register"
        onClick={closeMenu}
      >
        Bepul boshlash
      </Link>
    </>
  );

  return (
    <header className="site-header">
      <div className="navbar-container">
        <Link
          className="navbar-brand"
          to="/"
          aria-label="LevelUp bosh sahifasi"
          onClick={closeMenu}
        >
          <span className="navbar-brand__icon" aria-hidden="true">
            <span className="navbar-brand__book-line" />
            <span className="navbar-brand__book-line" />
            <span className="navbar-brand__book-line" />
          </span>

          <span className="navbar-brand__name">LevelUp</span>
        </Link>

        <nav
          className={`navbar-menu ${
            isMenuOpen ? "navbar-menu--open" : ""
          }`}
          aria-label="Asosiy navigatsiya"
        >
          <div className="navbar-menu__links">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className="navbar-menu__link"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="navbar-menu__mobile-actions">{authActions}</div>
        </nav>

        <div className="navbar-actions">{authActions}</div>

        <button
          className={`navbar-toggle ${
            isMenuOpen ? "navbar-toggle--open" : ""
          }`}
          type="button"
          aria-label="Navigatsiya menyusini ochish"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
