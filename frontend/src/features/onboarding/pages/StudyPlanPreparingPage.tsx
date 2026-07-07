import { useEffect } from "react";
import { useNavigate } from "react-router";

import {
  clearOnboardingRedirectTarget,
  getOnboardingRedirectTarget,
} from "../../auth/services/userSession";
import "../styles/onboarding.css";

function StudyPlanPreparingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const redirectTarget = getOnboardingRedirectTarget();
      clearOnboardingRedirectTarget();
      navigate(redirectTarget, { replace: true });
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <main className="onboarding-page onboarding-page--center">
      <section className="study-plan-preparing">
        <div className="onboarding-brand study-plan-preparing__brand">
          <span>LU</span>
          <strong>LevelUp</strong>
        </div>

        <div className="study-plan-preparing__loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <span className="study-plan-preparing__eyebrow">Shaxsiy reja</span>
        <h1>Siz uchun belgilangan muddatda o‘quv dasturi taxlanyapti</h1>
        <p>
          Javoblaringiz tahlil qilinmoqda. Maqsadingiz, darajangiz va kunlik
          vaqtingizga mos o‘quv yo‘nalishi tayyorlanadi.
        </p>

        <div className="study-plan-preparing__progress">
          <span />
        </div>
      </section>
    </main>
  );
}

export default StudyPlanPreparingPage;
