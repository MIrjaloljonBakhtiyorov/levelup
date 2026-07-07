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
            AI yordamidagi o‘quv platforma
          </span>

          <h1>
            Maqsad ballingizga
            <span> aqlli reja bilan yeting</span>
          </h1>

          <p>
            IELTS va Multilevel testlari, shaxsiy o‘quv rejalari va
            tajribali ustozlar bitta qulay platformada.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <span>✓</span>
              <p>Shaxsiy o‘quv reja</p>
            </div>

            <div className="auth-benefit">
              <span>✓</span>
              <p>Real imtihon formatidagi mashq testlari</p>
            </div>

            <div className="auth-benefit">
              <span>✓</span>
              <p>Aqlli natija tahlili</p>
            </div>
          </div>
        </div>

        <div className="auth-decoration auth-decoration--one" />
        <div className="auth-decoration auth-decoration--two" />
        <div className="auth-decoration auth-decoration--three" />

        <p className="auth-showcase__footer">
          © 2026 LevelUp. Barcha huquqlar himoyalangan.
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
