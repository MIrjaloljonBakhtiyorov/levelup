import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getAdminToken } from "../../auth/services/adminSession";
import { deleteAdminTest, getAdminTests } from "../services/adminTestsApi";
import type { ExamType, ReadingTest } from "../types/adminTypes";
import { formatDate } from "../utils/adminFormatters";
import AdminSectionTitle from "../components/AdminSectionTitle";

// ─── Config ───────────────────────────────────────────────────────

const EXAM_CONFIG: Record<ExamType, { color: string; bg: string; label: string }> = {
  CEFR:  { color: "#b45309", bg: "#fef3c7", label: "CEFR" },
  IELTS: { color: "#1d4ed8", bg: "#dbeafe", label: "IELTS" },
  TOEFL: { color: "#065f46", bg: "#d1fae5", label: "TOEFL" },
  SAT:   { color: "#7c3aed", bg: "#ede9fe", label: "SAT" },
};

const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  A1: { bg: "#dbeafe", color: "#1d4ed8" },
  A2: { bg: "#e0e7ff", color: "#4338ca" },
  B1: { bg: "#ede9fe", color: "#7c3aed" },
  B2: { bg: "#fce7f3", color: "#be185d" },
  C1: { bg: "#fef3c7", color: "#b45309" },
  C2: { bg: "#dcfce7", color: "#166534" },
};

const PART_LABELS: Record<string, string> = {
  part1: "Part 1 — Gap Fill (6 blanks)",
  part2: "Part 2 — Matching (8Q / 10 options)",
  part3: "Part 3 — Matching (6Q / 8 options)",
  part4: "Part 4 — MCQ + True/False/Not Given",
  part5: "Part 5 — Gap Fill + MCQ",
};

const PART_COLORS: Record<string, { bg: string; color: string }> = {
  part1: { bg: "#dbeafe", color: "#1d4ed8" },
  part2: { bg: "#dcfce7", color: "#166534" },
  part3: { bg: "#ede9fe", color: "#7c3aed" },
  part4: { bg: "#fef3c7", color: "#b45309" },
  part5: { bg: "#fce7f3", color: "#be185d" },
};

function getQuestionCount(test: ReadingTest): number {
  switch (test.part.type) {
    case "part1":
      return test.part.answers.length;
    case "part2":
    case "part3":
      return test.part.questions.length;
    case "part4":
    case "part5":
      return test.part.section1.length + test.part.section2.length;
  }
}

// ─── Delete confirm ───────────────────────────────────────────────

function DeleteConfirm({
  test,
  onConfirm,
  onCancel,
}: {
  test: ReadingTest;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card" style={{ maxWidth: "420px" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)", color: "#be123c" }}>
            Delete Test
          </strong>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}
          >
            ✕
          </button>
        </div>
        <p style={{ margin: "18px 0 24px", color: "#334155", fontSize: "var(--adm-fs-body)", lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>"{test.testName}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              minHeight: "42px", padding: "0 20px",
              border: "1px solid #e2e8f0", borderRadius: "8px",
              background: "#f8fafc", cursor: "pointer",
              fontWeight: 800, fontSize: "var(--adm-fs-body)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              minHeight: "42px", padding: "0 20px",
              border: "none", borderRadius: "8px",
              background: "#be123c", color: "#fff",
              cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)",
            }}
          >
            Delete
          </button>
        </div>
      </article>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────

function ReadingTestsPage() {
  const { examType = "cefr" } = useParams<{ examType: string }>();
  const navigate = useNavigate();

  const exam = examType.toUpperCase() as ExamType;
  const cfg  = EXAM_CONFIG[exam] ?? EXAM_CONFIG.CEFR;

  const [tests, setTests] = useState<ReadingTest[]>([]);
  const [deleting, setDeleting] = useState<ReadingTest | null>(null);
  const [message, setMessage] = useState("");

  const addPath = `/admin/tests/${examType}/reading/add`;

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    getAdminTests<ReadingTest>(token, { kind: "reading", examType: exam })
      .then((result) => setTests(result.tests))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Reading testlar yuklanmadi"));
  }, [exam]);

  async function handleDelete(test: ReadingTest) {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    await deleteAdminTest(token, "reading", test.id);
    setTests((current) => current.filter((item) => item.id !== test.id));
    setDeleting(null);
  }

  return (
    <>
      <section className="admin-table-section">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <AdminSectionTitle
            title={`${cfg.label} — Reading Tests`}
            description="List of all reading tests."
            meta={`${tests.length} tests`}
          />
          <div style={{ padding: "18px 20px 0 0" }}>
            <button
              type="button"
              onClick={() => navigate(addPath)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                minHeight: "44px", padding: "0 22px",
                border: "none", borderRadius: "10px",
                background: "#2563eb", color: "#fff",
                cursor: "pointer", fontWeight: 900,
                fontSize: "var(--adm-fs-body)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                transition: "background 150ms, transform 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Test
            </button>
          </div>
        </div>

        {message && <p className="admin-message" style={{ margin: "0 20px 16px" }}>{message}</p>}

        {/* Badge */}
        <div style={{ padding: "0 20px 4px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "4px 14px", borderRadius: "999px",
            background: cfg.bg, color: cfg.color,
            fontSize: "var(--adm-fs-sm)", fontWeight: 900,
          }}>
            {cfg.label} · Reading
          </span>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Test Name</th>
                <th>Part</th>
                <th>Level</th>
                <th>Questions</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, idx) => {
                const lvlCfg  = LEVEL_COLORS[test.level] ?? { bg: "#f1f5f9", color: "#475569" };
                const partCfg = PART_COLORS[test.part.type] ?? { bg: "#f1f5f9", color: "#475569" };
                return (
                  <tr key={test.id}>
                    <td><span className="admin-row-number">{idx + 1}</span></td>

                    <td>
                      <strong style={{ color: "#0f172a", fontSize: "var(--adm-fs-body)" }}>
                        {test.testName}
                      </strong>
                    </td>

                    <td>
                      <span style={{
                        padding: "3px 10px", borderRadius: "999px",
                        background: partCfg.bg, color: partCfg.color,
                        fontSize: "var(--adm-fs-tag)", fontWeight: 900, whiteSpace: "nowrap",
                      }}>
                        {PART_LABELS[test.part.type]}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        padding: "3px 10px", borderRadius: "999px",
                        background: lvlCfg.bg, color: lvlCfg.color,
                        fontSize: "var(--adm-fs-tag)", fontWeight: 900,
                      }}>
                        {test.level}
                      </span>
                    </td>

                    <td>
                      <span style={{ color: "#334155", fontSize: "var(--adm-fs-sm)", fontWeight: 700 }}>
                        {getQuestionCount(test)} questions
                      </span>
                    </td>

                    <td style={{ whiteSpace: "nowrap", color: "#64748b", fontSize: "var(--adm-fs-sm)" }}>
                      {formatDate(test.createdAt)}
                    </td>

                    <td>
                      <div className="admin-user-actions">
                        <button
                          type="button"
                          title="Delete"
                          aria-label="Delete"
                          className="admin-user-actions__danger"
                          onClick={() => setDeleting(test)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" /><path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {tests.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-dashboard-empty">
                      <strong>No reading tests yet</strong>
                      <span>
                        Click{" "}
                        <button
                          type="button"
                          onClick={() => navigate(addPath)}
                          style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 900, fontSize: "inherit" }}
                        >
                          "Add Test"
                        </button>{" "}
                        to create your first reading test.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {deleting && (
        <DeleteConfirm
          test={deleting}
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}

export default ReadingTestsPage;
