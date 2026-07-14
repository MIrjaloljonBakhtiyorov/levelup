import { useLocation } from "react-router";

const EXAM_LABELS: Record<string, string> = {
  toefl: "TOEFL",
  sat: "SAT",
};

function TestsComingSoonPage() {
  const { pathname } = useLocation();
  const examType = pathname.split("/").find((p) => EXAM_LABELS[p.toLowerCase()]) ?? "";
  const label = EXAM_LABELS[examType.toLowerCase()] ?? examType.toUpperCase();

  return (
    <section className="admin-placeholder">
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 14px",
          borderRadius: "999px",
          background: "#fef3c7",
          color: "#b45309",
          fontSize: "var(--adm-fs-tag)",
          fontWeight: 900,
          marginBottom: "16px",
        }}
      >
        🚧 Under Development
      </span>

      <h2>{label} Tests</h2>

      <p>
        {label} test module is currently being developed by our engineering team.
        <br />
        It will be available soon. Thank you for your patience.
      </p>

      <div
        style={{
          marginTop: "24px",
          padding: "16px 24px",
          borderRadius: "12px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          color: "#475569",
          fontSize: "var(--adm-fs-sm)",
          fontWeight: 700,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
        Coming soon — being built by the developer
      </div>
    </section>
  );
}

export default TestsComingSoonPage;
