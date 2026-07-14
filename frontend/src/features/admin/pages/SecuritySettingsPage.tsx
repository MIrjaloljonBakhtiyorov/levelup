import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { ApiError, isUnauthorizedError } from "../../../services/apiClient";
import { clearAdminToken, getAdminToken } from "../../auth/services/adminSession";
import {
  blockSecurityIp,
  getAdminSecurity,
  unblockSecurityIp,
  updateAdminSecuritySettings,
  type SecuritySettings,
  type SecurityStatus,
} from "../services/adminSecurityApi";

const minute = 60 * 1000;

function formatDate(value: string) {
  return new Date(value).toLocaleString("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toMinutes(ms: number) {
  return Math.max(1, Math.round(ms / minute));
}

function fromMinutes(value: number) {
  return Math.max(1, value) * minute;
}

type SecurityView = "settings" | "blocked-ips" | "login-sessions";

type SecuritySettingsPageProps = {
  view?: SecurityView;
};

function SecuritySettingsPage({ view = "settings" }: SecuritySettingsPageProps) {
  const navigate = useNavigate();
  const token = getAdminToken();
  const [security, setSecurity] = useState<SecurityStatus | null>(null);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [manualIp, setManualIp] = useState("");
  const [manualReason, setManualReason] = useState("Shubhali faollik");
  const [manualBlockMinutes, setManualBlockMinutes] = useState(60);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    getAdminSecurity(token)
      .then((response) => {
        setSecurity(response.security);
        setSettings(response.security.settings);
      })
      .catch((err: unknown) => {
        if (isUnauthorizedError(err)) {
          clearAdminToken();
          navigate("/login");
          return;
        }
        setError("Xavfsizlik ma'lumotlarini yuklab bo'lmadi");
      });
  }, [navigate, token]);

  const activeSessions = useMemo(
    () => security?.loginHistory.filter((log) => log.status === "active").length ?? 0,
    [security],
  );

  function sessionLabel(status: string | undefined, success: boolean) {
    if (!success || status === "failed") return "Xato";
    if (status === "logged_out") return "Chiqdi";
    if (status === "expired") return "Expired";
    return "Active";
  }

  function sessionClass(status: string | undefined, success: boolean) {
    if (!success || status === "failed") return "is-danger";
    if (status === "logged_out") return "is-muted";
    if (status === "expired") return "is-warning";
    return "is-success";
  }

  async function saveSettings() {
    if (!token || !settings) return;
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await updateAdminSecuritySettings(token, settings);
      setSecurity(response.security);
      setSettings(response.security.settings);
      setMessage("Xavfsizlik sozlamalari saqlandi");
    } catch (err: unknown) {
      if (isUnauthorizedError(err)) {
        clearAdminToken();
        navigate("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Sozlamalarni saqlab bo'lmadi");
    } finally {
      setIsSaving(false);
    }
  }

  async function blockIp() {
    if (!token || !manualIp.trim()) return;
    setIsBlocking(true);
    setMessage("");
    setError("");

    try {
      const response = await blockSecurityIp(token, {
        ip: manualIp.trim(),
        reason: manualReason.trim() || "Admin tomonidan bloklandi",
        blockMs: fromMinutes(manualBlockMinutes),
      });
      setSecurity(response.security);
      setSettings(response.security.settings);
      setManualIp("");
      setMessage("IP manzil bloklandi");
    } catch (err: unknown) {
      if (isUnauthorizedError(err)) {
        clearAdminToken();
        navigate("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : "IP bloklab bo'lmadi");
    } finally {
      setIsBlocking(false);
    }
  }

  async function unblockIp(ip: string) {
    if (!token) return;
    setMessage("");
    setError("");

    try {
      const response = await unblockSecurityIp(token, ip);
      setSecurity(response.security);
      setSettings(response.security.settings);
      setMessage("IP blokdan chiqarildi");
    } catch (err: unknown) {
      if (isUnauthorizedError(err)) {
        clearAdminToken();
        navigate("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : "IP blokdan chiqarilmadi");
    }
  }

  if (!security || !settings) {
    return (
      <section className="admin-table-section admin-security-page">
        <div className="admin-section-title">
          <div>
            <span>Xavfsizlik</span>
            <h2>Tizim himoyasi yuklanmoqda</h2>
            <p>Real vaqtli himoya holati tekshirilmoqda.</p>
          </div>
        </div>
      </section>
    );
  }

  const latestCritical = security.latestCriticalAlert;
  const showSettings = view === "settings";
  const showBlockedIps = view === "blocked-ips";
  const showLoginSessions = view === "login-sessions";
  const viewMeta = showBlockedIps
    ? {
        eyebrow: "Access control",
        title: "Blocked IP management",
        description: "Shubhali manzillarni boshqaring va tizim perimetrini nazorat qiling.",
        code: `${security.activeBlocks} ACTIVE BLOCKS`,
      }
    : showLoginSessions
      ? {
          eyebrow: "Identity & access",
          title: "Login session intelligence",
          description: "Admin kirishlari, qurilmalar va lokatsiyalar bo‘yicha yagona audit markazi.",
          code: `${activeSessions} LIVE SESSIONS`,
        }
      : {
          eyebrow: "Security command center",
          title: "System security settings",
          description: "Himoya siyosati, tahdidlar va avtomatik bloklashni bir joydan boshqaring.",
          code: settings.selfProtectionEnabled ? "PROTECTION ONLINE" : "PROTECTION OFFLINE",
        };

  return (
    <div className="admin-security-page">
      <section className="admin-security-hero">
        <div className="admin-security-hero__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.6 2.9 8.7 7 10 4.1-1.3 7-5.4 7-10V6l-7-3Zm3.2 7.1-3.8 4-2.2-2.2" /></svg>
        </div>
        <div className="admin-security-hero__copy">
          <span>{viewMeta.eyebrow}</span>
          <h1>{viewMeta.title}</h1>
          <p>{viewMeta.description}</p>
        </div>
        <div className={`admin-security-hero__status ${settings.selfProtectionEnabled ? "is-online" : "is-offline"}`}>
          <i />
          {viewMeta.code}
        </div>
      </section>

      {latestCritical && (
        <section className="admin-security-alert admin-security-alert--critical">
          <div className="admin-security-alert__icon">!</div>
          <div>
            <span>Hujumga o'xshash faollik aniqlandi</span>
            <h2>{latestCritical.message}</h2>
            <p>
              IP: <strong>{latestCritical.ip}</strong> · {formatDate(latestCritical.createdAt)}
            </p>
          </div>
        </section>
      )}

      {(message || error) && (
        <p className={`admin-message ${error ? "admin-message--danger" : ""}`}>
          {error || message}
        </p>
      )}

      <section className="admin-security-stats">
        <article className="admin-security-stat admin-security-stat--orange">
          <span>Aniqlangan hujumlar</span>
          <strong>{security.attackCounters.total}</strong>
          <small>
            {security.attackCounters.lastAttackAt
              ? `Oxirgisi: ${formatDate(security.attackCounters.lastAttackAt)}`
              : "Hozircha hujum aniqlanmadi"}
          </small>
        </article>
        <article className="admin-security-stat admin-security-stat--blue">
          <span>Self protection</span>
          <strong>{settings.selfProtectionEnabled ? "Yoqilgan" : "O'chirilgan"}</strong>
          <small>Login hujumlarini avtomatik ushlaydi</small>
        </article>
        <article className="admin-security-stat admin-security-stat--red">
          <span>Xato loginlar</span>
          <strong>{security.failedAttempts24h}</strong>
          <small>24 soat · Brute-force: {security.attackCounters.bruteForce}</small>
        </article>
        <article className="admin-security-stat admin-security-stat--purple">
          <span>Bloklangan IP</span>
          <strong>{security.activeBlocks}</strong>
          <small>Bloklangan so‘rov: {security.attackCounters.blockedRequests}</small>
        </article>
        <article className="admin-security-stat admin-security-stat--green">
          <span>Active session</span>
          <strong>{activeSessions}</strong>
          <small>Hozir tizimda ochiq admin sessiyalar</small>
        </article>
      </section>

      {showSettings && (
        <section className="admin-table-section admin-security-control admin-security-panel">
          <div className="admin-section-title">
            <div>
              <span>Tizim xavfsizlik sozlamalari</span>
              <h2>Avtomatik himoya rejimi</h2>
              <p>
                Bir IP qisqa vaqt ichida ko'p marta noto'g'ri login qilsa, tizim uni
                avtomatik bloklaydi va admin panelda ogohlantiradi.
              </p>
            </div>
            <button type="button" onClick={saveSettings} disabled={isSaving}>
              {isSaving ? "Saqlanmoqda..." : "Sozlamani saqlash"}
            </button>
          </div>

          <div className="admin-security-form">
            <label className="admin-security-toggle">
              <input
                type="checkbox"
                checked={settings.selfProtectionEnabled}
                onChange={(event) =>
                  setSettings({ ...settings, selfProtectionEnabled: event.target.checked })
                }
              />
              <span />
              <div>
                <strong>O'zini-o'zi himoya qilish</strong>
                <small>Hujum aniqlansa IP vaqtincha bloklanadi.</small>
              </div>
            </label>

            <label>
              <span>Xato login limiti</span>
              <input
                type="number"
                min={3}
                max={50}
                value={settings.failedLoginLimit}
                onChange={(event) =>
                  setSettings({ ...settings, failedLoginLimit: Number(event.target.value) })
                }
              />
            </label>

            <label>
              <span>Kuzatuv oynasi (daqiqa)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={toMinutes(settings.windowMs)}
                onChange={(event) =>
                  setSettings({ ...settings, windowMs: fromMinutes(Number(event.target.value)) })
                }
              />
            </label>

            <label>
              <span>Bloklash vaqti (daqiqa)</span>
              <input
                type="number"
                min={1}
                max={1440}
                value={toMinutes(settings.blockMs)}
                onChange={(event) =>
                  setSettings({ ...settings, blockMs: fromMinutes(Number(event.target.value)) })
                }
              />
            </label>
          </div>
        </section>
      )}

      {showBlockedIps && (
        <section className="admin-security-grid admin-security-grid--wide">
        <article className="admin-table-section admin-security-panel">
          <div className="admin-section-title">
            <div>
              <span>IP bloklash</span>
              <h2>Bloklangan IP'lar</h2>
              <p>Hujumga o'xshash urinishlardan keyin yoki admin tomonidan bloklangan manzillar.</p>
            </div>
          </div>

          <div className="admin-security-ip-form">
            <label>
              <span>IP manzil</span>
              <input
                value={manualIp}
                onChange={(event) => setManualIp(event.target.value)}
                placeholder="Masalan: 192.168.1.10"
              />
            </label>
            <label>
              <span>Sabab</span>
              <input
                value={manualReason}
                onChange={(event) => setManualReason(event.target.value)}
                placeholder="Shubhali faollik"
              />
            </label>
            <label>
              <span>Blok vaqti</span>
              <input
                type="number"
                min={1}
                max={1440}
                value={manualBlockMinutes}
                onChange={(event) => setManualBlockMinutes(Number(event.target.value))}
              />
            </label>
            <button type="button" onClick={blockIp} disabled={isBlocking || !manualIp.trim()}>
              {isBlocking ? "Bloklanmoqda..." : "IP bloklash"}
            </button>
          </div>

          {security.blockedIps.length === 0 ? (
            <div className="admin-dashboard-empty">
              <strong>Hozircha bloklangan IP yo'q</strong>
              <span>Tizim tinch ishlayapti.</span>
            </div>
          ) : (
            <div className="admin-security-list">
              {security.blockedIps.map((item) => (
                <div className="admin-security-row" key={`${item.ip}-${item.createdAt}`}>
                  <div>
                    <span className="admin-security-row__badge">Blocked endpoint</span>
                    <strong>{item.ip}</strong>
                    <span>{item.reason}</span>
                  </div>
                  <div className="admin-security-row__actions">
                    <small>{formatDate(item.blockedUntil)} gacha</small>
                    <button type="button" onClick={() => unblockIp(item.ip)}>
                      Blokdan chiqarish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
        </section>
      )}

      {showLoginSessions && (
        <section className="admin-security-grid admin-security-grid--wide">
        <article className="admin-table-section admin-security-panel">
          <div className="admin-section-title">
            <div>
              <span>Login sessionlar</span>
              <h2>Admin kirgan-chiqqan sessionlari</h2>
              <p>Admin panelga kirish, chiqish, IP, qurilma va session holati ko'rsatiladi.</p>
            </div>
          </div>

          {security.loginHistory.length === 0 ? (
            <div className="admin-dashboard-empty">
              <strong>Login session yo'q</strong>
              <span>Admin tizimga kirganda yoki chiqqanda shu yerda ko'rinadi.</span>
            </div>
          ) : (
            <div className="admin-security-login-table">
              <div className="admin-security-login-table__head">
                <span>Status</span>
                <span>IP</span>
                <span>Qurilma</span>
                <span>Lokatsiya / manzil</span>
                <span>Qurilma ID</span>
                <span>Kirgan</span>
                <span>Chiqqan</span>
              </div>
              {security.loginHistory.slice(0, 10).map((log) => (
                <div className="admin-security-login-table__row" key={log.id}>
                  <span data-label="Status" className={sessionClass(log.status, log.success)}>
                    {sessionLabel(log.status, log.success)}
                  </span>
                  <strong data-label="IP manzil">{log.ip}</strong>
                  <span data-label="Qurilma">{log.device} · {log.os} · {log.browser}</span>
                  <span data-label="Lokatsiya">
                    {log.location || log.address || "Aniqlanmadi"}
                    {log.latitude != null && log.longitude != null
                      ? ` · ${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}`
                      : ""}
                  </span>
                  <small data-label="Qurilma ID" title="Brauzerlar haqiqiy MAC manzilini bermaydi">
                    {log.deviceId ? log.deviceId.slice(0, 12) : "—"}
                  </small>
                  <small data-label="Kirgan">{formatDate(log.loggedInAt)}</small>
                  <small data-label="Chiqqan">
                    {log.loggedOutAt
                      ? formatDate(log.loggedOutAt)
                      : log.status === "active"
                        ? "Hali tizimda"
                        : "—"}
                  </small>
                </div>
              ))}
            </div>
          )}
        </article>
        </section>
      )}

      {showSettings && (
      <section className="admin-security-grid">
        <article className="admin-table-section admin-security-panel">
          <div className="admin-section-title">
            <div>
              <span>Ogohlantirishlar</span>
              <h2>Security alertlar</h2>
              <p>Himoya moduli yaratgan oxirgi signal va ogohlantirishlar.</p>
            </div>
          </div>

          {security.alerts.length === 0 ? (
            <div className="admin-dashboard-empty">
              <strong>Ogohlantirish yo'q</strong>
              <span>Xavfli faollik aniqlanmadi.</span>
            </div>
          ) : (
            <div className="admin-security-list">
              {security.alerts.slice(0, 8).map((alert) => (
                <div
                  className={`admin-security-row admin-security-row--${alert.severity}`}
                  key={alert.id}
                >
                  <div>
                    <strong>{alert.message}</strong>
                    <span>
                      {alert.type} · {alert.ip}
                    </span>
                  </div>
                  <small>{formatDate(alert.createdAt)}</small>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
      )}
    </div>
  );
}

export default SecuritySettingsPage;
