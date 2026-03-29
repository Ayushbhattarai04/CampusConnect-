"use client";
import React from "react";
import AdminNavbar from "../components/AdminNavbar";

export default function CollegeDashboard() {
  return (
    <div>
      <AdminNavbar />
      <div className="p-8 mt-15">
        <h1 className="text-2xl font-bold mb-4">College Dashboard</h1>
        <p>
          Welcome to the college dashboard! Here you can manage your profile,
          post job listings, and view applications from students.
        </p>
      </div>
    </div>
  );
}
