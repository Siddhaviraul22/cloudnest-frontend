"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Folder,
  Star,
  Clock3,
  Trash2,
  Share2,
  LogOut,
  Upload
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading CloudNest...</p>
      </main>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <Cloud className="text-white" size={22} />
          </div>

          <span className="text-xl font-bold text-slate-900">
            CloudNest
          </span>
        </div>

        <nav className="px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 text-slate-900 font-medium">
            <Folder size={19} />
            My Drive
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50">
            <Share2 size={19} />
            Shared
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50">
            <Star size={19} />
            Starred
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50">
            <Clock3 size={19} />
            Recent
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50">
            <Trash2 size={19} />
            Trash
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      <section className="flex-1">
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Drive
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Welcome, {user.name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="md:hidden"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </header>

        <div className="p-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-8">
            <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <Upload size={30} className="text-slate-700" />
              </div>

              <h2 className="text-xl font-semibold text-slate-900">
                Your CloudNest drive
              </h2>

              <p className="text-slate-500 mt-2 max-w-md">
                Upload files to your private cloud storage.
                The upload area will be connected next.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}