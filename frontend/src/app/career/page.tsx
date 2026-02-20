"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  Wallet,
  Search,
  Loader2,
  EllipsisVertical,
} from "lucide-react";

type Job = {
  jobId: number;
  userId: number;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  description?: string;
  createdAt?: string;
  User?: {
    username?: string;
  };
};

type JobForm = {
  userId?: number | null;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function CareerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<JobForm>({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
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

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/jobs`);
      if (!response.ok) throw new Error("Failed to load jobs");
      const data: Job[] = await response.json();
      setJobs(data);
    } catch (e) {
      setError(
        "Could not load jobs. Make sure backend is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return jobs;
    return jobs.filter((job) =>
      [job.title, job.company, job.location, job.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text),
    );
  }, [jobs, query]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      setFormError("Please login first to post a job.");
      return;
    }

    if (!form.title.trim() || !form.company.trim()) {
      setFormError("Title and company are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          title: form.title.trim(),
          company: form.company.trim(),
          location: form.location.trim(),
          salary: form.salary.trim(),
          description: form.description.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || "Failed to create job");
      }

      setForm({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
      });

      await fetchJobs();
    } catch (e: any) {
      setFormError(e?.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const [activeJobId, setActiveJobId] = useState<number | string | null>(null);
  //Job CArd modal
  const [showJobModal, setShowJobModal] = useState(false);
  const handleOpenJobModal = async (jobId: number | string) => {
    setActiveJobId(jobId);
    setShowJobModal(true);
    await fetchJobs();
  };

  const [openDropdownJobId, setOpenDropdownJobId] = useState<
    number | string | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = (jobId: number | string) => {
    setOpenDropdownJobId(openDropdownJobId === jobId ? null : jobId);
  };

  //to close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownJobId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener,
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left section: Jobs */}
          <section className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-7 h-7 text-indigo-600" />
                    Career Opportunities
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Discover jobs posted by your campus community.
                  </p>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search title, company, location..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 flex items-center justify-center text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading jobs...
              </div>
            ) : error ? (
              <div className="bg-white border border-red-200 rounded-2xl p-8 text-center text-red-600">
                {"An error occurred while loading jobs."}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
                No jobs found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => (
                  <div key={job.jobId}>
                    <article
                      onClick={() => handleOpenJobModal(job.jobId)}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      {String(job.userId) === String(currentUserId) && (
                        <EllipsisVertical
                          className="ml-85 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(job.jobId);
                          }}
                        />
                      )}
                      <h2 className="text-lg font-semibold text-slate-900">
                        {job.title}
                      </h2>

                      {openDropdownJobId === job.jobId && (
                        <div className="absolute ml-70 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-10">
                          <button className="block w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 rounded">
                            Edit
                          </button>
                          <button className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded">
                            Delete
                          </button>
                        </div>
                      )}
                      <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {job.company}
                        </p>

                        {job.location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {job.location}
                          </p>
                        )}
                        {job.salary && (
                          <p className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-slate-400" />
                            {job.salary}
                          </p>
                        )}
                      </div>

                      {job.description && (
                        <p className="mt-4 text-sm text-slate-700 line-clamp-4">
                          {job.description}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                        <span>
                          Posted by {job.User?.username || `User ${job.userId}`}
                        </span>
                        <span>
                          {job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </article>
                    {activeJobId === job.jobId && (
                      <div className="fixed inset-0 bg-black/20 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {job.title}
                          </h3>
                          <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              {job.company}
                            </p>

                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {job.location}
                            </p>

                            <p className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-slate-400" />
                              {job.salary}
                            </p>
                          </div>
                          <p className="mt-4 text-sm text-slate-700 line-clamp-4">
                            Description: {job.description}
                          </p>
                          <div className="flex-row m-3">
                            <button className=" py-1 rounded-xl bg-indigo-600 text-white font-10px hover:bg-indigo-700 transition">
                              Apply Now
                            </button>
                            <button
                              onClick={() => setActiveJobId(null)}
                              className=" py-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right: Create Job */}
          <aside>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Post a Job
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Share opportunities with students and alumni.
              </p>

              {formError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateJob} className="space-y-3">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleInput}
                  placeholder="Job title *"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
                <input
                  name="company"
                  value={form.company}
                  onChange={handleInput}
                  placeholder="Company *"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
                <input
                  name="location"
                  value={form.location}
                  onChange={handleInput}
                  placeholder="Location"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
                <input
                  name="salary"
                  value={form.salary}
                  onChange={handleInput}
                  placeholder="Salary (e.g. NPR 40,000/month)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  placeholder="Description"
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition"
                >
                  {submitting ? "Posting..." : "Post Job"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
