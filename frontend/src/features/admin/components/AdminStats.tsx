import { statCards } from "../constants/adminNavigation";

type AdminStatsProps = {
  stats: Record<(typeof statCards)[number]["key"], number>;
};

function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="admin-stats" aria-label="Foydalanuvchilar statistikasi">
      {statCards.map((card) => (
        <div className={`admin-stat admin-stat--${card.key}`} key={card.key}>
          <span>{card.label}</span>
          <strong>{stats[card.key]}</strong>
        </div>
      ))}
    </div>
  );
}

export default AdminStats;
