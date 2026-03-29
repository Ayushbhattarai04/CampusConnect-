"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-4  mt-auto">
      <p className="text-left ml-15">
        Copyright © {new Date().getFullYear()} CampusConnect. All rights
        reserved.
      </p>
      <p className="text-right mr-15 ">
        <a href="/" className="text-white hover:underline">
          Home
        </a>
        <a href="/about" className="text-white hover:underline ml-4">
          About
        </a>
        <a href="/contact" className="text-white hover:underline ml-4">
          Contact
        </a>
      </p>
    </footer>
  );
}
