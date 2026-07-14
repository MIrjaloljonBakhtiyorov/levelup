import { useEffect, useRef, useState } from "react";

import { getAdminToken } from "../../auth/services/adminSession";
import { createAdminContent, deleteAdminContent, getAdminContent, updateAdminContent } from "../services/adminContentApi";
import type { AdminPodcast, PodcastLevel } from "../types/adminTypes";
import { createId, formatDate } from "../utils/adminFormatters";
import AdminSectionTitle from "../components/AdminSectionTitle";

const LEVELS: PodcastLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_COLORS: Record<PodcastLevel, { bg: string; color: string }> = {
  A1: { bg: "#dbeafe", color: "#1d4ed8" },
  A2: { bg: "#e0e7ff", color: "#4338ca" },
  B1: { bg: "#ede9fe", color: "#7c3aed" },
  B2: { bg: "#fce7f3", color: "#be185d" },
  C1: { bg: "#fef3c7", color: "#b45309" },
  C2: { bg: "#dcfce7", color: "#166534" },
};

const inp: React.CSSProperties = { width: "100%", minHeight: "44px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", font: "inherit", fontSize: "var(--adm-fs-body)", background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const lb: React.CSSProperties  = { fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px" };
const er: React.CSSProperties  = { color: "#be123c", fontSize: "var(--adm-fs-tag)", fontWeight: 700, marginTop: "4px", display: "block" };

// ─── YouTube embed helper ─────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function VideoPreview({ url }: { url: string }) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: "10px", overflow: "hidden", background: "#000" }}>
        <iframe
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          src={`https://www.youtube.com/embed/${ytId}`}
          title="Podcast video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  // Generic video URL
  return (
    <video
      src={url}
      controls
      style={{ width: "100%", borderRadius: "10px", background: "#000", maxHeight: "200px" }}
    />
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────
function PodcastModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: AdminPodcast;
  onSave: (p: AdminPodcast) => void;
  onClose: () => void;
}) {
  const [title,         setTitle]         = useState(initial?.title         ?? "");
  const [author,        setAuthor]        = useState(initial?.author        ?? "");
  const [videoType,     setVideoType]     = useState<"link" | "file">(initial?.videoType ?? "link");
  const [videoUrl,      setVideoUrl]      = useState(initial?.videoType === "link" ? (initial?.videoUrl ?? "") : "");
  const [videoFile,     setVideoFile]     = useState<{ url: string; name: string } | null>(
    initial?.videoType === "file" ? { url: initial.videoUrl, name: initial.videoFileName ?? "" } : null
  );
  const [level,         setLevel]         = useState<PodcastLevel>(initial?.level ?? "B1");
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setVideoFile({ url: String(event.target?.result ?? ""), name: file.name });
      setErrors((p) => ({ ...p, video: "" }));
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim())  e.title  = "Enter podcast title";
    if (!author.trim()) e.author = "Enter author name";
    if (videoType === "link" && !videoUrl.trim()) e.video = "Enter video URL";
    if (videoType === "file" && !videoFile)       e.video = "Upload a video file";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id:            initial?.id ?? createId(),
      title:         title.trim(),
      author:        author.trim(),
      videoType,
      videoUrl:      videoType === "link" ? videoUrl.trim() : (videoFile?.url ?? ""),
      videoFileName: videoType === "file" ? videoFile?.name : undefined,
      level,
      createdAt:     initial?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card" style={{ maxWidth: "520px", width: "100%" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)" }}>
            {initial ? "Edit Podcast" : "Add Podcast"}
          </strong>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>✕</button>
        </div>

        <div style={{ display: "grid", gap: "18px", padding: "20px 0 4px" }}>
          {/* Title */}
          <div>
            <label style={lb}>Podcast title *</label>
            <input style={{ ...inp, borderColor: errors.title ? "#cf6d6d" : undefined }}
              value={title} placeholder="e.g. English in Real Life — Episode 12"
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }} />
            {errors.title && <span style={er}>{errors.title}</span>}
          </div>

          {/* Author */}
          <div>
            <label style={lb}>Author / Speaker *</label>
            <input style={{ ...inp, borderColor: errors.author ? "#cf6d6d" : undefined }}
              value={author} placeholder="e.g. John Smith"
              onChange={(e) => { setAuthor(e.target.value); setErrors((p) => ({ ...p, author: "" })); }} />
            {errors.author && <span style={er}>{errors.author}</span>}
          </div>

          {/* Video type toggle */}
          <div>
            <label style={lb}>Video source *</label>
            <div style={{ display: "flex", gap: "0", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", width: "fit-content" }}>
              {(["link", "file"] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setVideoType(t); setErrors((p) => ({ ...p, video: "" })); }}
                  style={{ minHeight: "38px", padding: "0 20px", border: "none", background: videoType === t ? "#2563eb" : "#f8fafc", color: videoType === t ? "#fff" : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-sm)", cursor: "pointer", transition: "all 120ms", display: "flex", alignItems: "center", gap: "6px" }}>
                  {t === "link" ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Link</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload file</>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Link input */}
          {videoType === "link" && (
            <div>
              <label style={lb}>Video URL * <span style={{ color: "#94a3b8", fontWeight: 600 }}>(YouTube or direct URL)</span></label>
              <input style={{ ...inp, borderColor: errors.video ? "#cf6d6d" : undefined }}
                value={videoUrl} placeholder="https://youtube.com/watch?v=..."
                onChange={(e) => { setVideoUrl(e.target.value); setErrors((p) => ({ ...p, video: "" })); }} />
              {errors.video && <span style={er}>{errors.video}</span>}
            </div>
          )}

          {/* File upload */}
          {videoType === "file" && (
            <div>
              <label style={lb}>Video file * <span style={{ color: "#94a3b8", fontWeight: 600 }}>(MP4, WebM, MOV)</span></label>
              <div
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                role="button" tabIndex={0} aria-label="Upload video"
                style={{ cursor: "pointer", border: `2px dashed ${errors.video ? "#cf6d6d" : "#93c5fd"}`, borderRadius: "12px", background: videoFile ? "#eff6ff" : "#f8fafc", display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", transition: "background 150ms" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={videoFile ? "#2563eb" : "#93c5fd"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <div>
                  <span style={{ color: videoFile ? "#1d4ed8" : "#64748b", fontWeight: 800, fontSize: "var(--adm-fs-sm)", display: "block" }}>
                    {videoFile ? videoFile.name : "Click to upload video file"}
                  </span>
                  {videoFile && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                      style={{ background: "none", border: "none", color: "#be123c", cursor: "pointer", fontSize: "var(--adm-fs-tag)", fontWeight: 800, padding: 0, marginTop: "2px" }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files?.[0])} />
              {errors.video && <span style={er}>{errors.video}</span>}
            </div>
          )}

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
            {initial ? "Save Changes" : "Add Podcast"}
          </button>
        </div>
      </article>
    </div>
  );
}

// ─── Podcast Card ─────────────────────────────────────────────────
function PodcastCard({
  podcast,
  onEdit,
  onDelete,
}: {
  podcast: AdminPodcast;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cfg = LEVEL_COLORS[podcast.level];

  return (
    <article style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "box-shadow 150ms",
    }}>
      {/* Video */}
      <div style={{ padding: "12px 12px 0" }}>
        <VideoPreview url={podcast.videoUrl} />
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "var(--adm-fs-body)", fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>
            {podcast.title}
          </h3>
          <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: "999px", background: cfg.bg, color: cfg.color, fontSize: "var(--adm-fs-tag)", fontWeight: 900 }}>
            {podcast.level}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "var(--adm-fs-sm)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span style={{ fontWeight: 700 }}>{podcast.author}</span>
        </div>

        <div style={{ color: "#94a3b8", fontSize: "var(--adm-fs-tag)" }}>
          {formatDate(podcast.createdAt)}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button type="button" onClick={onEdit}
            style={{ flex: 1, minHeight: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-sm)", color: "#334155", transition: "background 120ms" }}>
            Edit
          </button>
          <button type="button" onClick={onDelete}
            style={{ minWidth: "36px", minHeight: "36px", border: "1px solid #fca5a5", borderRadius: "8px", background: "#fef2f2", cursor: "pointer", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────
function DeleteConfirm({ podcast, onConfirm, onCancel }: { podcast: AdminPodcast; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card" style={{ maxWidth: "420px" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)", color: "#be123c" }}>Delete Podcast</strong>
          <button type="button" onClick={onCancel} aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>✕</button>
        </div>
        <p style={{ margin: "18px 0 24px", color: "#334155", fontSize: "var(--adm-fs-body)", lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>"{podcast.title}"</strong>? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel}
            style={{ minHeight: "42px", padding: "0 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)" }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            style={{ minHeight: "42px", padding: "0 20px", border: "none", borderRadius: "8px", background: "#be123c", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)" }}>
            Delete
          </button>
        </div>
      </article>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function PodcastsPage() {
  const [podcasts, setPodcasts]   = useState<AdminPodcast[]>([]);
  const [showAdd,  setShowAdd]    = useState(false);
  const [editing,  setEditing]    = useState<AdminPodcast | null>(null);
  const [deleting, setDeleting]   = useState<AdminPodcast | null>(null);
  const [search,   setSearch]     = useState("");
  const [levelFilter, setLevelFilter] = useState<PodcastLevel | "">("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    getAdminContent<AdminPodcast>(token, "podcasts")
      .then((result) => setPodcasts(result.items))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Podcastlarni yuklab bo'lmadi"));
  }, []);

  const filtered = podcasts.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase());
    const matchLevel  = !levelFilter || p.level === levelFilter;
    return matchSearch && matchLevel;
  });

  async function handleSave(podcast: AdminPodcast) {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    try {
      const { id: _id, createdAt: _createdAt, ...payload } = podcast;
      const result = editing
        ? await updateAdminContent<AdminPodcast>(token, "podcasts", podcast.id, payload)
        : await createAdminContent<AdminPodcast>(token, "podcasts", payload);

      setPodcasts((current) => (
        editing
          ? current.map((item) => item.id === result.item.id ? result.item : item)
          : [result.item, ...current]
      ));
      setShowAdd(false);
      setEditing(null);
      setMessage("");
      window.dispatchEvent(new Event("admin-data-changed"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Podcast saqlanmadi");
    }
  }

  async function handleDelete(podcast: AdminPodcast) {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    try {
      await deleteAdminContent(token, "podcasts", podcast.id);
      setPodcasts((current) => current.filter((item) => item.id !== podcast.id));
      setDeleting(null);
      setMessage("");
      window.dispatchEvent(new Event("admin-data-changed"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Podcast o'chirilmadi");
    }
  }

  return (
    <>
      <section className="admin-table-section">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <AdminSectionTitle
            title="Podcasts"
            description="Manage all podcast episodes available on the platform."
            meta={`${podcasts.length} podcasts`}
          />
          <div style={{ padding: "18px 20px 0 0" }}>
            <button type="button" onClick={() => setShowAdd(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 22px", border: "none", borderRadius: "10px", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)", transition: "background 150ms, transform 150ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Podcast
            </button>
          </div>
        </div>

        {/* Filters */}
        {message && <p className="admin-message" style={{ margin: "0 20px 16px" }}>{message}</p>}

        <div style={{ padding: "0 20px 16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            style={{ ...inp, maxWidth: "280px", minHeight: "38px" }}
            value={search}
            placeholder="Search by title or author…"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button type="button" onClick={() => setLevelFilter("")}
              style={{ minHeight: "34px", padding: "0 14px", border: `1px solid ${levelFilter === "" ? "#2563eb" : "#e2e8f0"}`, borderRadius: "8px", background: levelFilter === "" ? "#dbeafe" : "#f8fafc", color: levelFilter === "" ? "#1d4ed8" : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-tag)", cursor: "pointer" }}>
              All
            </button>
            {LEVELS.map((l) => {
              const cfg = LEVEL_COLORS[l];
              return (
                <button key={l} type="button" onClick={() => setLevelFilter(l === levelFilter ? "" : l)}
                  style={{ minHeight: "34px", padding: "0 14px", border: `1px solid ${levelFilter === l ? cfg.color : "#e2e8f0"}`, borderRadius: "8px", background: levelFilter === l ? cfg.bg : "#f8fafc", color: levelFilter === l ? cfg.color : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-tag)", cursor: "pointer" }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{ padding: "0 20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {filtered.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                podcast={podcast}
                onEdit={() => setEditing(podcast)}
                onDelete={() => setDeleting(podcast)}
              />
            ))}
          </div>
        ) : (
          <div className="admin-dashboard-empty" style={{ margin: "0 20px 24px" }}>
            <strong>{search || levelFilter ? "No podcasts match your filter" : "No podcasts yet"}</strong>
            <span>
              {search || levelFilter
                ? "Try changing the search or level filter."
                : <button type="button" onClick={() => setShowAdd(true)} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 900, fontSize: "inherit" }}>Add the first podcast</button>
              }
            </span>
          </div>
        )}
      </section>

      {/* Modals */}
      {(showAdd || editing) && (
        <PodcastModal
          initial={editing ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}
      {deleting && (
        <DeleteConfirm
          podcast={deleting}
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}

export default PodcastsPage;
