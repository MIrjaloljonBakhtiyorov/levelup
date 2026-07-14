import "./PartnersSection.css";
import { useHomeI18n } from "../i18n/HomeI18n";

type PartnerItem = {
  id: number;
  name: string;
  description: string;
  href: string;
  image?: string;
  label?: string;
  tone: "blue" | "green" | "purple" | "orange";
};

const partners: PartnerItem[] = [
  {
    id: 1,
    name: "Education Partner",
    description: "Curriculum development and methodological support",
    href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwoxjvyUHBlv7_LNfQ8LqAzQfoXESkMKd7fzYSAw6vETNEO_6IT024CcE&s=10",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwoxjvyUHBlv7_LNfQ8LqAzQfoXESkMKd7fzYSAw6vETNEO_6IT024CcE&s=10",
    tone: "purple",
  },
  {
    id: 2,
    name: "Smart IT Ventures",
    description: "Technology and digital solutions partner",
    href: "https://www.smartitventures.com/",
    label: "Smart IT",
    tone: "blue",
  },
  {
    id: 3,
    name: "Exam Center",
    description: "Test and examination resources",
    href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDb58yjMpG97FDaAWx_ZHrR5DGZ2-l1S3eTB1-WThWMA&s=10",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDb58yjMpG97FDaAWx_ZHrR5DGZ2-l1S3eTB1-WThWMA&s=10",
    tone: "green",
  },
  {
    id: 4,
    name: "Investment Partner",
    description: "Strategic support for the growth of education projects",
    href: "https://image.pitchbook.com/fvgK2UlUknNQwj81I4SwnpNIVwS1762774213262_200x200",
    image:
      "https://image.pitchbook.com/fvgK2UlUknNQwj81I4SwnpNIVwS1762774213262_200x200",
    tone: "orange",
  },
];

function PartnerCard({ partner }: { partner: PartnerItem }) {
  const { t } = useHomeI18n();

  return (
    <a
      className={`partner-card partner-card--${partner.tone}`}
      href={partner.href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="partner-card__media" aria-hidden="true">
        {partner.image ? (
          <img src={partner.image} alt="" loading="lazy" />
        ) : (
          <strong>{partner.label}</strong>
        )}
      </span>

      <span className="partner-card__content">
        <small className="partner-card__badge">Trusted partner</small>
        <strong>{t(partner.name)}</strong>
        <small>{t(partner.description)}</small>
      </span>
    </a>
  );
}

function PartnersSection() {
  const { t } = useHomeI18n();

  return (
    <section className="partners-section" id="partners">
      <div className="partners-section__container">
        <header className="partners-section__heading">
          <span className="partners-section__eyebrow">
            {t("Trusted Partners")}
          </span>

          <h2>{t("A stronger learning ecosystem with our partners")}</h2>

          <p>
            {t("We work with organizations in education, technology, and strategic partnerships to develop the platform.")}
          </p>
        </header>

        <div className="partners-section__marquee" aria-label="Partners">
          <div className="partners-section__track">
            {[...partners, ...partners].map((partner, index) => (
              <PartnerCard
                key={`${partner.id}-${index}`}
                partner={partner}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PartnersSection;
