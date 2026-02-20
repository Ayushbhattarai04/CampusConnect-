"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  BookOpen,
  Clock3,
  MapPin,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";

type Tuition = {
  tutionId?: number;
  id?: number;
  userId: number;
  tutor: string;
  subject: string;
  location?: string;
  fee?: string;
  schedules?: string | Date;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  User?: {
    id: number;
    name: string;
    email: string;
  };
};

type TutionForm = {
  tutor: string;
  subject: string;
  location: string;
  fee: string;
  description: string;
  schedules: string;
};
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function TutionPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<TutionForm>({
    tutor: "",
    subject: "",
    location: "",
    fee: "",
    description: "",
    schedules: "",
  });

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const user = JSON.parse(raw);
      return Number(user?.id) || null;
    } catch {
      return null;
    }
  }, []);

  const fetchTutions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/tution`);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const result = await response.json();
      const tutionsData = Array.isArray(result) ? result : result.data || [];
      setTuitions(tutionsData);
    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(
        e?.message ||
          "Could not load tuitions. Make sure backend is running on port 5000.",
      );
      setTuitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutions();
  }, []);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleCreateTution = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      setFormError("Please login first to post a tution.");
      return;
    }

    if (!form.tutor.trim() || !form.subject.trim()) {
      setFormError("Tutor and subject are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      // Formats schedules properly for backend
      let schedulesValue = selectedDate;
      if (!schedulesValue) {
        // If no selected date, use current date + time
        schedulesValue = new Date().toISOString();
      } else {
        // Convert datetime-local string to ISO format
        schedulesValue = new Date(schedulesValue).toISOString();
      }

      const response = await fetch(`${API_BASE}/api/tution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          tutor: form.tutor.trim(),
          subject: form.subject.trim(),
          location: form.location.trim(),
          fee: form.fee.trim(),
          description: form.description.trim(),
          schedules: schedulesValue,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to create tution");
      }

      setForm({
        tutor: "",
        subject: "",
        location: "",
        fee: "",
        description: "",
        schedules: "",
      });
      setSelectedDate("");

      await fetchTutions();
      setFormError("Tution posted successfully!");
    } catch (e: any) {
      setFormError(e?.message || "Failed to create tution");
    } finally {
      setSubmitting(false);
    }
  };
  const filteredTutions = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return tuitions;
    return tuitions.filter((tution) =>
      [
        tution.subject,
        tution.tutor,
        tution.location,
        tution.description,
        tution.User?.name,
        tution.fee,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text),
    );
  }, [tuitions, query]);

  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-7 h-7 text-indigo-600" />
                    Tution Hub
                  </h1>
                  <p className="text-slate-600 mt-1">Find trusted tutors.</p>
                </div>
                <span className="text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                  {filteredTutions.length} available
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tutor, subject, location..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>

                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                ></select>
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow-sm">
                  Loading tuitions...
                </div>
              ) : filteredTutions.length > 0 ? (
                filteredTutions.map((item) => (
                  <article
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {item.subject}
                        </h2>
                        <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1.5">
                          <UserRound className="w-4 h-4" />
                          {item.tutor}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-slate-100 text-slate-700">
                        {item.schedules
                          ? new Date(item.schedules).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "No date"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-700">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        {item.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-indigo-600" />
                        {item.fee}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-indigo-600" />
                        {item.schedules
                          ? new Date(item.schedules).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "No time"}
                      </p>
                    </div>

                    <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </p>

                    <button className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                      Contact Tutor
                    </button>
                  </article>
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600 shadow-sm">
                  No tution listing found for your search.
                </div>
              )}
            </div>
          </section>
          {/* Right side: Create Tution classes */}
          <aside className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Want to become a tutor?
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Share your learning goal and let students find you.
              </p>

              <form onSubmit={handleCreateTution} className="space-y-3">
                {formError && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      formError.includes("successfully")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {formError}
                  </div>
                )}
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleInput}
                  placeholder="Subject"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  name="location"
                  value={form.location}
                  onChange={handleInput}
                  placeholder="Preferred location"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  name="fee"
                  value={form.fee}
                  onChange={handleInput}
                  placeholder="Budget (e.g. NPR 1500/week)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  name="tutor"
                  value={form.tutor}
                  onChange={handleInput}
                  placeholder="Tutor"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <label htmlFor="schedule" className="text-sm font-medium">
                  Select Date & Time
                </label>
                <input
                  id="schedule"
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {selectedDate && (
                  <p className="text-sm text-gray-600">
                    Chosen Schedule: {new Date(selectedDate).toLocaleString()}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
                >
                  {submitting ? "Posting..." : "Post Request"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
