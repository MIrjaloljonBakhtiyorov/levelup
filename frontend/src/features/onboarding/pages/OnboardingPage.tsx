import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import "../styles/onboarding.css";

const LEARNING_PROFILE_KEY = "levelup_learning_profile";

export type OnboardingAnswer = {
  exam: string;
  level: string;
  targetScore: string;
  timeline: string;
  dailyTime: string;
  weakSkill: string;
};

export type OnboardingStep = {
  key: keyof OnboardingAnswer;
  question: string;
  subtitle: string;
  options: string[];
};

const onboardingSteps: OnboardingStep[] = [
  {
    key: "exam",
    question: "Qaysi imtihonga tayyorlanyapsiz?",
    subtitle: "Reja aynan imtihon formatiga moslashadi.",
    options: ["IELTS", "Multilevel / CEFR", "TOEFL", "SAT", "Hali bilmayman"],
  },
  {
    key: "level",
    question: "Hozirgi darajangiz qanday?",
    subtitle: "Boshlang‘ich nuqtani tanlasak, yo‘l aniqroq bo‘ladi.",
    options: [
      "Beginner",
      "Elementary",
      "Pre-Intermediate",
      "Intermediate",
      "Upper-Intermediate",
      "Advanced",
      "Bilmayman",
    ],
  },
  {
    key: "targetScore",
    question: "Maqsad ballingiz nechchi?",
    subtitle: "Maqsad ball sizga kerakli tezlik va mashqlarni belgilaydi.",
    options: ["5.5", "6.0", "6.5", "7.0", "7.5", "8.0+"],
  },
  {
    key: "timeline",
    question: "Qancha vaqtda erishmoqchisiz?",
    subtitle: "Muddat reja intensivligini tanlashga yordam beradi.",
    options: ["1 oy", "3 oy", "6 oy", "1 yil", "Aniq bilmayman"],
  },
  {
    key: "dailyTime",
    question: "Kuniga qancha vaqt ajrata olasiz?",
    subtitle: "Kunlik vaqtga qarab realistik study plan tuziladi.",
    options: ["30 daqiqa", "1 soat", "2 soat", "3+ soat"],
  },
  {
    key: "weakSkill",
    question: "Qaysi skill eng zaif?",
    subtitle: "Zaif joyingiz rejaning birinchi fokusiga aylanadi.",
    options: [
      "Listening",
      "Reading",
      "Writing",
      "Speaking",
      "Grammar",
      "Vocabulary",
      "Bilmayman",
    ],
  },
];

const initialAnswers: OnboardingAnswer = {
  exam: "",
  level: "",
  targetScore: "",
  timeline: "",
  dailyTime: "",
  weakSkill: "",
};

function OnboardingPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswer>(initialAnswers);
  const navigate = useNavigate();

  const currentStep = onboardingSteps[currentStepIndex];
  const selectedAnswer = answers[currentStep.key];
  const progressPercent = Math.round(
    ((currentStepIndex + 1) / onboardingSteps.length) * 100,
  );

  const answeredSteps = useMemo(
    () =>
      onboardingSteps.filter((step) => answers[step.key]).map((step) => ({
        label: step.question,
        value: answers[step.key],
      })),
    [answers],
  );

  function selectOption(value: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentStep.key]: value,
    }));
  }

  function goBack() {
    setCurrentStepIndex((stepIndex) => Math.max(0, stepIndex - 1));
  }

  function continueOnboarding() {
    if (!selectedAnswer) {
      return;
    }

    const isLastStep = currentStepIndex === onboardingSteps.length - 1;

    if (!isLastStep) {
      setCurrentStepIndex((stepIndex) => stepIndex + 1);
      return;
    }

    localStorage.setItem(LEARNING_PROFILE_KEY, JSON.stringify(answers));
    navigate("/onboarding/preparing");
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-shell">
        <aside className="onboarding-panel">
          <div className="onboarding-brand">
            <span>LU</span>
            <strong>LevelUp</strong>
          </div>

          <div className="onboarding-panel__copy">
            <span>AI study plan</span>
            <h1>O‘qish rejangizni sizga moslab tuzamiz.</h1>
            <p>
              6 ta qisqa savolga javob bering. Keyin sizga maqsad, vaqt va
              zaif skill bo‘yicha shaxsiy o‘quv yo‘nalishi tayyorlanadi.
            </p>
          </div>

          <div className="onboarding-summary">
            <div className="onboarding-summary__header">
              <span>Tanlangan javoblar</span>
              <strong>{answeredSteps.length}/{onboardingSteps.length}</strong>
            </div>

            {answeredSteps.length > 0 ? (
              <div className="onboarding-summary__list">
                {answeredSteps.map((item) => (
                  <div className="onboarding-summary__item" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="onboarding-summary__empty">
                Javob tanlaganingiz sari qisqa summary shu yerda ko‘rinadi.
              </p>
            )}
          </div>
        </aside>

        <section className="onboarding-card">
          <div className="onboarding-progress">
            <div>
              <span>Step {currentStepIndex + 1}</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="onboarding-progress__track">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="onboarding-question">
            <span>{currentStep.subtitle}</span>
            <h2>{currentStep.question}</h2>
          </div>

          <div className="onboarding-options">
            {currentStep.options.map((option) => {
              const isSelected = option === selectedAnswer;

              return (
                <button
                  className={`onboarding-option ${
                    isSelected ? "onboarding-option--selected" : ""
                  }`}
                  key={option}
                  type="button"
                  onClick={() => selectOption(option)}
                >
                  <span>{option}</span>
                  {isSelected && <strong aria-hidden="true">✓</strong>}
                </button>
              );
            })}
          </div>

          <div className="onboarding-actions">
            <button
              className="onboarding-actions__secondary"
              type="button"
              disabled={currentStepIndex === 0}
              onClick={goBack}
            >
              Orqaga
            </button>

            <button
              className="onboarding-actions__primary"
              type="button"
              disabled={!selectedAnswer}
              onClick={continueOnboarding}
            >
              {currentStepIndex === onboardingSteps.length - 1
                ? "Rejani yaratish"
                : "Davom etish"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default OnboardingPage;
