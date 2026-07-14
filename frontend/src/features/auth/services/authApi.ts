import { apiRequest } from "../../../services/apiClient";
import type { AdminUser } from "../../admin/types/adminTypes";
import type { LoginFormData, RegisterFormData } from "../schemas/authSchemas";

type LoginResponse = {
  success: true;
  token: string;
  user: {
    login: string;
    role: "admin";
  };
};

type RegisterResponse = {
  success: true;
  token: string;
  user: AdminUser;
};

type UserLoginResponse = {
  success: true;
  token: string;
  user: AdminUser;
};

function getDeviceId() {
  const storageKey = "levelup_device_id";
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
}

export function loginAdmin(data: LoginFormData) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    headers: { "X-Device-ID": getDeviceId() },
    body: JSON.stringify({
      login: data.login,
      password: data.password,
    }),
  });
}

export function logoutAdmin(token: string) {
  return apiRequest<{ success: true; message: string }>("/auth/logout", {
    method: "POST",
    token,
  });
}

export function loginUser(data: LoginFormData) {
  return apiRequest<UserLoginResponse>("/auth/user-login", {
    method: "POST",
    body: JSON.stringify({
      email: data.login,
      password: data.password,
    }),
  });
}

export function registerUser(data: RegisterFormData) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
