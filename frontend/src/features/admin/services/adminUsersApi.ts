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

type UpdateUserBody = {
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
};

export function updateAdminUser(token: string, userId: string, data: UpdateUserBody) {
  return apiRequest<UserResponse>(`/admin/users/${userId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteAdminUser(token: string, userId: string) {
  return apiRequest<{ success: true; message: string }>(`/admin/users/${userId}`, {
    method: "DELETE",
    token,
  });
}
