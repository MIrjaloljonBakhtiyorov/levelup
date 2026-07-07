import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";

import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/authSchemas";
import { registerUser } from "../services/authApi";
import { clearAdminToken } from "../services/adminSession";
import {
  setOnboardingRedirectTarget,
  setUserSession,
} from "../services/userSession";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setFormMessage("");

    try {
      const result = await registerUser(data);
      clearAdminToken();
      setUserSession(result.token, result.user);
      setOnboardingRedirectTarget("/user/dashboard");
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "Ro‘yxatdan o‘tishda xatolik yuz berdi",
      );
      return;
    }

    setFormMessage("Ro‘yxatdan o‘tildi. Endi o‘quv rejangizni sozlaymiz.");
    window.setTimeout(() => navigate("/onboarding"), 700);
  }

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <span className="auth-form__eyebrow">Bepul boshlang</span>

        <h2>Hisob yarating</h2>

        <p>
          Shaxsiy o‘quv rejangizni olish uchun ro‘yxatdan o‘ting.
        </p>
      </div>

      <form
        className="auth-form__body"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formMessage && <p className="auth-alert auth-alert--success">{formMessage}</p>}

        <div className="auth-field">
          <label htmlFor="register-first-name">Ism</label>

          <input
            id="register-first-name"
            type="text"
            placeholder="Ismingiz"
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

        <div className="auth-field">
          <label htmlFor="register-last-name">Familiya</label>

          <input
            id="register-last-name"
            type="text"
            placeholder="Familiyangiz"
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

        <div className="auth-field">
          <label htmlFor="register-middle-name">Sharifi</label>

          <input
            id="register-middle-name"
            type="text"
            placeholder="Otangiz ismi"
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

        <div className="auth-field">
          <label htmlFor="register-phone">Telefon raqam</label>

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

        <div className="auth-field">
          <label htmlFor="register-email">Email manzil</label>

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

        <div className="auth-field">
          <label htmlFor="register-password">Parol</label>

          <div className="auth-password">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Kamida 8 ta belgi"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? "Yashirish" : "Ko‘rsatish"}
            </button>
          </div>

          {errors.password && (
            <span className="auth-field__error">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="register-confirm-password">
            Parolni tasdiqlang
          </label>

          <input
            id="register-confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Parolni qayta kiriting"
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
              <Link to="/terms">Foydalanish shartlari</Link> va{" "}
              <Link to="/privacy">maxfiylik siyosati</Link>ga roziman.
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
          {isSubmitting ? "Yaratilmoqda..." : "Hisob yaratish"}
        </button>
      </form>

      <p className="auth-form__switch">
        Hisobingiz bormi?
        <Link to="/login"> Kirish</Link>
      </p>

      <Link className="auth-back-link" to="/">
        ← Bosh sahifaga qaytish
      </Link>
    </div>
  );
}

export default RegisterPage;
