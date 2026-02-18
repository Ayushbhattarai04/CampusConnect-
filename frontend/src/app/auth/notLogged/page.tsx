"use client";

import React from "react";
import {
  Key,
  User,
  Sparkles,
  Users,
  GraduationCap,
  Heart,
  Target,
  Rocket,
} from "lucide-react";

const LoggedOut = () => {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(./img/background2.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-purple-900/30 to-gray-900/50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="pt-8 pb-6 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="bg-linear-to-r from-sky-600/80 to-purple-600/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-3">
                WELCOME TO CAMPUS CONNECT
              </h1>
              <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-medium text-white/95">
                <Sparkles className="w-5 h-5" />
                <p>WHERE STUDENTS CONNECT AND THRIVE TOGETHER</p>
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Logo */}
        <div className="flex justify-center mb-8 px-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <img
              src="/img/campuslogo.png"
              alt="Campus Connect Logo"
              className="relative w-40 md:w-52 rounded-full shadow-2xl border-4 border-white/20 transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Login Card */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/20">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-400 to-pink-500 rounded-full mb-4">
                    <Key className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Already have an account?
                  </h2>
                  <p className="text-white/80 mb-4">
                    Sign in to continue your journey
                  </p>
                  <a href="/auth/login">
                    <button className="w-full px-8 py-4 bg-linear-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:from-orange-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                      <Key className="w-5 h-5" />
                      Login to Your Account
                    </button>
                  </a>
                </div>
              </div>
            </div>

            {/* Register Card */}
            <div className="group">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/20">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    New here?
                  </h2>
                  <p className="text-white/80 mb-4">
                    Create an account to get started
                  </p>
                  <a href="/auth/register">
                    <button className="w-full px-8 py-4 bg-linear-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-xl shadow-lg hover:from-yellow-500 hover:to-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                      <User className="w-5 h-5" />
                      Register Now
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Motto Card */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl group"
              style={{
                backgroundImage: `url(./img/stud.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-linear-to-br from-amber-900/80 to-red-900/80"></div>
              <div className="relative p-8 backdrop-blur-sm">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Target className="w-8 h-8 text-yellow-300" />
                    <h3 className="text-3xl font-bold text-white">
                      Our Motto!
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-white">
                      <GraduationCap className="w-6 h-6 text-yellow-300 shrink-0 mt-1" />
                      <span className="text-lg font-medium">
                        "Connecting Minds, Creating Futures"
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <Rocket className="w-6 h-6 text-yellow-300 shrink-0 mt-1" />
                      <span className="text-lg font-medium">
                        "Empowering Students, Enriching Lives"
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <Users className="w-6 h-6 text-yellow-300 shrink-0 mt-1" />
                      <span className="text-lg font-medium">
                        "Where Learning Meets Community"
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Why Campus Connect Card */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl group"
              style={{
                backgroundImage: `url(./img/lib.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-linear-to-br from-red-900/80 to-purple-900/80"></div>
              <div className="relative p-8 backdrop-blur-sm">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Heart className="w-8 h-8 text-pink-300" />
                    <h3 className="text-3xl font-bold text-white">
                      Why Campus Connect?
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-white">
                      <Sparkles className="w-6 h-6 text-pink-300 shrink-0 mt-1" />
                      <span className="text-lg font-medium">
                        "Bridging the Gap Between Students and Opportunities"
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <GraduationCap className="w-6 h-6 text-pink-300 shrink-0 mt-1" />
                      <span className="text-lg font-medium">
                        "Your Gateway to Campus Life and Beyond"
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-white">
                      <Rocket className="w-6 h-6 text-pink-300 shrink-0 mt-1" />
                      <span className="text-lg font-medium">
                        "Fostering Connections, Fueling Success"
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedOut;
