import { Link } from "react-router";

import "./SiteFooter.css";

const footerGroups = [
  {
    title: "Platforma",
    links: ["Testlar", "Kurslar", "Ustozlar", "Natijalar paneli"],
  },
  {
    title: "Tayyorlov",
    links: ["Tinglash", "O‘qish", "Yozish", "Gapirish"],
  },
  {
    title: "Resurslar",
    links: ["Maqolalar", "Materiallar", "Mock test", "Savol-javob"],
  },
  {
    title: "Kompaniya",
    links: ["Biz haqimizda", "Aloqa", "Shartlar", "Maxfiylik"],
  },
];

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__container">
        <div className="site-footer__top">
          <div className="site-footer__brand-block">
            <Link className="site-footer__brand" to="/">
              <span className="site-footer__logo" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>

              <strong>EduSkill</strong>
            </Link>

            <p>
              IELTS va Multilevel imtihonlariga tayyorlanish uchun test,
              mentorlik va progress tahlil platformasi.
            </p>

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
                <h3>{group.title}</h3>

                <nav aria-label={group.title}>
                  {group.links.map((link) => (
                    <Link key={link} to="/">
                      {link}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 EduSkill. Barcha huquqlar himoyalangan.</p>

          <div className="site-footer__payments" aria-label="To‘lov usullari">
            <span>UZCARD</span>
            <span>HUMO</span>
            <span>VISA</span>
            <span>MASTERCARD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
