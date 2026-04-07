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
import Footer from "@/app/pages/Footer";
import AppShell from "../../pages/AppShell";

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
type applicantsDetails = {
  appliedId: number;
  applicantName: string;
  applicantEmail: string;
  applicantDescription: string;
  cvUrl: string;
  status: "accepted" | "pending" | "rejected";
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const STATUS_OPTIONS = [
  {
    label: "Accepted",
    value: "accepted",
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
  const [applierEmail, setApplierEmail] = useState("");
  const [applierDescription, setApplierDescription] = useState("");
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [openStatusForId, setOpenStatusForId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [applicantsDetails, setApplicantsDetails] = useState<
    applicantsDetails[]
  >([]);
  const [appliersDropdownOpen, setAppliersDropdownOpen] = useState(false);
  const [otherJobs, setOtherJobs] = useState<Job[]>([]);

  const currentUserId = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Number(parsed?.id) || null;
    } catch {
      return null;
    }
  })();

  const toggleDropDown = () => setDropDownOpen((prev) => !prev);

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
    if (job && currentUserId === job.userId) {
      fetchAppliers();
    }
  }, [job, currentUserId]);

  const fetchAppliers = async () => {
    if (!job) return;
    try {
      const response = await fetch(
        `${API_BASE}/api/job-applications/applications?jobId=${job.jobId}`,
      );
      if (!response.ok) throw new Error("Failed to load applications");
      const data = await response.json();
      const mapped = Array.isArray(data)
        ? data.map((item: any) => ({
            appliedId: Number(item.appliedId),
            applicantName: item?.User?.username || `User ${item.userId}`,
            applicantEmail: item?.appliersemail || item?.User?.email || "N/A",
            applicantDescription: item?.applierdescription || "N/A",
            cvUrl: `${API_BASE}/api/job-applications/applications/${item.appliedId}/cv`,
            status: item?.status || "pending",
          }))
        : [];

      setApplicantsDetails(mapped);
    } catch (e: any) {
      console.error("Error fetching applications:", e?.message || e);
    }
  };

  const fetchOtherJobs = async () => {
    if (!job) return;
    try {
      const response = await fetch(
        `${API_BASE}/api/jobs?excludeId=${job.jobId}`,
      );
      if (!response.ok) throw new Error("Failed to load other jobs");
      const data = await response.json();
      setOtherJobs(data);
    } catch (e: any) {
      console.error("Error fetching other jobs:", e?.message || e);
    }
  };

  const applyToJob = async () => {
    if (!job) return;
    if (!currentUserId) {
      alert("Please login first to apply.");
      return;
    }
    if (!selectedFile) {
      alert("Please upload your CV.");
      return;
    }

    setApplying(true);
    try {
      const formData = new FormData();
      formData.append("jobId", String(job.jobId));
      formData.append("userId", String(currentUserId));
      formData.append("cv", selectedFile);

      if (applierEmail.trim()) {
        formData.append("appliersemail", applierEmail.trim());
      }
      if (applierDescription.trim()) {
        formData.append("applierdescription", applierDescription.trim());
      }

      const response = await fetch(`${API_BASE}/api/job-applications/apply`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to apply");
      }

      alert("Application submitted!");
      setSelectedFile(null);
      setApplierDescription("");
    } catch (e: any) {
      alert(e?.message || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  const updateApplicationStatus = async (
    appliedId: number,
    status: applicantsDetails["status"],
  ) => {
    setUpdatingStatusId(appliedId);
    try {
      const response = await fetch(
        `${API_BASE}/api/job-applications/applications/${appliedId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Failed to update status");
      }

      setApplicantsDetails((prev) =>
        prev.map((applicant) =>
          applicant.appliedId === appliedId
            ? { ...applicant, status }
            : applicant,
        ),
      );
    } catch (e: any) {
      alert(e?.message || "Failed to update status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (loading)
    return (
      <AppShell>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-400 text-sm animate-pulse">
            Loading job...
          </div>
        </div>
      </AppShell>
    );

  if (error || !job)
    return (
      <AppShell>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-red-500 text-sm">
            {error || "Job not found."}
          </div>
        </div>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="mx-auto flex w-full items-start gap-6 p-6">
          <div className=" w-full ml-5 mr-5 mx-auto">
            <button
              onClick={() => router.back()}
              className="mb-5  text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              Go back
            </button>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-slate-700 px-8 py-7 flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-white leading-tight">
                  {job.title}
                </h1>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => router.push(`/careers/${job.jobId}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
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
                <p className="text-2xl font-bold text-slate-800">
                  {job.company}
                </p>

                <div className="flex flex-wrap gap-3">
                  {job.location && (
                    <span className=" text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      Location: {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className=" text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      Salary: {job.salary}
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
            </div>
            {currentUserId === job.userId && (
              <div className="bg-white  mt-10 rounded-lg border border-gray-300 shadow-">
                {/* appliers list  for owner of job portals */}

                <div className="px-6 py-4">
                  <div className="text-slate-500 font-sans font-bold text-xl">
                    <button
                      className="w-full flex items-center justify-between px-2 py-1 hover:text-slate-900 transition-colors"
                      onClick={() => setAppliersDropdownOpen((prev) => !prev)}
                      aria-expanded={appliersDropdownOpen}
                    >
                      <span>
                        Applicants
                        <a className=" ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-orange-600 text-white text-xs font-bold">
                          {applicantsDetails.length}
                        </a>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          appliersDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      appliersDropdownOpen
                        ? "max-h-[1200px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {applicantsDetails.length === 0 ? (
                      <div className="border border-slate-200 rounded-lg p-4 mt-4 text-sm text-slate-500">
                        No applicants yet.
                      </div>
                    ) : (
                      applicantsDetails.map((applicant) => (
                        <div
                          key={applicant.appliedId}
                          className="border border-slate-200 rounded-lg p-4 mt-4 "
                        >
                          <p className="font-sans text-sm p-1 text-gray-700">
                            Applicant: {applicant.applicantName}
                          </p>
                          <p className="font-sans text-sm p-1 text-gray-700">
                            Email: {applicant.applicantEmail}
                          </p>
                          <p className="font-sans text-sm p-1 text-gray-700">
                            Description: {applicant.applicantDescription}
                          </p>
                          <p className="font-sans text-sm p-1 text-gray-700">
                            CV:{" "}
                            <a
                              href={applicant.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download CV
                            </a>
                          </p>
                          {/* Applied status dropdown */}
                          <div className="border border-slate-200 rounded-lg mt-4">
                            <button
                              onClick={() =>
                                setOpenStatusForId((prev) =>
                                  prev === applicant.appliedId
                                    ? null
                                    : applicant.appliedId,
                                )
                              }
                              disabled={
                                updatingStatusId === applicant.appliedId
                              }
                              className="w-full flex items-center justify-between px-8 py-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                {STATUS_OPTIONS.find(
                                  (s) => s.value === applicant.status,
                                ) ? (
                                  <>
                                    {
                                      STATUS_OPTIONS.find(
                                        (s) => s.value === applicant.status,
                                      )?.icon
                                    }
                                    <span>
                                      Status:{" "}
                                      <span className="font-semibold text-slate-800">
                                        {
                                          STATUS_OPTIONS.find(
                                            (s) => s.value === applicant.status,
                                          )?.label
                                        }
                                      </span>
                                    </span>
                                  </>
                                ) : (
                                  "Set Application Status"
                                )}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                  openStatusForId === applicant.appliedId
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>

                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                openStatusForId === applicant.appliedId
                                  ? "max-h-48 opacity-100"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              <div className="px-8 pb-4 flex flex-col gap-1">
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={async () => {
                                      await updateApplicationStatus(
                                        applicant.appliedId,
                                        opt.value as applicantsDetails["status"],
                                      );
                                      setOpenStatusForId(null);
                                    }}
                                    disabled={
                                      updatingStatusId === applicant.appliedId
                                    }
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                                      applicant.status === opt.value
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
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="pr-10 mt-11 w-full max-w-2xl shrink-0 space-y-4 mx-auto">
            {/* Apply card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={toggleDropDown}
                aria-expanded={dropDownOpen}
                className="w-full flex items-center justify-between px-6 py-4 text-slate-700 font-semibold hover:bg-indigo-50 transition-colors"
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
                  dropDownOpen
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 border-t border-slate-100 space-y-3 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={applierEmail}
                      onChange={(e) => setApplierEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={applierDescription}
                      onChange={(e) => setApplierDescription(e.target.value)}
                      placeholder="Write a short note to the employer (optional)"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      CV
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 file:transition-colors"
                    />
                    {selectedFile && (
                      <p className="text-xs text-slate-500 mt-1.5">
                        {selectedFile.name}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={applyToJob}
                    disabled={applying}
                    className="w-full mt-1 bg-slate-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 hover:shadow-orange-100 hover:shadow-lg active:scale-95 transition-all disabled:opacity-60"
                  >
                    {applying ? "Submitting..." : "Apply Now"}
                  </button>
                </div>
              </div>
            </div>

            {/* Search card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mt-10">
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
              <div className="mt-4">
                {/* Other Jobs */}
                <div className="bg-slate-50 rounded-lg p-4 text-sm border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors cursor-pointer  ">
                  <p className="text-xl font-sans font-bold p-1 ">
                    {otherJobs[0]?.title}{" "}
                  </p>
                  <p className="text-slate-600 p-1 ">
                    Company: {otherJobs[0]?.company}
                  </p>
                  <p className="text-slate-500 p-1">
                    Salary:{otherJobs[0]?.salary}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
        <Footer />
      </div>
    </AppShell>
  );
}
