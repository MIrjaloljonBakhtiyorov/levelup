import { apiRequest } from "../../../services/apiClient";

export type SecuritySettings = {
  selfProtectionEnabled: boolean;
  failedLoginLimit: number;
  windowMs: number;
  blockMs: number;
};

export type SecurityAlert = {
  id: string;
  type: "brute_force" | "blocked_request" | "protection_enabled";
  severity: "info" | "warning" | "critical";
  ip: string;
  message: string;
  createdAt: string;
};

export type SecurityAttempt = {
  ip: string;
  route: string;
  success: boolean;
  createdAt: string;
};

export type BlockedIp = {
  ip: string;
  reason: string;
  blockedUntil: string;
  createdAt: string;
};

export type AdminLoginHistoryItem = {
  id: string;
  ip: string;
  userAgent: string;
  device: string;
  os: string;
  browser: string;
  deviceId?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  loginCount?: number;
  lastSeenAt?: string;
  loggedInAt: string;
  loggedOutAt?: string;
  expiresAt?: string;
  status?: "active" | "logged_out" | "expired" | "failed";
  success: boolean;
};

export type SecurityStatus = {
  settings: SecuritySettings;
  attempts: SecurityAttempt[];
  alerts: SecurityAlert[];
  blockedIps: BlockedIp[];
  activeBlocks: number;
  failedAttempts24h: number;
  latestCriticalAlert: SecurityAlert | null;
  attackCounters: {
    total: number;
    bruteForce: number;
    blockedRequests: number;
    lastAttackAt?: string;
  };
  loginHistory: AdminLoginHistoryItem[];
};

export function getAdminSecurity(token: string) {
  return apiRequest<{ success: true; security: SecurityStatus }>("/admin/security", {
    token,
  });
}

export function updateAdminSecuritySettings(token: string, settings: SecuritySettings) {
  return apiRequest<{ success: true; security: SecurityStatus }>("/admin/security/settings", {
    method: "PUT",
    token,
    body: JSON.stringify(settings),
  });
}

export function blockSecurityIp(
  token: string,
  data: { ip: string; reason: string; blockMs: number },
) {
  return apiRequest<{ success: true; security: SecurityStatus }>("/admin/security/blocked-ips", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function unblockSecurityIp(token: string, ip: string) {
  return apiRequest<{ success: true; security: SecurityStatus }>(
    `/admin/security/blocked-ips/${encodeURIComponent(ip)}`,
    {
      method: "DELETE",
      token,
    },
  );
}
