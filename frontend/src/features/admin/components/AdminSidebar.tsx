import { useState } from "react";
import { Link } from "react-router";

import { adminMenuGroups, type AdminMenuItem } from "../constants/adminNavigation";

export type AdminMenuSelection = {
  id: string;
  title: string;
  parentTitle?: string;
  type: "dashboard" | "menu";
};

type AdminSidebarProps = {
  activeMenu: AdminMenuSelection | null;
  onSelectMenu: (menu: AdminMenuSelection) => void;
};

function AdminSidebar({
  activeMenu,
  onSelectMenu,
}: AdminSidebarProps) {
  const [openGroup, setOpenGroup] = useState("");
  const [openSubgroup, setOpenSubgroup] = useState("");

  const selectMenu = (id: string, title: string, parentTitle?: string) => {
    onSelectMenu({
      id,
      parentTitle,
      title,
      type: "menu",
    });
  };

  const renderMenuItem = (groupTitle: string, item: AdminMenuItem) => {
    if (typeof item === "string") {
      const itemId = `${groupTitle}-${item}`;

      return (
        <button
          className={activeMenu?.id === itemId ? "is-active" : ""}
          key={item}
          type="button"
          onClick={() => selectMenu(itemId, item, groupTitle)}
        >
          {item}
        </button>
      );
    }

    const subgroupId = `${groupTitle}-${item.title}`;
    const isOpen = openSubgroup === subgroupId;

    return (
      <section className="admin-menu__subgroup" key={item.title}>
        <button
          aria-expanded={isOpen}
          className={`admin-menu__toggle admin-menu__toggle--nested ${
            activeMenu?.id === subgroupId ? "is-active" : ""
          }`}
          type="button"
          onClick={() => {
            setOpenSubgroup((current) => (current === subgroupId ? "" : subgroupId));
            selectMenu(subgroupId, item.title, groupTitle);
          }}
        >
          <span>{item.title}</span>
          <span aria-hidden="true">{isOpen ? "-" : "+"}</span>
        </button>

        {isOpen ? (
          <div className="admin-menu__items admin-menu__items--nested">
            {item.items.map((nestedItem) => {
              const nestedItemId = `${subgroupId}-${nestedItem}`;

              return (
                <button
                  className={activeMenu?.id === nestedItemId ? "is-active" : ""}
                  key={nestedItem}
                  type="button"
                  onClick={() =>
                    selectMenu(nestedItemId, nestedItem, `${groupTitle} / ${item.title}`)
                  }
                >
                  {nestedItem}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>
    );
  };

  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" to="/" aria-label="Mister Italiano">
        <span className="admin-brand__mark">MI</span>
        <span>
          <strong>Mister Italiano</strong>
          <small>Admin workspace</small>
        </span>
      </Link>

      <nav className="admin-menu" aria-label="Admin menyu">
        <button
          className={`admin-menu__primary ${!activeMenu || activeMenu.id === "dashboard" ? "is-active" : ""}`}
          type="button"
          onClick={() =>
            onSelectMenu({
              id: "dashboard",
              title: "Dashboard",
              type: "dashboard",
            })
          }
        >
          Dashboard
        </button>

        {adminMenuGroups.map((group) => (
          <section className="admin-menu__group" key={group.title}>
            <button
              aria-expanded={openGroup === group.title}
              className={`admin-menu__toggle ${activeMenu?.id === group.title ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                setOpenGroup((current) => (current === group.title ? "" : group.title));
                selectMenu(group.title, group.title);
              }}
            >
              <span>{group.title}</span>
              <span aria-hidden="true">{openGroup === group.title ? "-" : "+"}</span>
            </button>

            {openGroup === group.title ? (
              <div className="admin-menu__items">
                {group.items.map((item) => renderMenuItem(group.title, item))}
              </div>
            ) : null}
          </section>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <span>Admin login</span>
        <strong>mister_italiano</strong>
      </div>
    </aside>
  );
}

export default AdminSidebar;
