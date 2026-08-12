"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("Student@12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const r = await api<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("token", r.token);
      localStorage.setItem("user", JSON.stringify(r.user));

      location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* Background decorations */}
      <div className="login-circle circle-one"></div>
      <div className="login-circle circle-two"></div>
      <div className="login-circle circle-three"></div>

      <div className="login-wrapper">
        {/* Left branding section */}
        <section className="login-brand">
          <div className="brand-icon">📚</div>

          <h1>
            Assignment
            <br />
            Management
          </h1>

          <p>
            Manage assignments, submit your work, and keep track of your
            academic progress — all in one place.
          </p>

          <div className="feature-list">
            <div className="feature">
              <span>✓</span>
              <div>
                <strong>Easy Assignment Management</strong>
                <small>Create and manage assignments easily.</small>
              </div>
            </div>

            <div className="feature">
              <span>✓</span>
              <div>
                <strong>Simple Submission</strong>
                <small>Submit your work directly online.</small>
              </div>
            </div>

            <div className="feature">
              <span>✓</span>
              <div>
                <strong>Fast Grading</strong>
                <small>Teachers can grade and provide feedback.</small>
              </div>
            </div>
          </div>
        </section>

        {/* Login card */}
        <section className="login-card">
          <div className="login-header">
            <div className="small-logo">🎓</div>

            <h2>Welcome Back!</h2>

            <p>
              Sign in to continue to your
              <br />
              assignment dashboard.
            </p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <span className="input-icon">✉</span>

                <input
                  id="email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="demo-section">
            <div className="demo-title">
              <span></span>
              Demo Accounts
              <span></span>
            </div>

            <div className="demo-account">
              <div className="demo-avatar admin">A</div>

              <div>
                <strong>Administrator</strong>
                <small>admin@example.com</small>
                <small>Admin@12345</small>
              </div>
            </div>

            <div className="demo-account">
              <div className="demo-avatar teacher">T</div>

              <div>
                <strong>Teacher</strong>
                <small>teacher@example.com</small>
                <small>Teacher@12345</small>
              </div>
            </div>

            <div className="demo-account">
              <div className="demo-avatar student">S</div>

              <div>
                <strong>Student</strong>
                <small>student@example.com</small>
                <small>Student@12345</small>
              </div>
            </div>

            <p className="demo-note">
              Use the demo credentials provided for testing.
            </p>
          </div>

          <div className="login-footer">
            <span>Assignment Management System</span>
            <span>•</span>
            <span>Academic Portal</span>
          </div>
        </section>
      </div>
    </main>
  );
}