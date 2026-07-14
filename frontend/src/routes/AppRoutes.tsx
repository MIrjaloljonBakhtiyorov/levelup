import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import AuthLayout          from "../features/auth/components/AuthLayout";
import LoginPage           from "../features/auth/pages/LoginPage";
import RegisterPage        from "../features/auth/pages/RegisterPage";
import RequireAdmin        from "../features/auth/components/RequireAdmin";

import AdminPage            from "../features/admin/pages/AdminPage";
import AdminDashboardPage   from "../features/admin/pages/AdminDashboardPage";
import PupilsPage           from "../features/admin/pages/PupilsPage";
import BlockedUsersPage     from "../features/admin/pages/BlockedUsersPage";
import TeachersPage         from "../features/admin/pages/TeachersPage";
import AddCoursePage        from "../features/admin/pages/AddCoursePage";
import CefrCoursesPage      from "../features/admin/pages/CefrCoursesPage";
import IeltsCoursesPage     from "../features/admin/pages/IeltsCoursesPage";
import { GrammarCoursesPage, ToeflCoursesPage, SatCoursesPage } from "../features/admin/pages/CoursesComingSoonPage";
import ListeningTestsPage   from "../features/admin/pages/ListeningTestsPage";
import AddListeningTestPage from "../features/admin/pages/AddListeningTestPage";
import AdminPlaceholderPage from "../features/admin/pages/AdminPlaceholderPage";
import PodcastsPage         from "../features/admin/pages/PodcastsPage";
import ArticlesPage         from "../features/admin/pages/ArticlesPage";
import CinemaPage           from "../features/admin/pages/CinemaPage";
import CartoonPage          from "../features/admin/pages/CartoonPage";
import TeacherProfilesPage  from "../features/admin/pages/TeacherProfilesPage";
import TeacherApprovalsPage from "../features/admin/pages/TeacherApprovalsPage";
import ReadingTestsPage     from "../features/admin/pages/ReadingTestsPage";
import AddReadingTestPage   from "../features/admin/pages/AddReadingTestPage";
import WritingTestsPage     from "../features/admin/pages/WritingTestsPage";
import AddWritingTestPage   from "../features/admin/pages/AddWritingTestPage";
import SpeakingTestsPage    from "../features/admin/pages/SpeakingTestsPage";
import AddSpeakingTestPage  from "../features/admin/pages/AddSpeakingTestPage";
import { AddExtraTestPage, ExtraTestsPage } from "../features/admin/pages/ExtraTestsPage";
import SecuritySettingsPage from "../features/admin/pages/SecuritySettingsPage";

import HomePage              from "../features/home/pages/HomePage";
import OnboardingPage        from "../features/onboarding/pages/OnboardingPage";
import StudyPlanPreparingPage from "../features/onboarding/pages/StudyPlanPreparingPage";
import BillingPage           from "../features/user/pages/BillingPage";
import FreeLessonsPage       from "../features/user/pages/FreeLessonsPage";
import LessonPlayerPage      from "../features/user/pages/LessonPlayerPage";
import MentorsPage           from "../features/user/pages/MentorsPage";
import MonthlyResultsPage    from "../features/user/pages/MonthlyResultsPage";
import MyCoursesPage         from "../features/user/pages/MyCoursesPage";
import NotificationsPage     from "../features/user/pages/NotificationsPage";
import ProfilePage           from "../features/user/pages/ProfilePage";
import ResourcesPage         from "../features/user/pages/ResourcesPage";
import { TodayStudyPlanPage, WeeklyStudyPlanPage } from "../features/user/pages/StudyPlanPage";
import TestsPage             from "../features/user/pages/TestsPage";
import TestRunnerPage        from "../features/user/pages/TestRunnerPage";
import UserLayout            from "../features/user/components/UserLayout";
import UserDashboardPage     from "../features/user/pages/UserDashboardPage";
import PublicLayout          from "../layouts/PublicLayout";
import { HomeI18nProvider } from "../features/home/i18n/HomeI18n";
import { PrivacyPage, TermsPage } from "../features/legal/pages/LegalPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>

        {/* ── Auth ── */}
        <Route element={<HomeI18nProvider><AuthLayout /></HomeI18nProvider>}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Onboarding ── */}
        <Route path="/onboarding"          element={<OnboardingPage />} />
        <Route path="/onboarding/preparing" element={<StudyPlanPreparingPage />} />

        {/* ── User ── */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate replace to="/user/dashboard" />} />
          <Route path="dashboard"         element={<UserDashboardPage />} />
          <Route path="free-lessons"      element={<FreeLessonsPage />} />
          <Route path="study-plan"        element={<Navigate replace to="/user/study-plan/today" />} />
          <Route path="study-plan/today"  element={<TodayStudyPlanPage />} />
          <Route path="study-plan/week"   element={<WeeklyStudyPlanPage />} />
          <Route path="courses"           element={<MyCoursesPage />} />
          <Route path="courses/:courseId/learn" element={<LessonPlayerPage />} />
          <Route path="courses/:courseId/learn/:lessonId" element={<LessonPlayerPage />} />
          <Route path="results"           element={<MonthlyResultsPage />} />
          <Route path="mentors"           element={<MentorsPage />} />
          <Route path="tests"             element={<TestsPage />} />
          <Route path="tests/:testId"     element={<TestsPage />} />
          <Route path="tests/:testId/skill/:skill" element={<TestsPage />} />
          <Route path="tests/take/:testId" element={<TestRunnerPage />} />
          <Route path="resources"         element={<ResourcesPage />} />
          <Route path="billing"           element={<BillingPage />} />
          <Route path="notifications"     element={<NotificationsPage />} />
          <Route path="profile"           element={<ProfilePage />} />
        </Route>

        {/* ── Admin (protected) ── */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminPage />}>

            {/* Dashboard — default */}
            <Route index element={<AdminDashboardPage />} />

            {/* Foydalanuvchilar */}
            <Route path="users">
              <Route index    element={<Navigate replace to="/admin/users/pupils" />} />
              <Route path="pupils"        element={<PupilsPage />} />
              <Route path="teachers"      element={<TeachersPage />} />
              <Route path="blocked"       element={<BlockedUsersPage />} />
              <Route path="login-history" element={<AdminPlaceholderPage />} />
            </Route>

            {/* Kurslar */}
            <Route path="courses">
              <Route index element={<Navigate replace to="/admin/courses/add" />} />

              {/* Yangi kurs qo'shish — har bir exam turi uchun */}
              <Route path="add"          element={<AddCoursePage examType="General" />} />
              <Route path="grammar/add"  element={<AddCoursePage examType="Grammar" />} />
              <Route path="ielts/add"    element={<AddCoursePage examType="IELTS" />} />
              <Route path="toefl/add"    element={<AddCoursePage examType="TOEFL" />} />
              <Route path="sat/add"      element={<AddCoursePage examType="SAT" />} />
              <Route path="cefr/add"     element={<AddCoursePage examType="CEFR" />} />

              {/* Grammar — bepul/pullik jadval */}
              <Route path="grammar"      element={<GrammarCoursesPage />} />

              {/* CEFR — bepul/pullik jadval */}
              <Route path="cefr"         element={<CefrCoursesPage />} />

              {/* IELTS — bepul/pullik jadval */}
              <Route path="ielts"        element={<IeltsCoursesPage />} />

              {/* TOEFL va SAT — tez kunda */}
              <Route path="toefl"        element={<ToeflCoursesPage />} />
              <Route path="sat"          element={<SatCoursesPage />} />

              {/* Boshqa kurs bo'limlari — placeholder */}
              <Route path="*"            element={<AdminPlaceholderPage />} />
            </Route>

            {/* ── Xavfsizlik ── */}
            <Route path="security">
              <Route index element={<Navigate replace to="/admin/security/settings" />} />
              <Route path="settings" element={<SecuritySettingsPage view="settings" />} />
              <Route path="blocked-ips" element={<SecuritySettingsPage view="blocked-ips" />} />
              <Route path="login-sessions" element={<SecuritySettingsPage view="login-sessions" />} />
              <Route path="*" element={<Navigate replace to="/admin/security/settings" />} />
            </Route>

            {/* ── Ustozlar ── */}
            <Route path="teachers">
              <Route path="profiles"  element={<TeacherProfilesPage />} />
              <Route path="approvals" element={<TeacherApprovalsPage />} />
              <Route path="*"         element={<AdminPlaceholderPage />} />
            </Route>
            <Route path="content">
              <Route path="podcasts"  element={<PodcastsPage />} />
              <Route path="articles"  element={<ArticlesPage />} />
              <Route path="cinema"    element={<CinemaPage />} />
              <Route path="cartoons"  element={<CartoonPage />} />
              <Route path="*"         element={<AdminPlaceholderPage />} />
            </Route>

            {/* ── Testlar ── */}
            <Route path="tests">
              <Route index element={<Navigate replace to="/admin/tests/cefr/listening" />} />

              {/* Umumiy testlar — examlardan tashqarida */}
              <Route path="vocabulary"     element={<ExtraTestsPage />} />
              <Route path="vocabulary/add" element={<AddExtraTestPage />} />
              <Route path="grammar"        element={<ExtraTestsPage />} />
              <Route path="grammar/add"    element={<AddExtraTestPage />} />
              <Route path="game"           element={<ExtraTestsPage />} />
              <Route path="game/add"       element={<AddExtraTestPage />} />

              {/* Exam testlari — examType URL parametridan olinadi */}
              <Route path=":examType/listening"     element={<ListeningTestsPage />} />
              <Route path=":examType/listening/add" element={<AddListeningTestPage />} />
              <Route path=":examType/reading"       element={<ReadingTestsPage />} />
              <Route path=":examType/reading/add"   element={<AddReadingTestPage />} />
              <Route path=":examType/writing"       element={<WritingTestsPage />} />
              <Route path=":examType/writing/add"   element={<AddWritingTestPage />} />
              <Route path=":examType/speaking"      element={<SpeakingTestsPage />} />
              <Route path=":examType/speaking/add"  element={<AddSpeakingTestPage />} />

              {/* Placeholder qolganlar uchun */}
              <Route path="*" element={<AdminPlaceholderPage />} />
            </Route>

            {/* Qolgan bo'limlar — placeholder */}
            <Route path="*" element={<AdminPlaceholderPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
