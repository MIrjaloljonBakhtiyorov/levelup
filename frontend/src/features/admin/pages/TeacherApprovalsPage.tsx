function TeacherApprovalsPage() {
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

      <h2>Teacher Approvals</h2>

      <p>
        This section allows teachers to submit applications to teach on the platform.
        <br />
        Admins can then review, approve, or reject their requests.
      </p>

      <p style={{ marginTop: "8px", color: "#64748b", fontSize: "var(--adm-fs-sm)" }}>
        This feature is currently being built by the developer and will be available soon.
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

export default TeacherApprovalsPage;
