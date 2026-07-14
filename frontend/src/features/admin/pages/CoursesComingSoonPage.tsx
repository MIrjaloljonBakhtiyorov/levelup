import ExamCoursesPage from "./ExamCoursesPage";

export function GrammarCoursesPage() {
  return <ExamCoursesPage examType="Grammar" />;
}

export function ToeflCoursesPage() {
  return <ExamCoursesPage examType="TOEFL" />;
}

export function SatCoursesPage() {
  return <ExamCoursesPage examType="SAT" />;
}
