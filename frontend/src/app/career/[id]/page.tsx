"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  Pencil,
  Trash2,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

type Job = {
  jobId: number;
  userId: number;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  createdAt?: string;
  User?: { username?: string };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const STATUS_OPTIONS = [
  {
    label: "Applied",
    value: "applied",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  },
  {
    label: "Pending",
    value: "pending",
    icon: <Clock className="w-4 h-4 text-amber-500" />,
  },
  {
    label: "Rejected",
    value: "rejected",
    icon: <XCircle className="w-4 h-4 text-red-400" />,
  },
];

export default function CareerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const toggleDropDown = () => setDropDownOpen((prev) => !prev);
  const toggleStatus = () => setStatusOpen((prev) => !prev);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/api/jobs/${id}`);
        if (!response.ok) throw new Error("Failed to load job");
        const data = await response.json();
        setJob(data);
      } catch (e: any) {
        setError(e?.message || "Could not load job.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (applying && job) {
      const applyToJob = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/apply/${job.jobId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to apply");
          alert("Application submitted!");
        } catch (e: any) {
          alert(e?.message || "Failed to apply.");
        } finally {
          setApplying(false);
        }
      };
      applyToJob();
    }
  }, [applying, job]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">
          Loading job...
        </div>
      </div>
    );

  if (error || !job)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-500 text-sm">{error || "Job not found."}</div>
      </div>
    );

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === selectedStatus);

  return (
    <div className="min-h-screen bg-slate-50 flex items-start gap-6 p-6">
      <div className="w-full ml-5 max-w-6xl">
        <button
          onClick={() => router.back()}
          className="mb-5 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          ← Go back
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-700 px-8 py-7 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-white leading-tight">
              {job.title}
            </h1>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => router.push(`/careers/${job.jobId}/edit`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this job posting?")) {
                    fetch(`${API_BASE}/api/jobs/${job.jobId}`, {
                      method: "DELETE",
                    }).then(() => router.back());
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-white text-sm font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-3">
            <p className="text-2xl font-bold text-slate-800">{job.company}</p>

            <div className="flex flex-wrap gap-3">
              {job.location && (
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  📍 {job.location}
                </span>
              )}
              {job.salary && (
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  💰 {job.salary}
                </span>
              )}
            </div>

            {job.description && (
              <div className="pt-2">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Job Description
                </p>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {job.description}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              Posted by {job.User?.username || `User ${job.userId}`}
            </p>
          </div>

          {/* Applied status dropdown */}
          <div className="border-t border-slate-100">
            <button
              onClick={toggleStatus}
              className="w-full flex items-center justify-between px-8 py-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                {currentStatus ? (
                  <>
                    {currentStatus.icon}
                    <span>
                      Status:{" "}
                      <span className="font-semibold text-slate-800">
                        {currentStatus.label}
                      </span>
                    </span>
                  </>
                ) : (
                  "Track application status"
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  statusOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                statusOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-8 pb-4 flex flex-col gap-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedStatus(opt.value);
                      setStatusOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      selectedStatus === opt.value
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="pr-10 mt-10 w-full max-w-sm shrink-0 space-y-4">
        {/* Apply card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={toggleDropDown}
            aria-expanded={dropDownOpen}
            className="w-full flex items-center justify-between px-6 py-4 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors"
          >
            Want to apply?
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                dropDownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              dropDownOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-6 border-t border-slate-100 space-y-3 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Resume / CV
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:transition-colors"
                />
                {selectedFile && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    📎 {selectedFile.name}
                  </p>
                )}
              </div>

              <button
                onClick={() => setApplying(true)}
                disabled={applying}
                className="w-full mt-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60"
              >
                {applying ? "Submitting..." : "Apply Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-3">
            Find other jobs
          </h2>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
              placeholder="Search jobs..."
            />
          </div>
          <div className="mt-4">Other Jobs Comming soon ....</div>
        </div>
      </aside>
    </div>
  );
}
