import "./TopBar.css";
import { useHomeI18n } from "../../features/home/i18n/HomeI18nContext";

function TopBar() {
  const { t } = useHomeI18n();

  return (
    <div className="topbar">
      <div className="topbar__inner">
        <p className="topbar__text">
          <span className="topbar__status-dot" aria-hidden="true" />
          {t("LevelUp — Learn smarter. Achieve more.")}
        </p>

        <div className="topbar__socials">
          <span className="topbar__social-label">{t("Follow us")}</span>
          {/* Facebook */}
          <a href="#" aria-label="Facebook" className="topbar__social-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>

          {/* Twitter / X */}
          <a href="#" aria-label="Twitter" className="topbar__social-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.2 2H22l-8.3 9.5L23.5 22h-7.7l-6-7.9L2.9 22H-.9l8.9-10.2L-1.4 2h7.9l5.5 7.2L18.2 2Zm-1.3 18h2.1L5.4 3.9H3.1L16.9 20Z"/>
            </svg>
          </a>

          {/* Behance */}
          <a href="#" aria-label="Behance" className="topbar__social-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.726zm-7.518-4h4.459c-.073-1.554-1.231-2.272-2.264-2.272-.901 0-2.051.631-2.195 2.272zM7.847 12c1.073-.449 1.703-1.298 1.703-2.683C9.55 7.357 8.09 6 5.961 6H0v12h6.254c2.107 0 3.821-1.113 3.821-3.423 0-1.59-.782-2.334-2.228-2.577zm-5.072-4.148h2.78c.97 0 1.745.395 1.745 1.37 0 .962-.721 1.448-1.663 1.448H2.775V7.852zm3.261 6.706H2.775v-3.012h3.261c1.124 0 1.836.573 1.836 1.57 0 .935-.636 1.442-1.836 1.442z"/>
            </svg>
          </a>

          {/* LinkedIn */}
          <a href="#" aria-label="LinkedIn" className="topbar__social-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
