"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function CareerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  //Apply jobs
  useEffect(() => {
    if (applying && job) {
      const applyToJob = async () => {
        try {
          const response = await fetch(
            `${API_BASE}/api/jobs/${job.jobId}/apply`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            },
          );
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

  if (loading) return <div className="p-6">Loading job...</div>;
  if (error || !job)
    return <div className="p-6 text-red-600">{error || "Job not found."}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-start gap-6 p-6">
      <div className="w-full ml-3 max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-4 text-mid text-indigo-600 hover:text-indigo-900"
        >
          Go back
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold rounded-t-2xl p-10 bg-indigo-700  text-white">
            {job.title}
          </h1>
          <div className="p-6">
            <p className="mt-2 text-slate-700">{job.company}</p>
            {job.location && (
              <p className="text-slate-600 mt-1">Location: {job.location}</p>
            )}
            {job.salary && (
              <p className="text-slate-600 mt-1">Salary: {job.salary}</p>
            )}
            {job.description && (
              <p className="mt-4 text-slate-700">{job.description}</p>
            )}
            <p className="mt-4 text-xs text-slate-500">
              Posted by {job.User?.username || `User ${job.userId}`}
            </p>
          </div>
        </div>
      </div>
      {/* Apply for jobs  */}
      <aside className=" ml-100 mt-18 w-full max-w-sm">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 font-semibold m-1">Name of applicant</p>
          <input
            type="text"
            placeholder="Name of Applicant"
            className="border border-slate-300 rounded-md p-2 focus:outline-none mb-1 focus:ring-2 focus:ring-indigo-500"
          />

          <p className="text-slate-500 font-semibold m-1 ">Email Address</p>
          <input
            type="email"
            placeholder="Email Address"
            className="border border-slate-300 rounded-md p-2 focus:outline-none mb-1 focus:ring-2 focus:ring-indigo-500 mt-2"
          />
          <p className="block  font-semibold text-slate-500 mb-2">
            Upload Resume/CV
          </p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {selectedFile && (
            <p className="text-sm text-slate-600 mt-2">
              📄 {selectedFile.name}
            </p>
          )}

          <button
            onClick={() => setApplying(true)}
            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </aside>
    </div>
  );
}
