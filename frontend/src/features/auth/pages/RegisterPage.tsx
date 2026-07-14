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
    } catch {
      setFormMessage("Unable to create your account. The email may already be in use.");
      return;
    }

    setFormMessage("Account created. Let’s set up your study plan.");
    window.setTimeout(() => navigate("/onboarding"), 700);
  }

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <span className="auth-form__eyebrow">Start for free</span>

        <h2>Create your account</h2>

        <p>
          Sign up to receive your personalized study plan.
        </p>
      </div>

      <form
        className="auth-form__body"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formMessage && <p className="auth-alert auth-alert--success">{formMessage}</p>}

        <div className="auth-field">
          <label htmlFor="register-first-name">First name</label>

          <input
            id="register-first-name"
            type="text"
            placeholder="Your first name"
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
          <label htmlFor="register-last-name">Last name</label>

          <input
            id="register-last-name"
            type="text"
            placeholder="Your last name"
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
          <label htmlFor="register-middle-name">Middle name</label>

          <input
            id="register-middle-name"
            type="text"
            placeholder="Your middle name (optional)"
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
          <label htmlFor="register-phone">Phone number</label>

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
          <label htmlFor="register-email">Email address</label>

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
          <label htmlFor="register-password">Password</label>

          <div className="auth-password">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
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

        <div className="auth-field">
          <label htmlFor="register-confirm-password">
            Confirm password
          </label>

          <input
            id="register-confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password again"
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
              I agree to the <Link to="/terms">Terms of Use</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>.
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-form__switch">
        Already have an account?
        <Link to="/login"> Sign in</Link>
      </p>

      <Link className="auth-back-link" to="/">
        ← Back to home
      </Link>
    </div>
  );
}

export default RegisterPage;
