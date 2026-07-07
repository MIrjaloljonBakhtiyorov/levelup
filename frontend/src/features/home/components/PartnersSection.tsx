import "./PartnersSection.css";

type PartnerItem = {
  id: number;
  name: string;
  description: string;
  href: string;
  image?: string;
  label?: string;
};

const partners: PartnerItem[] = [
  {
    id: 1,
    name: "Ta'lim hamkori",
    description: "O'quv dasturlari va metodik yordam",
    href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwoxjvyUHBlv7_LNfQ8LqAzQfoXESkMKd7fzYSAw6vETNEO_6IT024CcE&s=10",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwoxjvyUHBlv7_LNfQ8LqAzQfoXESkMKd7fzYSAw6vETNEO_6IT024CcE&s=10",
  },
  {
    id: 2,
    name: "Smart IT Ventures",
    description: "Texnologiya va raqamli yechimlar bo'yicha hamkor",
    href: "https://www.smartitventures.com/",
    label: "Smart IT",
  },
  {
    id: 3,
    name: "Imtihon markazi",
    description: "Test va imtihon resurslari",
    href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDb58yjMpG97FDaAWx_ZHrR5DGZ2-l1S3eTB1-WThWMA&s=10",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDb58yjMpG97FDaAWx_ZHrR5DGZ2-l1S3eTB1-WThWMA&s=10",
  },
  {
    id: 4,
    name: "Investitsiya hamkori",
    description: "Ta'lim loyihalari rivoji uchun strategik ko'mak",
    href: "https://image.pitchbook.com/fvgK2UlUknNQwj81I4SwnpNIVwS1762774213262_200x200",
    image:
      "https://image.pitchbook.com/fvgK2UlUknNQwj81I4SwnpNIVwS1762774213262_200x200",
  },
];

function PartnerCard({ partner }: { partner: PartnerItem }) {
  return (
    <a
      className="partner-card"
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
        <strong>{partner.name}</strong>
        <small>{partner.description}</small>
      </span>
    </a>
  );
}

function PartnersSection() {
  return (
    <section className="partners-section" id="partners">
      <div className="partners-section__container">
        <header className="partners-section__heading">
          <span className="partners-section__eyebrow">
            Ishonchli hamkorlar
          </span>

          <h2>Hamkorlarimiz bilan yanada kuchliroq ta'lim ekotizimi</h2>

          <p>
            Platformani rivojlantirishda ta'lim, texnologiya va strategik
            hamkorlik yo'nalishidagi tashkilotlar bilan ishlaymiz.
          </p>
        </header>

        <div className="partners-section__marquee" aria-label="Hamkorlar">
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
