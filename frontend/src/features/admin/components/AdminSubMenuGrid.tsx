import { adminMenuGroups, type AdminMenuItem } from "../constants/adminNavigation";

export type AdminMenuSelection = {
  id: string;
  title: string;
  parentTitle?: string;
  type: "menu";
};

type AdminSubMenuGridProps = {
  groupTitle: string;
  activeMenu: AdminMenuSelection | null;
  onSelectMenu: (menu: AdminMenuSelection) => void;
};

function SubItemCard({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`admin-sub-card ${isActive ? "is-active" : ""}`}
      type="button"
      onClick={onClick}
    >
      <span className="admin-sub-card__dot" aria-hidden="true" />
      <span className="admin-sub-card__label">{label}</span>
    </button>
  );
}

function GroupCard({
  title,
  count,
  isActive,
  onClick,
}: {
  title: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`admin-sub-group-card ${isActive ? "is-active" : ""}`}
      type="button"
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span className="admin-sub-group-card__count">{count}</span>
    </button>
  );
}

function AdminSubMenuGrid({
  groupTitle,
  activeMenu,
  onSelectMenu,
}: AdminSubMenuGridProps) {
  const group = adminMenuGroups.find((g) => g.title === groupTitle);

  if (!group) return null;

  const simpleItems: string[] = [];
  const nestedItems: { title: string; items: string[] }[] = [];

  group.items.forEach((item: AdminMenuItem) => {
    if (typeof item === "string") {
      simpleItems.push(item);
    } else {
      nestedItems.push(item);
    }
  });

  // Find which nested group is currently open
  const openNestedGroup = nestedItems.find((nested) => {
    const subId = `${groupTitle}-${nested.title}`;
    return (
      activeMenu?.id === subId ||
      activeMenu?.parentTitle === `${groupTitle} / ${nested.title}` ||
      activeMenu?.parentTitle?.startsWith(`${groupTitle} / ${nested.title}`)
    );
  });

  return (
    <section className="admin-sub-grid">
      <div className="admin-sub-grid__header">
        <h2>{groupTitle}</h2>
        <span>{group.items.length} ta bo'lim</span>
      </div>

      {/* Simple string items */}
      {simpleItems.length > 0 && (
        <div className="admin-sub-grid__cards">
          {simpleItems.map((item) => {
            const itemId = `${groupTitle}-${item}`;
            return (
              <SubItemCard
                key={item}
                label={item}
                isActive={activeMenu?.id === itemId}
                onClick={() =>
                  onSelectMenu({
                    id: itemId,
                    title: item,
                    parentTitle: groupTitle,
                    type: "menu",
                  })
                }
              />
            );
          })}
        </div>
      )}

      {/* Nested group cards (clickable headers) */}
      {nestedItems.length > 0 && (
        <div className="admin-sub-grid__groups">
          {nestedItems.map((nested) => {
            const subId = `${groupTitle}-${nested.title}`;
            const isActive =
              activeMenu?.id === subId ||
              activeMenu?.parentTitle === `${groupTitle} / ${nested.title}` ||
              (activeMenu?.parentTitle?.startsWith(`${groupTitle} / ${nested.title}`) ?? false);

            return (
              <GroupCard
                key={nested.title}
                title={nested.title}
                count={nested.items.length}
                isActive={isActive}
                onClick={() =>
                  onSelectMenu({
                    id: subId,
                    title: nested.title,
                    parentTitle: groupTitle,
                    type: "menu",
                  })
                }
              />
            );
          })}
        </div>
      )}

      {/* Expanded sub-items for the active nested group */}
      {openNestedGroup && (
        <div className="admin-sub-grid__expanded">
          <div className="admin-sub-grid__expanded-header">
            <h3>{openNestedGroup.title}</h3>
            <span>{openNestedGroup.items.length} ta</span>
          </div>
          <div className="admin-sub-grid__cards">
            {openNestedGroup.items.map((nestedItem) => {
              const subId = `${groupTitle}-${openNestedGroup.title}`;
              const nestedId = `${subId}-${nestedItem}`;
              return (
                <SubItemCard
                  key={nestedItem}
                  label={nestedItem}
                  isActive={activeMenu?.id === nestedId}
                  onClick={() =>
                    onSelectMenu({
                      id: nestedId,
                      title: nestedItem,
                      parentTitle: `${groupTitle} / ${openNestedGroup.title}`,
                      type: "menu",
                    })
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminSubMenuGrid;
