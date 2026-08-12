"use client";
import { FormEvent, useEffect, useState } from "react";
import { api, user } from "@/lib/api";
import Nav from "@/components/Nav";
export default function NewAssignment() {
  const u = user();
  const [classes, setClasses] = useState<any[]>([]),
    [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    maxMarks: 20,
    classId: "",
    subjectId: "",
    publish: true,
  });
  const [error, setError] = useState("");
  useEffect(() => {
    if (!u || u.role !== "Teacher") {
      location.href = "/dashboard";
      return;
    }
    api<any[]>("/admin/classes")
      .catch(() => [])
      .then(setClasses);
    api<any[]>("/admin/subjects")
      .catch(() => [])
      .then(setSubjects);
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/assignments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          maxMarks: Number(form.maxMarks),
          deadline: new Date(form.deadline).toISOString(),
        }),
      });
      location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message);
    }
  }
  return (
    <>
      <Nav />
      <main className="container">
        <div className="card">
          <h1>Create Assignment</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={submit}>
            <label>Title</label>
            <input
              className="input"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <label>Description</label>
            <textarea
              className="textarea"
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <label>Deadline</label>
            <input
              className="input"
              type="datetime-local"
              required
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
            <label>Maximum marks</label>
            <input
              className="input"
              type="number"
              min="1"
              required
              value={form.maxMarks}
              onChange={(e) =>
                setForm({ ...form, maxMarks: Number(e.target.value) })
              }
            />
            <label>Class</label>
            <select
              className="select"
              required
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label>Subject</label>
            <select
              className="select"
              required
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button className="btn" type="submit">
              Create & {form.publish ? "Publish" : "Save Draft"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
