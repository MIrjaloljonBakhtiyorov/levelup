import { useMemo, useState } from "react";

type PlanTone = "green" | "blue" | "purple";

type BillingPlan = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  period: string;
  tone: PlanTone;
  active: boolean;
  recommended?: boolean;
  features: {
    label: string;
    included: boolean;
  }[];
};

type PaymentStatus = "Muvaffaqiyatli" | "Kutilmoqda" | "Bekor qilingan";

type PaymentHistoryItem = {
  id: number;
  date: string;
  service: string;
  plan: string;
  amount: string;
  status: PaymentStatus;
};

const plans: BillingPlan[] = [
  {
    id: "free",
    title: "Free",
    subtitle: "Boshlash uchun bepul imkoniyatlar",
    price: "0 so‘m",
    period: "doimiy",
    tone: "green",
    active: false,
    features: [
      { label: "5 ta test", included: true },
      { label: "Bepul darslar", included: true },
      { label: "Basic progress", included: true },
      { label: "Writing tekshiruvi", included: false },
      { label: "Speaking tekshiruvi", included: false },
      { label: "AI Study Plan", included: false },
    ],
  },
  {
    id: "premium",
    title: "Premium",
    subtitle: "Mustaqil tayyorlanish uchun to‘liq paket",
    price: "149 000 so‘m",
    period: "oyiga",
    tone: "blue",
    active: true,
    recommended: true,
    features: [
      { label: "Cheksiz testlar", included: true },
      { label: "Barcha kurslar", included: true },
      { label: "AI Study Plan", included: true },
      { label: "Mock test analytics", included: true },
      { label: "Writing feedback", included: true },
      { label: "Speaking practice", included: true },
    ],
  },
  {
    id: "mentor-plus",
    title: "Mentor Plus",
    subtitle: "Ustoz bilan individual natijaga chiqish",
    price: "349 000 so‘m",
    period: "oyiga",
    tone: "purple",
    active: false,
    features: [
      { label: "Premium imkoniyatlarning barchasi", included: true },
      { label: "Jonli mentor darslari", included: true },
      { label: "Essay feedback", included: true },
      { label: "Speaking feedback", included: true },
      { label: "Individual study plan", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

const paymentHistory: PaymentHistoryItem[] = [
  {
    id: 1,
    date: "01.07.2026",
    service: "Premium obuna",
    plan: "Premium",
    amount: "149 000 so‘m",
    status: "Muvaffaqiyatli",
  },
  {
    id: 2,
    date: "24.06.2026",
    service: "Essay feedback",
    plan: "Add-on",
    amount: "49 000 so‘m",
    status: "Muvaffaqiyatli",
  },
  {
    id: 3,
    date: "15.06.2026",
    service: "Jonli mentor darsi",
    plan: "Mentor",
    amount: "120 000 so‘m",
    status: "Muvaffaqiyatli",
  },
  {
    id: 4,
    date: "01.06.2026",
    service: "Premium obuna",
    plan: "Premium",
    amount: "149 000 so‘m",
    status: "Muvaffaqiyatli",
  },
];

function BillingPage() {
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("premium");

  const activePlan = useMemo(() => {
    return plans.find((plan) => plan.id === selectedPlanId) ?? plans[1];
  }, [selectedPlanId]);

  function handleApplyPromo() {
    if (!promoCode.trim()) {
      setPromoMessage("Promokod kiritilmagan.");
      return;
    }

    setPromoMessage("Promokod tekshirildi. Demo rejimda saqlandi.");
  }

  function handlePlanAction(plan: BillingPlan) {
    if (plan.active || plan.id === selectedPlanId) {
      alert("Bu sizning joriy tarifingiz.");
      return;
    }

    setSelectedPlanId(plan.id);
    alert(`${plan.title} tarifi demo rejimda tanlandi.`);
  }

  function handleInvoiceDownload() {
    alert("Invoice yuklab olish funksiyasi tez orada ulanadi.");
  }

  function handleChangeCard() {
    alert("Kartani o‘zgartirish funksiyasi tez orada ulanadi.");
  }

  function handleSupport() {
    alert("Support xizmati tez orada ulanadi.");
  }

  return (
    <section className="billing-page">
      <div className="billing-hero">
        <div className="billing-hero__content">
          <span className="billing-hero__eyebrow">To‘lov markazi</span>

          <h1>To‘lovlar va obuna</h1>

          <p>
            Tarifingiz, to‘lov tarixi, promokod, invoice va mentor darslari
            xarajatlarini bitta joydan boshqaring.
          </p>

          <div className="billing-hero__actions">
            <button
              className="billing-button billing-button--light"
              type="button"
              onClick={() => alert("Tarifni yangilash demo rejimda.")}
            >
              Tarifni yangilash
            </button>

            <button
              className="billing-button billing-button--ghost"
              type="button"
              onClick={handleInvoiceDownload}
            >
              Invoice yuklab olish
            </button>
          </div>
        </div>

        <div className="billing-hero__status">
          <span>Joriy tarif</span>
          <strong>{activePlan.title}</strong>
          <small>Active obuna · keyingi to‘lov 15 iyul</small>
        </div>
      </div>

      <div className="billing-current-plan">
        <div className="billing-current-plan__main">
          <span className="billing-pill billing-pill--green">Active</span>

          <h2>{activePlan.title}</h2>

          <p>{activePlan.subtitle}</p>

          <div className="billing-current-plan__price">
            <strong>{activePlan.price}</strong>
            <span>{activePlan.period}</span>
          </div>
        </div>

        <div className="billing-current-plan__details">
          <div>
            <span>Keyingi to‘lov</span>
            <strong>15 iyul 2026</strong>
          </div>

          <div>
            <span>Auto-renewal</span>
            <strong>Yoqilgan</strong>
          </div>

          <div>
            <span>Promokod</span>
            <strong>LEVELUP20</strong>
          </div>

          <div>
            <span>Chegirma</span>
            <strong>20%</strong>
          </div>
        </div>

        <div className="billing-current-plan__actions">
          <button
            className="billing-button billing-button--primary"
            type="button"
            onClick={() => alert("Tarifni o‘zgartirish demo rejimda.")}
          >
            Tarifni o‘zgartirish
          </button>

          <button
            className="billing-button billing-button--secondary"
            type="button"
            onClick={() => alert("Obunani boshqarish demo rejimda.")}
          >
            Obunani boshqarish
          </button>
        </div>
      </div>

      <div className="billing-stats">
        <article className="billing-stat billing-stat--blue">
          <span>💎</span>
          <div>
            <small>Mening tarifim</small>
            <strong>{activePlan.title}</strong>
            <p>Active obuna</p>
          </div>
        </article>

        <article className="billing-stat billing-stat--green">
          <span>📅</span>
          <div>
            <small>Keyingi to‘lov</small>
            <strong>15 iyul</strong>
            <p>Avto-yangilash</p>
          </div>
        </article>

        <article className="billing-stat billing-stat--orange">
          <span>🏷️</span>
          <div>
            <small>Chegirma</small>
            <strong>20%</strong>
            <p>LEVELUP20 aktiv</p>
          </div>
        </article>

        <article className="billing-stat billing-stat--purple">
          <span>🎓</span>
          <div>
            <small>Mentor kreditlari</small>
            <strong>2 ta dars</strong>
            <p>Joriy oy uchun</p>
          </div>
        </article>
      </div>

      <div className="billing-section-title">
        <div>
          <span>Tariflar</span>
          <h2>O‘zingizga mos paketni tanlang</h2>
        </div>

        <p>Free tarifda 5 ta test bor, Writing va Speaking tekshiruvi kirmaydi.</p>
      </div>

      <div className="billing-plans">
        {plans.map((plan) => {
          const isSelected = plan.id === selectedPlanId;

          return (
            <article
              className={`billing-plan billing-plan--${plan.tone} ${
                isSelected ? "billing-plan--active" : ""
              }`}
              key={plan.id}
            >
              <div className="billing-plan__top">
                <div>
                  <span>{plan.title}</span>
                  <h3>{plan.price}</h3>
                  <p>{plan.period}</p>
                </div>

                {plan.recommended && (
                  <strong className="billing-plan__recommended">
                    Tavsiya etiladi
                  </strong>
                )}

                {isSelected && (
                  <strong className="billing-plan__active">Joriy tarif</strong>
                )}
              </div>

              <p className="billing-plan__subtitle">{plan.subtitle}</p>

              <ul className="billing-plan__features">
                {plan.features.map((feature) => (
                  <li
                    className={
                      feature.included
                        ? "billing-feature billing-feature--included"
                        : "billing-feature billing-feature--disabled"
                    }
                    key={feature.label}
                  >
                    <span>{feature.included ? "✓" : "×"}</span>
                    {feature.label}
                  </li>
                ))}
              </ul>

              <button
                className={
                  isSelected
                    ? "billing-button billing-button--secondary billing-plan__button"
                    : "billing-button billing-button--primary billing-plan__button"
                }
                type="button"
                onClick={() => handlePlanAction(plan)}
              >
                {isSelected ? "Joriy tarif" : "Tanlash"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="billing-grid-two">
        <article className="billing-card billing-promo">
          <div className="billing-card__header">
            <span>Promokod</span>
            <h2>Chegirma kodini qo‘llash</h2>
            <p>Promokod keyingi to‘lovga avtomatik qo‘llanadi.</p>
          </div>

          <div className="billing-promo__form">
            <input
              type="text"
              placeholder="Promokod kiriting"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
            />

            <button
              className="billing-button billing-button--primary"
              type="button"
              onClick={handleApplyPromo}
            >
              Qo‘llash
            </button>
          </div>

          <div className="billing-promo__active">
            <span>Aktiv promokod</span>
            <strong>LEVELUP20</strong>
            <small>20% chegirma keyingi to‘lovga qo‘llanadi.</small>
          </div>

          {promoMessage && (
            <p className="billing-message">{promoMessage}</p>
          )}
        </article>

        <article className="billing-card billing-payment-method">
          <div className="billing-card__header">
            <span>To‘lov usuli</span>
            <h2>Biriktirilgan karta</h2>
            <p>Obuna to‘lovi shu karta orqali amalga oshiriladi.</p>
          </div>

          <div className="billing-bank-card">
            <div>
              <span>Visa</span>
              <strong>**** 4821</strong>
            </div>

            <div>
              <small>Karta egasi</small>
              <b>Mirjalol Bakhtiyorov</b>
            </div>

            <div>
              <small>Amal qilish muddati</small>
              <b>12/28</b>
            </div>
          </div>

          <button
            className="billing-button billing-button--secondary"
            type="button"
            onClick={handleChangeCard}
          >
            Kartani o‘zgartirish
          </button>
        </article>
      </div>

      <article className="billing-card billing-history">
        <div className="billing-card__header billing-card__header--row">
          <div>
            <span>To‘lov tarixi</span>
            <h2>Oxirgi operatsiyalar</h2>
          </div>

          <button
            className="billing-button billing-button--secondary"
            type="button"
            onClick={handleInvoiceDownload}
          >
            Barcha invoice
          </button>
        </div>

        <div className="billing-history-table">
          <div className="billing-history-table__head">
            <span>Sana</span>
            <span>Xizmat</span>
            <span>Tarif</span>
            <span>Summa</span>
            <span>Holat</span>
            <span>Invoice</span>
          </div>

          {paymentHistory.map((payment) => (
            <div className="billing-history-table__row" key={payment.id}>
              <span>{payment.date}</span>
              <strong>{payment.service}</strong>
              <span>{payment.plan}</span>
              <strong>{payment.amount}</strong>
              <span className="billing-status-badge billing-status-badge--success">
                {payment.status}
              </span>
              <button type="button" onClick={handleInvoiceDownload}>
                Yuklab olish
              </button>
            </div>
          ))}
        </div>
      </article>

      <div className="billing-grid-two">
        <article className="billing-card billing-mentor-payments">
          <div className="billing-card__header">
            <span>Jonli darslar</span>
            <h2>Mentor dars xarajatlari</h2>
            <p>Joriy oyda mentorlar bilan o‘tilgan darslar bo‘yicha hisob.</p>
          </div>

          <div className="billing-mentor-payments__summary">
            <strong>240 000 so‘m</strong>
            <span>2 ta dars</span>
          </div>

          <div className="billing-mentor-payments__next">
            <span>Keyingi dars</span>
            <strong>18 iyul, 19:00</strong>
          </div>

          <button
            className="billing-button billing-button--primary"
            type="button"
            onClick={() => alert("Darslar sahifasi tez orada ulanadi.")}
          >
            Darslarimni ko‘rish
          </button>
        </article>

        <article className="billing-card billing-help">
          <div className="billing-card__header">
            <span>Yordam</span>
            <h2>To‘lov bo‘yicha yordam kerakmi?</h2>
            <p>
              To‘lov, invoice yoki obuna bilan bog‘liq savollar bo‘lsa,
              qo‘llab-quvvatlash xizmatiga murojaat qiling.
            </p>
          </div>

          <button
            className="billing-button billing-button--secondary"
            type="button"
            onClick={handleSupport}
          >
            Supportga yozish
          </button>
        </article>
      </div>
    </section>
  );
}

export default BillingPage;
