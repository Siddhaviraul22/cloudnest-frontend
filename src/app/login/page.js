"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cloud,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";

import { loginUser } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const showError = (message) => {
    setError(message);

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      showError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      showError("Please enter your password.");
      return;
    }

    if (password.length < 8) {
      showError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({
        email: trimmedEmail,
        password
      });

      setUser(data.user);

      router.push("/dashboard");
    } catch (error) {
      showError(error.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      {error && (
        <div className="fixed top-5 right-5 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-white border border-red-200 shadow-lg rounded-xl p-4 flex items-start gap-3">

            <div className="mt-0.5">
              <AlertCircle
                size={20}
                className="text-red-500"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                Login failed
              </p>

              <p className="text-sm text-slate-600 mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <Cloud
                className="text-white"
                size={26}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-900">
            Welcome to CloudNest
          </h1>

          <p className="text-center text-slate-500 mt-2 mb-8">
            Sign in to your cloud storage
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                minLength={8}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />

              <p className="text-xs text-slate-400 mt-2">
                Password must contain at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-slate-200 flex-1" />

            <span className="text-sm text-slate-400">
              OR
            </span>

            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full rounded-lg border border-slate-300 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}

            <Link
              href="/register"
              className="font-medium text-slate-900 hover:underline"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}