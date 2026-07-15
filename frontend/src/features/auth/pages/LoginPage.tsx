import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";

import { createLoginSchema, type LoginFormData } from "../schemas/authSchemas";
import { loginAdmin, loginUser } from "../services/authApi";
import { clearAdminToken, setAdminToken } from "../services/adminSession";
import { clearLoginDraft, getLoginDraft, saveLoginDraft } from "../services/authDrafts";
import {
  clearOnboardingRedirectTarget,
  clearUserSession,
  setUserSession,
} from "../services/userSession";
import { useHomeI18n } from "../../home/i18n/HomeI18nContext";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const navigate = useNavigate();
  const { language, t } = useHomeI18n();
  const schema = useMemo(() => createLoginSchema(t), [t]);
  const savedDraft = useMemo(() => getLoginDraft(), []);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      login: savedDraft.login,
      password: "",
      rememberMe: savedDraft.rememberMe,
    },
  });

  const login = useWatch({ control, name: "login" });
  const rememberMe = useWatch({ control, name: "rememberMe" });

  useEffect(() => {
    saveLoginDraft({ login, rememberMe });
  }, [login, rememberMe]);

  useEffect(() => {
    if (isSubmitted) void trigger();
  }, [isSubmitted, language, trigger]);

  async function onSubmit(data: LoginFormData) {
    setFormMessage("");

    try {
      if (data.login.includes("@")) {
        const result = await loginUser(data);
        clearAdminToken();
        setUserSession(result.token, result.user);
        clearLoginDraft();
        navigate("/user/dashboard", { replace: true });
        return;
      }

      const adminResult = await loginAdmin(data);
      clearUserSession();
      clearOnboardingRedirectTarget();
      setAdminToken(adminResult.token);
      clearLoginDraft();
      navigate("/admin", { replace: true });
    } catch (error) {
      setFormMessage(
        error instanceof Error ? "Incorrect email, username, or password." : "Unable to sign in.",
      );
      return;
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <span className="auth-form__eyebrow">{t("Welcome back")}</span>

        <h2>{t("Sign in to your account")}</h2>

        <p>
          {t("Continue your study plan, review your test results, and resume your courses.")}
        </p>
      </div>

      <form
        className="auth-form__body"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formMessage && <p className="auth-alert">{t(formMessage)}</p>}

        <div className="auth-field">
          <label htmlFor="login-username">{t("Email or admin username")}</label>

          <input
            id="login-username"
            type="text"
            placeholder={t("example@email.com or admin username")}
            autoComplete="username"
            aria-invalid={Boolean(errors.login)}
            {...register("login")}
          />

          {errors.login && (
            <span className="auth-field__error">{errors.login.message}</span>
          )}
        </div>

        <div className="auth-field">
          <div className="auth-field__label-row">
            <label htmlFor="login-password">{t("Password")}</label>

            <span>{t("User or admin password")}</span>
          </div>

          <div className="auth-password">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("Enter your password")}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? t("Hide") : t("Show")}
            </button>
          </div>

          {errors.password && (
            <span className="auth-field__error">
              {errors.password.message}
            </span>
          )}
        </div>

        <label className="auth-checkbox">
          <input type="checkbox" {...register("rememberMe")} />

          <span>{t("Remember me")}</span>
        </label>

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("Signing in...") : t("Sign in")}
        </button>
      </form>

      <p className="auth-form__switch">
        {t("Don't have an account?")}
        <Link to="/register"> {t("Create one")}</Link>
      </p>

      <Link className="auth-back-link" to="/">
        ← {t("Back to home")}
      </Link>
    </div>
  );
}

export default LoginPage;
