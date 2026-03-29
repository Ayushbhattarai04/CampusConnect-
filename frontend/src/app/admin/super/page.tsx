"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function SuperDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <div className="pt-20 px-6">
        <h1 className="text-3xl font-bold text-center mt-10">
          Super Admin Dashboard
        </h1>
        <p className="text-center mt-4 text-gray-600">
          Welcome to the Super Admin Dashboard. Here you can manage all aspects
          of the platform.
        </p>
      </div>
    </div>
  );
}
