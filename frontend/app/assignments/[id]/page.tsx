"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, user } from "@/lib/api";
import Nav from "@/components/Nav";

type Assignment = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  status: string;
};

type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  answer: string;
  submittedAt: string;
  status: string;
  marks?: number | null;
  feedback?: string | null;
};

export default function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const u = user();

  const [id, setId] = useState("");
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  // Student
  const [mySubmission, setMySubmission] =
    useState<Submission | null>(null);
  const [answer, setAnswer] = useState("");

  // Teacher
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] =
    useState<string | null>(null);

  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /*
   * Get assignment ID from URL
   */
  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  /*
   * Load assignment and submissions
   */
  useEffect(() => {
    if (!id) return;

    setError("");

    api<Assignment>(`/assignments/${id}`)
      .then(setAssignment)
      .catch((e) => setError(e.message));

    /*
     * Student submission
     */
    if (u?.role === "Student") {
      api<Submission | null>(
        `/submissions/assignment/${id}/mine`
      )
        .then((submission) => {
          setMySubmission(submission);

          if (submission) {
            setAnswer(submission.answer);
          }
        })
        .catch(() => {});
    }

    /*
     * Teacher submissions
     */
    if (u?.role === "Teacher") {
      api<Submission[]>(
        `/submissions/assignment/${id}`
      )
        .then(setSubmissions)
        .catch((e) => setError(e.message));
    }
  }, [id]);

  /*
   * Student submits answer
   */
  async function submitAnswer(e: FormEvent) {
    e.preventDefault();

    setError("");

    if (!answer.trim()) {
      setError("Please enter your answer before submitting.");
      return;
    }

    try {
      const result = await api<Submission>(
        `/submissions/assignment/${id}`,
        {
          method: "POST",
          body: JSON.stringify({
            answer,
          }),
        }
      );

      setMySubmission(result);

      alert("Assignment submitted successfully.");
    } catch (e: any) {
      setError(e.message);
    }
  }

  /*
   * Start grading a submission
   */
  function startGrading(submission: Submission) {
    setSelectedSubmissionId(submission.id);

    setMarks(
      submission.marks !== null &&
        submission.marks !== undefined
        ? String(submission.marks)
        : ""
    );

    setFeedback(submission.feedback ?? "");

    setError("");
  }

  /*
   * Teacher grades submission
   */
  async function gradeSubmission(
    e: FormEvent,
    submission: Submission
  ) {
    e.preventDefault();

    setError("");

    if (marks === "") {
      setError("Please enter marks.");
      return;
    }

    const numericMarks = Number(marks);

    if (
      numericMarks < 0 ||
      numericMarks > (assignment?.maxMarks ?? 0)
    ) {
      setError(
        `Marks must be between 0 and ${
          assignment?.maxMarks ?? 0
        }.`
      );
      return;
    }

    setSaving(true);

    try {
      const result = await api<Submission>(
        `/submissions/${submission.id}/grade`,
        {
          method: "PUT",
          body: JSON.stringify({
            marks: numericMarks,
            feedback: feedback,
            status: "Graded",
          }),
        }
      );

      setSubmissions((current) =>
        current.map((item) =>
          item.id === result.id ? result : item
        )
      );

      setSelectedSubmissionId(null);
      setMarks("");
      setFeedback("");

      alert("Marks and feedback saved successfully.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  /*
   * Cancel grading
   */
  function cancelGrading() {
    setSelectedSubmissionId(null);
    setMarks("");
    setFeedback("");
  }

  /*
   * Loading state
   */
  if (!assignment) {
    return (
      <>
        <Nav />

        <main className="container assignment-page">
          {error ? (
            <div className="error-card">
              <h2>Unable to load assignment</h2>
              <p>{error}</p>
            </div>
          ) : (
            <div className="loading-card">
              <div className="loading-spinner"></div>
              <p>Loading assignment...</p>
            </div>
          )}
        </main>
      </>
    );
  }

  /*
   * Assignment page
   */
  return (
    <>
      <Nav />

      <main className="container assignment-page">

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="error-card">
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        )}

        {/* =========================
            ASSIGNMENT HERO
        ========================= */}

        <section className="assignment-hero">

          <div className="assignment-hero-top">

            <div>
              <div className="hero-label">
                ASSIGNMENT
              </div>

              <h1>{assignment.title}</h1>
            </div>

            <span
              className={`status-pill ${assignment.status.toLowerCase()}`}
            >
              {assignment.status}
            </span>

          </div>

          <p className="assignment-description">
            {assignment.description}
          </p>

          <div className="assignment-meta">

            <div className="meta-box">
              <span className="meta-label">
                📅 Deadline
              </span>

              <span className="meta-value">
                {new Date(
                  assignment.deadline
                ).toLocaleString()}
              </span>
            </div>

            <div className="meta-box">
              <span className="meta-label">
                🎯 Maximum Marks
              </span>

              <span className="meta-value">
                {assignment.maxMarks}
              </span>
            </div>

            <div className="meta-box">
              <span className="meta-label">
                📌 Status
              </span>

              <span className="meta-value">
                {assignment.status}
              </span>
            </div>

          </div>
        </section>


        {/* =====================================================
            STUDENT VIEW
        ===================================================== */}

        {u?.role === "Student" && (
          <>
            {/* Submission section */}

            <section className="section-card">

              <div className="section-header">

                <div>
                  <div className="section-icon blue">
                    📝
                  </div>

                  <div>
                    <h2>Your Submission</h2>

                    <p className="muted">
                      Write your answer and submit it
                      before the deadline.
                    </p>
                  </div>
                </div>

                {mySubmission && (
                  <span
                    className={`status-pill ${
                      mySubmission.status.toLowerCase()
                    }`}
                  >
                    {mySubmission.status}
                  </span>
                )}

              </div>

              <form onSubmit={submitAnswer}>

                <label
                  htmlFor="answer"
                  className="form-label"
                >
                  Your Answer
                </label>

                <textarea
                  id="answer"
                  className="textarea assignment-textarea"
                  value={answer}
                  onChange={(e) =>
                    setAnswer(e.target.value)
                  }
                  placeholder="Write your answer here..."
                  disabled={
                    mySubmission?.marks !== null &&
                    mySubmission?.marks !== undefined
                  }
                />

                <div className="submission-actions">

                  <div className="muted">
                    {answer.length} characters
                  </div>

                  <button
                    className="btn submit-btn"
                    type="submit"
                    disabled={
                      mySubmission?.marks !== null &&
                      mySubmission?.marks !== undefined
                    }
                  >
                    {mySubmission
                      ? "Update Submission"
                      : "Submit Answer"}
                  </button>

                </div>

              </form>

            </section>


            {/* Submission result */}

            {mySubmission && (
              <section className="result-card">

                <div className="section-header">

                  <div>
                    <div className="section-icon green">
                      📊
                    </div>

                    <div>
                      <h2>Submission Result</h2>

                      <p className="muted">
                        Your submission information
                      </p>
                    </div>
                  </div>

                  <span
                    className={`status-pill ${
                      mySubmission.status.toLowerCase()
                    }`}
                  >
                    {mySubmission.status}
                  </span>

                </div>


                <div className="result-grid">

                  <div className="result-item">
                    <span className="result-label">
                      Status
                    </span>

                    <strong>
                      {mySubmission.status}
                    </strong>
                  </div>


                  <div className="result-item">
                    <span className="result-label">
                      Marks
                    </span>

                    <strong>
                      {mySubmission.marks ??
                        "Not graded"}

                      {mySubmission.marks !== null &&
                        mySubmission.marks !==
                          undefined &&
                        ` / ${assignment.maxMarks}`}
                    </strong>
                  </div>


                  <div className="result-item">
                    <span className="result-label">
                      Submitted
                    </span>

                    <strong>
                      {new Date(
                        mySubmission.submittedAt
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                </div>


                {/* Feedback */}

                <div className="feedback-box">

                  <div className="feedback-title">
                    💬 Teacher Feedback
                  </div>

                  <p>
                    {mySubmission.feedback ||
                      "No feedback yet. Your teacher has not provided feedback."}
                  </p>

                </div>

              </section>
            )}
          </>
        )}


        {/* =====================================================
            TEACHER VIEW
        ===================================================== */}

        {u?.role === "Teacher" && (
          <section className="section-card">

            <div className="section-header">

              <div>
                <div className="section-icon purple">
                  👨‍🏫
                </div>

                <div>
                  <h2>Student Submissions</h2>

                  <p className="muted">
                    Review and grade student answers.
                  </p>
                </div>
              </div>

              <div className="submission-count">
                {submissions.length}{" "}
                {submissions.length === 1
                  ? "Submission"
                  : "Submissions"}
              </div>

            </div>


            {submissions.length === 0 && (
              <div className="empty-state">

                <div className="empty-icon">
                  📭
                </div>

                <h3>No submissions yet</h3>

                <p className="muted">
                  Students have not submitted this
                  assignment yet.
                </p>

              </div>
            )}


            {submissions.map((submission) => {

              const isEditing =
                selectedSubmissionId ===
                submission.id;

              return (
                <div
                  className="submission-card"
                  key={submission.id}
                >

                  {/* Submission header */}

                  <div className="submission-header">

                    <div>

                      <span className="student-label">
                        STUDENT
                      </span>

                      <div className="student-name">
                        {submission.studentId}
                      </div>

                    </div>

                    <div className="submission-badges">

                      <span
                        className={`status-pill ${
                          submission.status.toLowerCase()
                        }`}
                      >
                        {submission.status}
                      </span>

                      <span className="marks-pill">
                        {submission.marks ??
                          "Not graded"}

                        {submission.marks !== null &&
                          submission.marks !==
                            undefined &&
                          ` / ${assignment.maxMarks}`}
                      </span>

                    </div>

                  </div>


                  {/* Answer */}

                  <div className="answer-container">

                    <div className="answer-title">
                      Student Answer
                    </div>

                    <div className="answer-box">
                      {submission.answer}
                    </div>

                  </div>


                  {/* Existing feedback */}

                  {submission.feedback && (
                    <div className="feedback-box">

                      <div className="feedback-title">
                        💬 Teacher Feedback
                      </div>

                      <p>
                        {submission.feedback}
                      </p>

                    </div>
                  )}


                  {/* Grade button */}

                  {!isEditing && (
                    <button
                      className="btn grade-btn"
                      type="button"
                      onClick={() =>
                        startGrading(
                          submission
                        )
                      }
                    >
                      {submission.marks !==
                        null &&
                      submission.marks !==
                        undefined
                        ? "✏️ Edit Marks & Feedback"
                        : "⭐ Give Marks & Feedback"}
                    </button>
                  )}


                  {/* Grading form */}

                  {isEditing && (
                    <form
                      className="grading-form"
                      onSubmit={(e) =>
                        gradeSubmission(
                          e,
                          submission
                        )
                      }
                    >

                      <div className="grading-title">
                        ✏️ Grade Submission
                      </div>

                      <p className="muted">
                        Give marks out of{" "}
                        <strong>
                          {assignment.maxMarks}
                        </strong>
                      </p>


                      <label
                        htmlFor={`marks-${submission.id}`}
                        className="form-label"
                      >
                        Marks
                      </label>

                      <input
                        id={`marks-${submission.id}`}
                        className="input"
                        type="number"
                        min="0"
                        max={
                          assignment.maxMarks
                        }
                        value={marks}
                        onChange={(e) =>
                          setMarks(
                            e.target.value
                          )
                        }
                        required
                      />


                      <label
                        htmlFor={`feedback-${submission.id}`}
                        className="form-label"
                      >
                        Feedback
                      </label>

                      <textarea
                        id={`feedback-${submission.id}`}
                        className="textarea"
                        placeholder="Write helpful feedback for the student..."
                        value={feedback}
                        onChange={(e) =>
                          setFeedback(
                            e.target.value
                          )
                        }
                      />


                      <div className="grading-actions">

                        <button
                          className="btn"
                          type="submit"
                          disabled={saving}
                        >
                          {saving
                            ? "Saving..."
                            : "💾 Save Marks & Feedback"}
                        </button>

                        <button
                          className="btn secondary"
                          type="button"
                          disabled={saving}
                          onClick={
                            cancelGrading
                          }
                        >
                          Cancel
                        </button>

                      </div>

                    </form>
                  )}

                </div>
              );
            })}

          </section>
        )}

      </main>
    </>
  );
}