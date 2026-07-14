import { Link, Outlet } from "react-router";

import "../styles/auth.css";

function AuthLayout() {
  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <Link className="auth-brand" to="/">
          <span className="auth-brand__icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>

          <span>LevelUp</span>
        </Link>

        <div className="auth-showcase__content">
          <span className="auth-showcase__badge">
            AI-powered learning platform
          </span>

          <h1>
            Reach your target score
            <span> with a smarter plan</span>
          </h1>

          <p>
            IELTS and Multilevel tests, personalized study plans, and expert mentors in one platform.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <span>✓</span>
              <p>Personalized study plan</p>
            </div>

            <div className="auth-benefit">
              <span>✓</span>
              <p>Real exam-style practice tests</p>
            </div>

            <div className="auth-benefit">
              <span>✓</span>
              <p>Smart performance analytics</p>
            </div>
          </div>
        </div>

        <div className="auth-decoration auth-decoration--one" />
        <div className="auth-decoration auth-decoration--two" />
        <div className="auth-decoration auth-decoration--three" />

        <p className="auth-showcase__footer">
          © 2026 LevelUp. All rights reserved.
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <Outlet />
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
