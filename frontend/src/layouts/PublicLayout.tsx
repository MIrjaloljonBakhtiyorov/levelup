import { Outlet } from "react-router";

import SiteFooter from "../components/footer/SiteFooter";
import TopBar from "../components/navigation/TopBar";
import Navbar from "../components/navigation/Navbar";
import { HomeI18nProvider } from "../features/home/i18n/HomeI18n";
// public layouts
function PublicLayout() {
  return (
    <HomeI18nProvider>
      <div className="public-layout">
        <TopBar />
        <Navbar />

        <Outlet />

        <SiteFooter />
      </div>
    </HomeI18nProvider>
  );
}

export default PublicLayout;
