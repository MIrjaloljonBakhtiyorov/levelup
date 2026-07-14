import { Link } from "react-router";

import { useHomeI18n } from "../../features/home/i18n/HomeI18n";
import "./SiteFooter.css";

const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "Tests", to: "/user/tests" },
      { label: "Courses", to: "/user/courses" },
      { label: "Teachers", to: "/#teachers" },
      { label: "Results Dashboard", to: "/user/results" },
    ],
  },
  {
    title: "Preparation",
    links: [
      { label: "Listening", to: "/user/tests" },
      { label: "Reading", to: "/user/tests" },
      { label: "Writing", to: "/user/tests" },
      { label: "Speaking", to: "/user/tests" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Articles", to: "/user/resources" },
      { label: "Materials", to: "/#free-lessons" },
      { label: "Mock Test", to: "/user/tests" },
      { label: "FAQ", to: "/#partners" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/#partners" },
      { label: "Contact", to: "/#footer" },
      { label: "Terms", to: "/" },
      { label: "Privacy", to: "/" },
    ],
  },
];

function SiteFooter() {
  const { t } = useHomeI18n();

  return (
    <footer className="site-footer" id="footer">
      <div className="site-footer__container">
        <div className="site-footer__top">
          <div className="site-footer__brand-block">
            <Link className="site-footer__brand" to="/">
              <span className="site-footer__logo" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>

              <strong>LevelUp</strong>
            </Link>

            <p>
              {t("A platform for test preparation, mentoring, and progress tracking for IELTS and Multilevel exams.")}
            </p>

            <div className="site-footer__cta">
              <span>{t("Start your English journey")}</span>
              <Link to="/register">{t("Create free account")} <b>→</b></Link>
            </div>

            <div className="site-footer__socials">
              <a href="/" aria-label="Telegram">
                TG
              </a>
              <a href="/" aria-label="Instagram">
                IG
              </a>
              <a href="/" aria-label="YouTube">
                YT
              </a>
            </div>
          </div>

          <div className="site-footer__links">
            {footerGroups.map((group) => (
              <div className="site-footer__group" key={group.title}>
                <h3>{t(group.title)}</h3>

                <nav aria-label={t(group.title)}>
                  {group.links.map((link) => (
                    <Link key={link.label} to={link.to}>
                      {t(link.label)}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
