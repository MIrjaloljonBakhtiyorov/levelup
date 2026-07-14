import { useEffect, useRef, useState } from "react";

import { getAdminToken } from "../../auth/services/adminSession";
import { createAdminContent, deleteAdminContent, getAdminContent, updateAdminContent } from "../services/adminContentApi";
import type { AdminArticle, ArticleLevel } from "../types/adminTypes";
import { createId, formatDate } from "../utils/adminFormatters";
import AdminSectionTitle from "../components/AdminSectionTitle";

const LEVELS: ArticleLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_COLORS: Record<ArticleLevel, { bg: string; color: string }> = {
  A1: { bg: "#dbeafe", color: "#1d4ed8" },
  A2: { bg: "#e0e7ff", color: "#4338ca" },
  B1: { bg: "#ede9fe", color: "#7c3aed" },
  B2: { bg: "#fce7f3", color: "#be185d" },
  C1: { bg: "#fef3c7", color: "#b45309" },
  C2: { bg: "#dcfce7", color: "#166534" },
};

const FILE_TYPE_CONFIG = {
  pdf:   { label: "PDF",   bg: "#fef2f2", color: "#be123c", icon: "📄" },
  word:  { label: "Word",  bg: "#dbeafe", color: "#1d4ed8", icon: "📝" },
  image: { label: "Image", bg: "#dcfce7", color: "#166534", icon: "🖼️" },
};

// Accepted MIME types per file type
const ACCEPT: Record<"pdf" | "word" | "image", string> = {
  pdf:   ".pdf",
  word:  ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  image: "image/*",
};

const inp: React.CSSProperties = { width: "100%", minHeight: "44px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", font: "inherit", fontSize: "var(--adm-fs-body)", background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const lb: React.CSSProperties  = { fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px" };
const er: React.CSSProperties  = { color: "#be123c", fontSize: "var(--adm-fs-tag)", fontWeight: 700, marginTop: "4px", display: "block" };

// ─── Article Modal ────────────────────────────────────────────────
function ArticleModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: AdminArticle;
  onSave: (a: AdminArticle) => void;
  onClose: () => void;
}) {
  const [title,    setTitle]    = useState(initial?.title    ?? "");
  const [fileType, setFileType] = useState<"pdf" | "word" | "image">(initial?.fileType ?? "pdf");
  const [file,     setFile]     = useState<{ url: string; name: string } | null>(
    initial ? { url: initial.fileUrl, name: initial.fileName } : null
  );
  const [level,    setLevel]    = useState<ArticleLevel>(initial?.level ?? "B1");
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(f?: File) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFile({ url: e.target?.result as string, name: f.name });
      setErrors((p) => ({ ...p, file: "" }));
    };
    reader.readAsDataURL(f);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Enter article title";
    if (!file)         e.file  = "Upload a file";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id:        initial?.id ?? createId(),
      title:     title.trim(),
      fileType,
      fileUrl:   file!.url,
      fileName:  file!.name,
      level,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  }

  const ftCfg = FILE_TYPE_CONFIG[fileType];

  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card" style={{ maxWidth: "520px", width: "100%" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)" }}>
            {initial ? "Edit Article" : "Add Article"}
          </strong>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>✕</button>
        </div>

        <div style={{ display: "grid", gap: "18px", padding: "20px 0 4px" }}>

          {/* Title */}
          <div>
            <label style={lb}>Article title *</label>
            <input style={{ ...inp, borderColor: errors.title ? "#cf6d6d" : undefined }}
              value={title} placeholder="e.g. The Future of English Language Learning"
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }} />
            {errors.title && <span style={er}>{errors.title}</span>}
          </div>

          {/* File type toggle */}
          <div>
            <label style={lb}>File format *</label>
            <div style={{ display: "flex", gap: "0", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", width: "fit-content" }}>
              {(["pdf", "word", "image"] as const).map((t) => {
                const cfg = FILE_TYPE_CONFIG[t];
                return (
                  <button key={t} type="button"
                    onClick={() => { setFileType(t); setFile(null); setErrors((p) => ({ ...p, file: "" })); }}
                    style={{ minHeight: "38px", padding: "0 20px", border: "none", background: fileType === t ? cfg.bg : "#f8fafc", color: fileType === t ? cfg.color : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-sm)", cursor: "pointer", transition: "all 120ms" }}>
                    {cfg.icon} {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* File upload area */}
          <div>
            <label style={lb}>
              Upload {ftCfg.label} file *
              <span style={{ color: "#94a3b8", fontWeight: 600, marginLeft: "6px" }}>
                {fileType === "pdf" ? "(.pdf)" : fileType === "word" ? "(.doc, .docx)" : "(PNG, JPG, WEBP…)"}
              </span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              role="button" tabIndex={0} aria-label="Upload file"
              style={{ cursor: "pointer", border: `2px dashed ${errors.file ? "#cf6d6d" : "#93c5fd"}`, borderRadius: "12px", background: file ? ftCfg.bg : "#f8fafc", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px", transition: "background 150ms" }}>

              {/* Icon */}
              <span style={{ fontSize: "28px", lineHeight: 1 }}>{ftCfg.icon}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                {file ? (
                  <>
                    <span style={{ color: ftCfg.color, fontWeight: 800, fontSize: "var(--adm-fs-sm)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.name}
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      style={{ background: "none", border: "none", color: "#be123c", cursor: "pointer", fontSize: "var(--adm-fs-tag)", fontWeight: 800, padding: 0, marginTop: "2px" }}>
                      Remove
                    </button>
                  </>
                ) : (
                  <span style={{ color: "#64748b", fontWeight: 700, fontSize: "var(--adm-fs-sm)" }}>
                    Click to upload {ftCfg.label} file
                  </span>
                )}
              </div>

              {/* Image preview */}
              {file && fileType === "image" && (
                <img src={file.url} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
              )}
            </div>
            <input ref={fileRef} type="file" accept={ACCEPT[fileType]} style={{ display: "none" }}
              onChange={(e) => handleFileChange(e.target.files?.[0])} />
            {errors.file && <span style={er}>{errors.file}</span>}
          </div>

          {/* Level */}
          <div>
            <label style={lb}>Level *</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {LEVELS.map((l) => {
                const active = level === l;
                const cfg = LEVEL_COLORS[l];
                return (
                  <button key={l} type="button" onClick={() => setLevel(l)}
                    style={{ minWidth: "48px", minHeight: "36px", border: `2px solid ${active ? cfg.color : "#e2e8f0"}`, borderRadius: "8px", background: active ? cfg.bg : "#f8fafc", color: active ? cfg.color : "#475569", fontWeight: 900, fontSize: "var(--adm-fs-sm)", cursor: "pointer", transition: "all 120ms" }}>
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "16px", borderTop: "1px solid #f1f5f9", marginTop: "4px" }}>
          <button type="button" onClick={onClose}
            style={{ minHeight: "42px", padding: "0 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)", color: "#475569" }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            style={{ minHeight: "42px", padding: "0 24px", border: "none", borderRadius: "8px", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)" }}>
            {initial ? "Save Changes" : "Add Article"}
          </button>
        </div>
      </article>
    </div>
  );
}

// ─── Article Card ─────────────────────────────────────────────────
function ArticleCard({ article, onEdit, onDelete }: { article: AdminArticle; onEdit: () => void; onDelete: () => void }) {
  const lvlCfg  = LEVEL_COLORS[article.level];
  const fileCfg = FILE_TYPE_CONFIG[article.fileType];

  return (
    <article style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

      {/* Preview area */}
      <div style={{ background: fileCfg.bg, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "140px", position: "relative" }}>
        {article.fileType === "image" ? (
          <img src={article.fileUrl} alt={article.title} style={{ width: "100%", height: "140px", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "48px", lineHeight: 1 }}>{fileCfg.icon}</span>
            <p style={{ margin: "8px 0 0", fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: fileCfg.color }}>{fileCfg.label}</p>
          </div>
        )}
        {/* Download button */}
        <a
          href={article.fileUrl}
          download={article.fileName}
          style={{ position: "absolute", top: "10px", right: "10px", display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.9)", color: "#334155", fontSize: "var(--adm-fs-tag)", fontWeight: 800, textDecoration: "none", backdropFilter: "blur(4px)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        </a>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "var(--adm-fs-body)", fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>
            {article.title}
          </h3>
          <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: "999px", background: lvlCfg.bg, color: lvlCfg.color, fontSize: "var(--adm-fs-tag)", fontWeight: 900 }}>
            {article.level}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ padding: "2px 8px", borderRadius: "6px", background: fileCfg.bg, color: fileCfg.color, fontSize: "var(--adm-fs-tag)", fontWeight: 800 }}>
            {fileCfg.icon} {fileCfg.label}
          </span>
          <span style={{ color: "#94a3b8", fontSize: "var(--adm-fs-tag)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {article.fileName}
          </span>
        </div>

        <div style={{ color: "#94a3b8", fontSize: "var(--adm-fs-tag)" }}>
          {formatDate(article.createdAt)}
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button type="button" onClick={onEdit}
            style={{ flex: 1, minHeight: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-sm)", color: "#334155" }}>
            Edit
          </button>
          <button type="button" onClick={onDelete}
            style={{ minWidth: "36px", minHeight: "36px", border: "1px solid #fca5a5", borderRadius: "8px", background: "#fef2f2", cursor: "pointer", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────
function DeleteConfirm({ article, onConfirm, onCancel }: { article: AdminArticle; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card" style={{ maxWidth: "420px" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)", color: "#be123c" }}>Delete Article</strong>
          <button type="button" onClick={onCancel} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>✕</button>
        </div>
        <p style={{ margin: "18px 0 24px", color: "#334155", fontSize: "var(--adm-fs-body)", lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>"{article.title}"</strong>? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} style={{ minHeight: "42px", padding: "0 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)" }}>Cancel</button>
          <button type="button" onClick={onConfirm} style={{ minHeight: "42px", padding: "0 20px", border: "none", borderRadius: "8px", background: "#be123c", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)" }}>Delete</button>
        </div>
      </article>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function ArticlesPage() {
  const [articles, setArticles]   = useState<AdminArticle[]>([]);
  const [showAdd,  setShowAdd]    = useState(false);
  const [editing,  setEditing]    = useState<AdminArticle | null>(null);
  const [deleting, setDeleting]   = useState<AdminArticle | null>(null);
  const [search,   setSearch]     = useState("");
  const [levelFilter, setLevelFilter] = useState<ArticleLevel | "">("");
  const [typeFilter,  setTypeFilter]  = useState<"pdf" | "word" | "image" | "">("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    getAdminContent<AdminArticle>(token, "articles")
      .then((result) => setArticles(result.items))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Articllarni yuklab bo'lmadi"));
  }, []);

  const filtered = articles.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchLevel  = !levelFilter || a.level === levelFilter;
    const matchType   = !typeFilter  || a.fileType === typeFilter;
    return matchSearch && matchLevel && matchType;
  });

  async function handleSave(article: AdminArticle) {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    try {
      const { id: _id, createdAt: _createdAt, ...payload } = article;
      const result = editing
        ? await updateAdminContent<AdminArticle>(token, "articles", article.id, payload)
        : await createAdminContent<AdminArticle>(token, "articles", payload);

      setArticles((current) => (
        editing
          ? current.map((item) => item.id === result.item.id ? result.item : item)
          : [result.item, ...current]
      ));
      setShowAdd(false);
      setEditing(null);
      setMessage("");
      window.dispatchEvent(new Event("admin-data-changed"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Article saqlanmadi");
    }
  }

  async function handleDelete(article: AdminArticle) {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    try {
      await deleteAdminContent(token, "articles", article.id);
      setArticles((current) => current.filter((item) => item.id !== article.id));
      setDeleting(null);
      setMessage("");
      window.dispatchEvent(new Event("admin-data-changed"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Article o'chirilmadi");
    }
  }

  return (
    <>
      <section className="admin-table-section">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <AdminSectionTitle title="Articles" description="Manage all reading articles available on the platform." meta={`${articles.length} articles`} />
          <div style={{ padding: "18px 20px 0 0" }}>
            <button type="button" onClick={() => setShowAdd(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 22px", border: "none", borderRadius: "10px", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)", transition: "background 150ms, transform 150ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Add Article
            </button>
          </div>
        </div>

        {/* Filters */}
        {message && <p className="admin-message" style={{ margin: "0 20px 16px" }}>{message}</p>}

        <div style={{ padding: "0 20px 16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <input style={{ ...inp, maxWidth: "260px", minHeight: "38px" }} value={search} placeholder="Search by title…" onChange={(e) => setSearch(e.target.value)} />

          {/* File type filter */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button type="button" onClick={() => setTypeFilter("")} style={{ minHeight: "34px", padding: "0 14px", border: `1px solid ${typeFilter === "" ? "#2563eb" : "#e2e8f0"}`, borderRadius: "8px", background: typeFilter === "" ? "#dbeafe" : "#f8fafc", color: typeFilter === "" ? "#1d4ed8" : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-tag)", cursor: "pointer" }}>All</button>
            {(["pdf", "word", "image"] as const).map((t) => {
              const cfg = FILE_TYPE_CONFIG[t];
              return (
                <button key={t} type="button" onClick={() => setTypeFilter(t === typeFilter ? "" : t)} style={{ minHeight: "34px", padding: "0 14px", border: `1px solid ${typeFilter === t ? cfg.color : "#e2e8f0"}`, borderRadius: "8px", background: typeFilter === t ? cfg.bg : "#f8fafc", color: typeFilter === t ? cfg.color : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-tag)", cursor: "pointer" }}>
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Level filter */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {LEVELS.map((l) => {
              const cfg = LEVEL_COLORS[l];
              return (
                <button key={l} type="button" onClick={() => setLevelFilter(l === levelFilter ? "" : l)} style={{ minHeight: "34px", padding: "0 12px", border: `1px solid ${levelFilter === l ? cfg.color : "#e2e8f0"}`, borderRadius: "8px", background: levelFilter === l ? cfg.bg : "#f8fafc", color: levelFilter === l ? cfg.color : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-tag)", cursor: "pointer" }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{ padding: "0 20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} onEdit={() => setEditing(article)} onDelete={() => setDeleting(article)} />
            ))}
          </div>
        ) : (
          <div className="admin-dashboard-empty" style={{ margin: "0 20px 24px" }}>
            <strong>{search || levelFilter || typeFilter ? "No articles match your filter" : "No articles yet"}</strong>
            <span>
              {!(search || levelFilter || typeFilter) && (
                <button type="button" onClick={() => setShowAdd(true)} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 900, fontSize: "inherit" }}>Add the first article</button>
              )}
            </span>
          </div>
        )}
      </section>

      {(showAdd || editing) && (
        <ArticleModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setShowAdd(false); setEditing(null); }} />
      )}
      {deleting && (
        <DeleteConfirm article={deleting} onConfirm={() => handleDelete(deleting)} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}

export default ArticlesPage;
