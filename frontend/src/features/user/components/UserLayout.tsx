import { useState } from "react";
import { Outlet } from "react-router";

import UserSidebar from "./UserSidebar";
import UserTopbar from "./UserTopbar";
import "../styles/user.css";

function UserLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="user-layout">
      <UserSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="user-main">
        <UserTopbar onOpenMenu={() => setIsMenuOpen(true)} />
        <Outlet />
      </section>
    </main>
  );
}

export default UserLayout;
