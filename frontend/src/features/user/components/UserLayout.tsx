import { useState } from "react";
import { Outlet } from "react-router";

import UserSidebar from "./UserSidebar";
import UserTopbar from "./UserTopbar";
import { UserI18nProvider } from "../i18n/UserI18n";
import "../styles/user.css";

function UserLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <UserI18nProvider>
      <main className="user-layout">
        <UserSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        <section className="user-main">
          <UserTopbar onOpenMenu={() => setIsMenuOpen(true)} />
          <Outlet />
        </section>
      </main>
    </UserI18nProvider>
  );
}

export default UserLayout;
