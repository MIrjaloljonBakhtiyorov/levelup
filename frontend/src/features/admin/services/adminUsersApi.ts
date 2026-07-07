import { apiRequest } from "../../../services/apiClient";
import type { AdminUser, UserStatus } from "../types/adminTypes";

type UsersResponse = {
  success: true;
  users: AdminUser[];
};

type UserResponse = {
  success: true;
  user: AdminUser;
};

export function getAdminUsers(token: string) {
  return apiRequest<UsersResponse>("/admin/users", {
    token,
  });
}

export function updateAdminUserStatus(
  token: string,
  userId: string,
  status: UserStatus,
  blockedUntil?: string,
) {
  return apiRequest<UserResponse>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ blockedUntil, status }),
  });
}
