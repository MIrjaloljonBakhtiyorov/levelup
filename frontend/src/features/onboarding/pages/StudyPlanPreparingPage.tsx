import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  clearOnboardingRedirectTarget,
  getOnboardingRedirectTarget,
} from "../../auth/services/userSession";
import "../styles/onboarding.css";

function StudyPlanPreparingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 20_000;
    const startedAt = performance.now();
    let frameId = 0;

    function updateProgress(now: number) {
      const nextProgress = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
      setProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = window.requestAnimationFrame(updateProgress);
      }
    }

    frameId = window.requestAnimationFrame(updateProgress);
    const redirectTimerId = window.setTimeout(() => {
      setProgress(100);
      const redirectTarget = getOnboardingRedirectTarget();
      clearOnboardingRedirectTarget();
      navigate(redirectTarget, { replace: true });
    }, duration);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(redirectTimerId);
    };
  }, [navigate]);

  return (
    <main className="onboarding-page onboarding-page--center">
      <section className="study-plan-preparing">
        <div className="onboarding-brand study-plan-preparing__brand">
          <span>LU</span>
          <strong>LevelUp</strong>
        </div>

        <div className="study-plan-preparing__content" aria-live="polite">
          <span className="study-plan-preparing__eyebrow">Personalized plan</span>
          <p className="study-plan-preparing__status">Loading</p>
          <strong className="study-plan-preparing__percentage">{progress}%</strong>

          <div
            className="study-plan-preparing__progress"
            role="progressbar"
            aria-label="Study plan preparation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>

          <h1>Building your study plan</h1>
          <p className="study-plan-preparing__description">
            We’re matching your goal, current level, and daily availability.
          </p>
        </div>
      </section>
    </main>
  );
}

export default StudyPlanPreparingPage;
