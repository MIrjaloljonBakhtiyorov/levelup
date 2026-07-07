import { Outlet } from "react-router";

import SiteFooter from "../components/footer/SiteFooter";
import Navbar from "../components/navigation/Navbar";

function PublicLayout() {
  return (
    <div className="public-layout">
      <Navbar />

      <Outlet />

      <SiteFooter />
    </div>
  );
}

export default PublicLayout;
