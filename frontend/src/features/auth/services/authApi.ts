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

export function loginAdmin(data: LoginFormData) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      login: data.login,
      password: data.password,
    }),
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
