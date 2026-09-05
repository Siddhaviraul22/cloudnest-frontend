"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Cloud, Loader2, X } from "lucide-react";

import { registerUser } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = setTimeout(() => {
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error]);

  const showError = (message) => {
    setError(message);
  };

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    showError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      showError("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      showError("Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      showError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      showError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      showError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password
      });

      setUser(data.user);

      router.push("/dashboard");
    } catch (error) {
      showError(error.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {error && (
          <div className="fixed top-5 right-5 z-50 w-[calc(100%-40px)] max-w-md">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-4 shadow-lg">
              <AlertCircle
                className="mt-0.5 shrink-0 text-red-500"
                size={20}
              />

              <p className="flex-1 text-sm font-medium text-slate-700">
                {error}
              </p>

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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <Cloud className="text-white" size={26} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-900">
            Create your account
          </h1>

          <p className="text-center text-slate-500 mt-2 mb-8">
            Start using CloudNest
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
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
                placeholder="Create a password"
                required
                minLength={8}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
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

              {loading ? "Creating account..." : "Create account"}
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
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-medium text-slate-900 hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}