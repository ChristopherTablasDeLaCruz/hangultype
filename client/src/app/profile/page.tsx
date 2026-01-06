"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Stats State
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLessonCount, setTotalLessonCount] = useState(0);
  const [avgWpm, setAvgWpm] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const initProfile = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          router.push("/login");
          return;
        }
        setUser(user);

        // 1. Fetch ALL lessons for dynamic count
        const lessonsRes = await fetch(`${API_URL}/lessons`);
        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          setTotalLessonCount(lessonsData.length);
        }

        // 2. Fetch User Progress aggregates
        const progressRes = await fetch(`${API_URL}/user/progress/${user.id}`);
        if (progressRes.ok) {
          const data = await progressRes.json();
          setCompletedCount(data.completed_lessons?.length || 0);
          setAvgWpm(Math.round(data.average_wpm || 0));
          setAvgAccuracy(Math.round(data.average_accuracy || 0));
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="pt-12 px-6 max-w-4xl mx-auto relative z-10 pb-20">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/lessons"
            className="group flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors font-mono text-xs font-bold uppercase tracking-widest"
          >
            <span className="group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            Return_To_Missions
          </Link>
          <div className="px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 text-[10px] font-mono text-slate-500">
            SYSTEM_STATUS: STABLE
          </div>
        </div>

        {/* Profile Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Performance Metrics
          </h1>
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
            USER_ID: {user?.email?.split("@")[0].toUpperCase()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Progress Card */}
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
              Modules Completed
            </div>
            <div className="text-4xl font-bold text-white font-mono">
              {completedCount}{" "}
              <span className="text-lg text-slate-600 font-sans font-normal">
                / {totalLessonCount}
              </span>
            </div>
          </div>

          {/* WPM Card */}
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
              Avg Speed
            </div>
            <div className="text-4xl font-bold text-cyan-400 font-mono">
              {avgWpm}{" "}
              <span className="text-lg text-cyan-500/30 font-sans font-normal">
                WPM
              </span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
              Accuracy
            </div>
            <div className="text-4xl font-bold text-violet-400 font-mono">
              {avgAccuracy}
              <span className="text-2xl">%</span>
            </div>
          </div>
        </div>

        {/* "Under Construction" Placeholder */}
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-3xl group-hover:bg-cyan-500/10 transition-colors" />
          <div className="relative p-12 bg-slate-900/20 border border-white/5 rounded-3xl border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center">
              <span className="text-2xl animate-pulse">🛠️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Advanced Analytics
            </h3>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] max-w-xs mx-auto">
              currently under development coming soon!
            </p>
            <div className="mt-8 flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
