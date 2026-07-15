import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";

import { createRegisterSchema, type RegisterFormData } from "../schemas/authSchemas";
import { registerUser } from "../services/authApi";
import { clearAdminToken } from "../services/adminSession";
import { clearRegisterDraft, getRegisterDraft, saveRegisterDraft } from "../services/authDrafts";
import {
  setOnboardingRedirectTarget,
  setUserSession,
} from "../services/userSession";
import { useHomeI18n } from "../../home/i18n/HomeI18nContext";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("success");
  const navigate = useNavigate();
  const { language, t } = useHomeI18n();
  const schema = useMemo(() => createRegisterSchema(t), [t]);
  const savedDraft = useMemo(() => getRegisterDraft(), []);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: savedDraft.firstName,
      lastName: savedDraft.lastName,
      middleName: savedDraft.middleName,
      phoneNumber: savedDraft.phoneNumber,
      email: savedDraft.email,
      password: "",
      confirmPassword: "",
      acceptTerms: savedDraft.acceptTerms,
    },
  });

  const firstName = useWatch({ control, name: "firstName" });
  const lastName = useWatch({ control, name: "lastName" });
  const middleName = useWatch({ control, name: "middleName" });
  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const email = useWatch({ control, name: "email" });
  const acceptTerms = useWatch({ control, name: "acceptTerms" });

  useEffect(() => {
    saveRegisterDraft({ firstName, lastName, middleName, phoneNumber, email, acceptTerms });
  }, [acceptTerms, email, firstName, lastName, middleName, phoneNumber]);

  useEffect(() => {
    if (isSubmitted) void trigger();
  }, [isSubmitted, language, trigger]);

  async function onSubmit(data: RegisterFormData) {
    setFormMessage("");

    try {
      const result = await registerUser(data);
      clearAdminToken();
      setUserSession(result.token, result.user);
      setOnboardingRedirectTarget("/user/dashboard");
    } catch {
      setFormMessage("Unable to create your account. The email may already be in use.");
      setMessageTone("error");
      return;
    }

    setFormMessage("Account created. Let’s set up your study plan.");
    setMessageTone("success");
    clearRegisterDraft();
    window.setTimeout(() => navigate("/onboarding"), 700);
  }

  return (
    <div className="auth-form auth-form--register">
      <div className="auth-form__header">
        <span className="auth-form__eyebrow">{t("Start for free")}</span>

        <h2>{t("Create your account")}</h2>

        <p>
          {t("Sign up to receive your personalized study plan.")}
        </p>
      </div>

      <form
        className="auth-form__body"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formMessage && (
          <p className={`auth-alert${messageTone === "success" ? " auth-alert--success" : ""}`}>
            {t(formMessage)}
          </p>
        )}

        <div className="auth-field auth-field--third">
          <label htmlFor="register-first-name">{t("First name")}</label>

          <input
            id="register-first-name"
            type="text"
            placeholder={t("Your first name")}
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            {...register("firstName")}
          />

          {errors.firstName && (
            <span className="auth-field__error">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className="auth-field auth-field--third">
          <label htmlFor="register-last-name">{t("Last name")}</label>

          <input
            id="register-last-name"
            type="text"
            placeholder={t("Your last name")}
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            {...register("lastName")}
          />

          {errors.lastName && (
            <span className="auth-field__error">
              {errors.lastName.message}
            </span>
          )}
        </div>

        <div className="auth-field auth-field--third">
          <label htmlFor="register-middle-name">{t("Middle name")}</label>

          <input
            id="register-middle-name"
            type="text"
            placeholder={t("Your middle name (optional)")}
            autoComplete="additional-name"
            aria-invalid={Boolean(errors.middleName)}
            {...register("middleName")}
          />

          {errors.middleName && (
            <span className="auth-field__error">
              {errors.middleName.message}
            </span>
          )}
        </div>

        <div className="auth-field auth-field--half">
          <label htmlFor="register-phone">{t("Phone number")}</label>

          <input
            id="register-phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phoneNumber)}
            {...register("phoneNumber")}
          />

          {errors.phoneNumber && (
            <span className="auth-field__error">
              {errors.phoneNumber.message}
            </span>
          )}
        </div>

        <div className="auth-field auth-field--half">
          <label htmlFor="register-email">{t("Email address")}</label>

          <input
            id="register-email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />

          {errors.email && (
            <span className="auth-field__error">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="auth-field auth-field--half">
          <label htmlFor="register-password">{t("Password")}</label>

          <div className="auth-password">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("At least 8 characters")}
              autoComplete="new-password"
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

        <div className="auth-field auth-field--half">
          <label htmlFor="register-confirm-password">
            {t("Confirm password")}
          </label>

          <input
            id="register-confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder={t("Enter your password again")}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />

          {errors.confirmPassword && (
            <span className="auth-field__error">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div>
          <label className="auth-checkbox">
            <input type="checkbox" {...register("acceptTerms")} />

            <span>
              {t("I agree to the ")}<Link to="/terms">{t("Terms of Use")}</Link>{t(" and ")}
              <Link to="/privacy">{t("Privacy Policy")}</Link>.
            </span>
          </label>

          {errors.acceptTerms && (
            <span className="auth-field__error">
              {errors.acceptTerms.message}
            </span>
          )}
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("Creating account...") : t("Create account")}
        </button>
      </form>

      <p className="auth-form__switch">
        {t("Already have an account?")}
        <Link to="/login"> {t("Sign in")}</Link>
      </p>

      <Link className="auth-back-link" to="/">
        ← {t("Back to home")}
      </Link>
    </div>
  );
}

export default RegisterPage;
