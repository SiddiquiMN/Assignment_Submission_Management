"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { api, user } from "@/lib/api";
import type { Assignment, User } from "@/types";

export default function Dashboard() {
  const u = user();

  const [items, setItems] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!u) {
      location.href = "/login";
      return;
    }

    api<Assignment[]>("/assignments")
      .then(setItems)
      .catch((e) => setError(e.message));

    if (u.role === "Admin") {
      api<User[]>("/admin/users")
        .then(setUsers)
        .catch(() => {});
    }
  }, []);

  return (
    <>
      <Nav />

      <main className="container">
        {/* =========================
            Header
        ========================= */}

        <div className="dashboard-header">
          <div>
            <p className="dashboard-welcome">Welcome back 👋</p>

            <h1>Dashboard</h1>

            <p className="muted">
              Manage your assignments and submissions from one place.
            </p>
          </div>

          {u?.role === "Teacher" && (
            <Link className="btn dashboard-create" href="/assignments/new">
              + Create Assignment
            </Link>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {/* =========================
            Statistics
        ========================= */}

        <div className="grid dashboard-stats">
          <div className="card stat-card blue">
            <div className="stat-icon">👤</div>

            <div className="stat-label">Your Role</div>

            <div className="stat">{u?.role}</div>

            <div className="stat-description">
              Current account access
            </div>
          </div>

          <div className="card stat-card purple">
            <div className="stat-icon">📚</div>

            <div className="stat-label">Assignments</div>

            <div className="stat">{items.length}</div>

            <div className="stat-description">
              Available assignments
            </div>
          </div>

          {u?.role === "Admin" && (
            <div className="card stat-card green">
              <div className="stat-icon">👥</div>

              <div className="stat-label">Users</div>

              <div className="stat">{users.length}</div>

              <div className="stat-description">
                Registered users
              </div>
            </div>
          )}

          {u?.role === "Student" && (
            <div className="card stat-card orange">
              <div className="stat-icon">✏️</div>

              <div className="stat-label">Your Work</div>

              <div className="stat">{items.length}</div>

              <div className="stat-description">
                Assignments to complete
              </div>
            </div>
          )}
        </div>

        {/* =========================
            Assignments
        ========================= */}

        <div className="card assignments-card">
          <div className="between assignments-heading">
            <div>
              <h2>
                {u?.role === "Student"
                  ? "My Assignments"
                  : "Assignments"}
              </h2>

              <p className="muted">
                {u?.role === "Student"
                  ? "View and complete your assigned work."
                  : "View and manage your assignments."}
              </p>
            </div>

            {u?.role === "Teacher" && (
              <Link className="btn" href="/assignments/new">
                + New Assignment
              </Link>
            )}
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>

              <h3>No assignments found</h3>

              <p className="muted">
                There are currently no assignments available.
              </p>

              {u?.role === "Teacher" && (
                <Link className="btn" href="/assignments/new">
                  Create your first assignment
                </Link>
              )}
            </div>
          ) : (
            <div className="assignment-list">
              {items.map((a) => (
                <Link
                  key={a.id}
                  href={`/assignments/${a.id}`}
                  className="assignment-item"
                >
                  <div className="assignment-icon">
                    📘
                  </div>

                  <div className="assignment-main">
                    <h3>{a.title}</h3>

                    <p>
                      {a.description ||
                        "No description provided."}
                    </p>
                  </div>

                  <div className="assignment-info">
                    <span
                      className={`badge ${
                        a.status === "Published"
                          ? "badge-success"
                          : "badge-draft"
                      }`}
                    >
                      {a.status}
                    </span>

                    <span className="deadline">
                      🕒{" "}
                      {new Date(
                        a.deadline
                      ).toLocaleString()}
                    </span>

                    <span className="marks">
                      ⭐ {a.maxMarks} marks
                    </span>
                  </div>

                  <div className="assignment-arrow">
                    →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}