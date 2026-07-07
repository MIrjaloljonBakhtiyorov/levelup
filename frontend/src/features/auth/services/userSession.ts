import type { AdminUser } from "../../admin/types/adminTypes";

const USER_TOKEN_KEY = "userToken";
const USER_PROFILE_KEY = "userProfile";
const ONBOARDING_REDIRECT_KEY = "levelup_onboarding_redirect";

export type OnboardingRedirectTarget = "/admin" | "/user/dashboard";

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function getUserProfile() {
  const storedProfile = localStorage.getItem(USER_PROFILE_KEY);

  if (!storedProfile) {
    return null;
  }

  try {
    return JSON.parse(storedProfile) as AdminUser;
  } catch {
    clearUserSession();
    return null;
  }
}

export function setUserSession(token: string, user: AdminUser) {
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
}

export function clearUserSession() {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
}

export function setOnboardingRedirectTarget(target: OnboardingRedirectTarget) {
  localStorage.setItem(ONBOARDING_REDIRECT_KEY, target);
}

export function getOnboardingRedirectTarget() {
  const storedTarget = localStorage.getItem(ONBOARDING_REDIRECT_KEY);

  if (storedTarget === "/admin" || storedTarget === "/user/dashboard") {
    return storedTarget;
  }

  return "/user/dashboard";
}

export function clearOnboardingRedirectTarget() {
  localStorage.removeItem(ONBOARDING_REDIRECT_KEY);
}
