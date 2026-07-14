import type { LoginFormData, RegisterFormData } from "../schemas/authSchemas";

const LOGIN_DRAFT_KEY = "levelup_login_draft";
const REGISTER_DRAFT_KEY = "levelup_register_draft";

type LoginDraft = Pick<LoginFormData, "login" | "rememberMe">;
type RegisterDraft = Pick<RegisterFormData, "firstName" | "lastName" | "middleName" | "phoneNumber" | "email" | "acceptTerms">;

function readDraft<T>(key: string, fallback: T): T {
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
  } catch {
    return fallback;
  }
}

function writeDraft(key: string, value: object) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A blocked storage area should never prevent a user from signing in.
  }
}

function removeDraft(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore unavailable session storage.
  }
}

export function getLoginDraft(): LoginDraft {
  return readDraft(LOGIN_DRAFT_KEY, { login: "", rememberMe: false });
}

export function saveLoginDraft(draft: LoginDraft) {
  writeDraft(LOGIN_DRAFT_KEY, draft);
}

export function clearLoginDraft() {
  removeDraft(LOGIN_DRAFT_KEY);
}

export function getRegisterDraft(): RegisterDraft {
  return readDraft(REGISTER_DRAFT_KEY, {
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    email: "",
    acceptTerms: false,
  });
}

export function saveRegisterDraft(draft: RegisterDraft) {
  writeDraft(REGISTER_DRAFT_KEY, draft);
}

export function clearRegisterDraft() {
  removeDraft(REGISTER_DRAFT_KEY);
}
