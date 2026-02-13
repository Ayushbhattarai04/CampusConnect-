"use client";
import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!values.email.trim()) newErrors.email = "Email is required";
    if (!values.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        values,
      );

      if (response.status === 200) {
        // Save token based on "Remember Me"
        if (rememberMe) {
          localStorage.setItem("token", response.data.token);
          sessionStorage.removeItem("token");
        } else {
          sessionStorage.setItem("token", response.data.token);
          localStorage.removeItem("token");
        }

        // Save user data if needed
        localStorage.setItem("user", JSON.stringify(response.data.user));
        // Save username for Navbar
        if (response.data.user && response.data.user.username) {
          localStorage.setItem("username", response.data.user.username);
        }

        // Redirect to home/dashboard
        router.push("/");
      }
    } catch (error: any) {
      let errorMessage =
        "Login failed. Please check your credentials and try again.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.code === "ERR_NETWORK") {
        errorMessage =
          "Cannot connect to server. Make sure backend is running on http://localhost:5000";
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex p-4"
      style={{
        backgroundImage: `url(../img/background.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-1/2 bg-white/10 backdrop-blur-md flex items-center justify-center m-4 rounded-3xl border border-white/30 shadow-2xl">
        <div className="text-center space-y-6 p-8">
          <div className="w-32 h-32 mx-auto bg-linear-to-br from-violet-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition">
            <img
              src="../img/campuslogo.png"
              alt="Campus Connect Logo"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl tracking-tight">
            Campus Connect
          </h1>
          <p className="text-white/90 text-xl max-w-md font-light">
            Where students connect, collaborate, and thrive together
          </p>
        </div>
      </div>

      <div className="w-1/2 bg-white/95 backdrop-blur-sm flex flex-col rounded-3xl m-4 shadow-2xl">
        <div className="px-8 pt-6 pb-4">
          <Link href="/">
            <button className="text-gray-700 hover:text-violet-600 flex items-center gap-2 transition font-medium">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
        </div>

        <div className="flex-1 px-12 pb-8">
          <div className="bg-linear-to-br from-violet-500 to-purple-600 p-8 text-center mb-8 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-bold text-white tracking-wide">
              Welcome Back! 👋
            </h1>
            <p className="text-violet-100 text-base mt-3">
              Sign in to continue to Campus Connect
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-semibold">Login Failed</p>
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            </div>
          )}

          <div className="grid mb-6">
            <button className="flex items-center justify-center gap-3 bg-white border-2 border-gray-300 px-6 py-4 rounded-xl hover:shadow-xl hover:border-violet-400 transition transform hover:scale-[1.02]">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-base font-semibold text-gray-700">
                Sign in with Google
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm font-semibold">
              Are you a student, sign in with email
            </span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-800 text-sm mb-2 font-bold">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white outline-none border-2 ${
                    errors.email ? "border-red-400" : "border-gray-300"
                  } shadow-sm focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition`}
                  name="email"
                  value={values.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-800 text-sm mb-2 font-bold">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-4 rounded-xl bg-white outline-none border-2 ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  } shadow-sm focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition`}
                  name="password"
                  value={values.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 font-medium">
                  Remember me
                </span>
              </label>
              <Link href="/forgot-password">
                <span className="text-sm text-violet-600 hover:text-violet-800 font-bold cursor-pointer">
                  Forgot password?
                </span>
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-violet-600 hover:to-purple-700 transform hover:scale-[1.02] transition shadow-xl hover:shadow-2xl ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <Link href="../auth/register">
              <span className="text-violet-600 hover:text-violet-800 font-bold cursor-pointer">
                Create one now
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
