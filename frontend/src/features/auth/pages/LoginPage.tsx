import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginFormData } from "../schemas/authSchemas";
import { loginAdmin, loginUser } from "../services/authApi";
import { clearAdminToken, setAdminToken } from "../services/adminSession";
import {
  clearOnboardingRedirectTarget,
  clearUserSession,
  setUserSession,
} from "../services/userSession";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormData) {
    setFormMessage("");

    try {
      if (data.login.includes("@")) {
        const result = await loginUser(data);
        clearAdminToken();
        setUserSession(result.token, result.user);
        navigate("/");
        return;
      }

      const adminResult = await loginAdmin(data);
      clearUserSession();
      clearOnboardingRedirectTarget();
      setAdminToken(adminResult.token);
      navigate("/admin", { replace: true });
    } catch (error) {
      setFormMessage(
        error instanceof Error ? error.message : "Login yoki parol noto‘g‘ri",
      );
      return;
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <span className="auth-form__eyebrow">Xush kelibsiz</span>

        <h2>Hisobingizga kiring</h2>

        <p>
          O‘quv rejangizni davom ettiring, test natijalarini ko‘ring va
          kurslarni to‘xtagan joyingizdan boshlang.
        </p>
      </div>

      <form
        className="auth-form__body"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formMessage && <p className="auth-alert">{formMessage}</p>}

        <div className="auth-field">
          <label htmlFor="login-username">Email yoki admin login</label>

          <input
            id="login-username"
            type="text"
            placeholder="example@email.com yoki mister_italiano"
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
            <label htmlFor="login-password">Parol</label>

            <span>User yoki admin parol</span>
          </div>

          <div className="auth-password">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Parolingizni kiriting"
              autoComplete="current-password"
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

        <label className="auth-checkbox">
          <input type="checkbox" {...register("rememberMe")} />

          <span>Eslab qolish</span>
        </label>

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>

      <p className="auth-form__switch">
        Hisobingiz yo‘qmi?
        <Link to="/register"> Ro‘yxatdan o‘ting</Link>
      </p>

      <Link className="auth-back-link" to="/">
        ← Bosh sahifaga qaytish
      </Link>
    </div>
  );
}

export default LoginPage;
