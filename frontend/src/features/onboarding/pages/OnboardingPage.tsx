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
  label: string;
  question: string;
  subtitle: string;
  options: string[];
};

const onboardingSteps: OnboardingStep[] = [
  {
    key: "exam",
    label: "Exam",
    question: "Which exam are you preparing for?",
    subtitle: "Your plan will be tailored to the exact exam format.",
    options: ["IELTS", "Multilevel / CEFR", "TOEFL", "SAT", "Not sure yet"],
  },
  {
    key: "level",
    label: "Current level",
    question: "What is your current English level?",
    subtitle: "Choosing a starting point helps us make your path clearer.",
    options: [
      "Beginner",
      "Elementary",
      "Pre-Intermediate",
      "Intermediate",
      "Upper-Intermediate",
      "Advanced",
      "Not sure yet",
    ],
  },
  {
    key: "targetScore",
    label: "Target score",
    question: "What target score are you aiming for?",
    subtitle: "Your target score helps set the right pace and practice level.",
    options: ["5.5", "6.0", "6.5", "7.0", "7.5", "8.0+"],
  },
  {
    key: "timeline",
    label: "Timeline",
    question: "How soon do you want to reach your goal?",
    subtitle: "Your timeline helps us choose the right study intensity.",
    options: ["1 month", "3 months", "6 months", "1 year", "Not sure yet"],
  },
  {
    key: "dailyTime",
    label: "Daily time",
    question: "How much time can you study each day?",
    subtitle: "Your daily availability helps us create a realistic study plan.",
    options: ["30 minutes", "1 hour", "2 hours", "3+ hours"],
  },
  {
    key: "weakSkill",
    label: "Focus skill",
    question: "Which skill needs the most improvement?",
    subtitle: "The area you select will become your plan's first focus.",
    options: [
      "Listening",
      "Reading",
      "Writing",
      "Speaking",
      "Grammar",
      "Vocabulary",
      "Not sure yet",
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
        label: step.label,
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
    navigate("/onboarding/preparing", { replace: true });
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
            <h1>We’ll tailor your study plan to you.</h1>
            <p>
              Answer six quick questions. We’ll then create a personalized
              study path based on your goal, available time, and areas to improve.
            </p>
          </div>

          <div className="onboarding-panel__bottom">
            <div className="onboarding-mentor">
              <img
                src="https://i.pinimg.com/736x/39/66/f2/3966f2a6890b2951d3e9c927aa7b3378.jpg"
                alt="LevelUp study mentor"
              />
            </div>

            <div className="onboarding-summary">
              <div className="onboarding-summary__header">
                <span>Your answers</span>
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
                  A quick summary of your choices will appear here as you go.
                </p>
              )}
            </div>
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
              Back
            </button>

            <button
              className="onboarding-actions__primary"
              type="button"
              disabled={!selectedAnswer}
              onClick={continueOnboarding}
            >
              {currentStepIndex === onboardingSteps.length - 1
                ? "Create my plan"
                : "Continue"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default OnboardingPage;
