import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import AuthLayout from "../features/auth/components/AuthLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import RequireAdmin from "../features/auth/components/RequireAdmin";
import AdminPage from "../features/admin/pages/AdminPage";
import HomePage from "../features/home/pages/HomePage";
import OnboardingPage from "../features/onboarding/pages/OnboardingPage";
import StudyPlanPreparingPage from "../features/onboarding/pages/StudyPlanPreparingPage";
import BillingPage from "../features/user/pages/BillingPage";
import FreeLessonsPage from "../features/user/pages/FreeLessonsPage";
import MentorsPage from "../features/user/pages/MentorsPage";
import MonthlyResultsPage from "../features/user/pages/MonthlyResultsPage";
import MyCoursesPage from "../features/user/pages/MyCoursesPage";
import NotificationsPage from "../features/user/pages/NotificationsPage";
import ProfilePage from "../features/user/pages/ProfilePage";
import ResourcesPage from "../features/user/pages/ResourcesPage";
import { TodayStudyPlanPage, WeeklyStudyPlanPage } from "../features/user/pages/StudyPlanPage";
import TestsPage from "../features/user/pages/TestsPage";
import UserLayout from "../features/user/components/UserLayout";
import UserDashboardPage from "../features/user/pages/UserDashboardPage";
import PublicLayout from "../layouts/PublicLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/preparing" element={<StudyPlanPreparingPage />} />

        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate replace to="/user/dashboard" />} />
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="free-lessons" element={<FreeLessonsPage />} />
          <Route path="study-plan" element={<Navigate replace to="/user/study-plan/today" />} />
          <Route path="study-plan/today" element={<TodayStudyPlanPage />} />
          <Route path="study-plan/week" element={<WeeklyStudyPlanPage />} />
          <Route path="courses" element={<MyCoursesPage />} />
          <Route path="results" element={<MonthlyResultsPage />} />
          <Route path="mentors" element={<MentorsPage />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="tests/:testId" element={<TestsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
