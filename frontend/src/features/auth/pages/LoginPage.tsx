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
        navigate("/user/dashboard", { replace: true });
        return;
      }

      const adminResult = await loginAdmin(data);
      clearUserSession();
      clearOnboardingRedirectTarget();
      setAdminToken(adminResult.token);
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
        <span className="auth-form__eyebrow">Welcome back</span>

        <h2>Sign in to your account</h2>

        <p>
          Continue your study plan, review your test results, and resume your courses.
        </p>
      </div>

      <form
        className="auth-form__body"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formMessage && <p className="auth-alert">{formMessage}</p>}

        <div className="auth-field">
          <label htmlFor="login-username">Email or admin username</label>

          <input
            id="login-username"
            type="text"
            placeholder="example@email.com or admin username"
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
            <label htmlFor="login-password">Password</label>

            <span>User or admin password</span>
          </div>

          <div className="auth-password">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? "Hide" : "Show"}
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

          <span>Remember me</span>
        </label>

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="auth-form__switch">
        Don&apos;t have an account?
        <Link to="/register"> Create one</Link>
      </p>

      <Link className="auth-back-link" to="/">
        ← Back to home
      </Link>
    </div>
  );
}

export default LoginPage;
