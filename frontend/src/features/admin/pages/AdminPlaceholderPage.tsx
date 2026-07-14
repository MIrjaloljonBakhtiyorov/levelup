import { useLocation } from "react-router";

function AdminPlaceholderPage() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const title = parts[parts.length - 1]
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Sahifa";

  return (
    <section className="admin-placeholder">
      <span>Tez kunda</span>
      <h2>{title}</h2>
      <p>Bu qism dasturchi tomonidan tez orada yaratiladi.</p>
    </section>
  );
}

export default AdminPlaceholderPage;
