// src/app/lessons/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lesson } from "@/types/lesson";
import { createClient } from "@/utils/supabase/client";

export default function LessonsPage() {
  const supabase = createClient();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- Data State ---
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // --- Auth & Data Fetch ---
  useEffect(() => {
    setMounted(true);

    async function initData() {
      try {
        setIsLoading(true);

        // 1. Fetch Curriculum
        const res = await fetch(`${API_URL}/lessons`);
        if (!res.ok) throw new Error("Failed to fetch curriculum");
        const dbData = await res.json();

        const formatted: Lesson[] = dbData.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          phase: row.phase,
          unit: row.unit,
          lessonNumber: row.lesson_number,
          difficulty: row.difficulty,
          ...row.content_json,
        }));
        setLessons(formatted);

        // 2. Fetch User Progress
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const progressRes = await fetch(
            `${API_URL}/user/progress/${user.id}`,
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setCompletedLessons(progressData.completed_lessons);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Could not load data.");
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, [supabase.auth]);

  // --- Logout Logic ---
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // --- Helper Functions ---
  const isLessonCompleted = (lesson: Lesson) =>
    completedLessons.includes(lesson.id);
  const progressPercentage =
    lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0;

  const getDifficultyBadge = (difficulty: number) => {
    const labels: Record<number, string> = {
      1: "Beginner",
      2: "Easy",
      3: "Medium",
      4: "Hard",
      5: "Expert",
    };
    const styles: Record<number, string> = {
      1: "border-emerald-500/30 text-emerald-400",
      2: "border-cyan-500/30 text-cyan-400",
      3: "border-yellow-500/30 text-yellow-400",
      4: "border-orange-500/30 text-orange-400",
      5: "border-red-500/30 text-red-400",
    };
    return {
      style: styles[difficulty] || "border-slate-700 text-slate-400",
      label: labels[difficulty] || "Unknown",
    };
  };

  // --- Grouping Logic ---
  const phaseGroups = useMemo(() => {
    return {
      foundation: lessons.filter((l) => l.phase === "foundation"),
      syllables: lessons.filter((l) => l.phase === "syllables"),
      words: lessons.filter((l) => l.phase === "words"),
      sentences: lessons.filter((l) => l.phase === "sentences"),
      advanced: lessons.filter((l) => l.phase === "advanced"),
    };
  }, [lessons]);

  const phaseConfig = [
    {
      key: "foundation",
      title: "Foundation",
      description: "Master the basic jamo",
      number: 1,
    },
    {
      key: "syllables",
      title: "Syllables",
      description: "Combine jamo into blocks",
      number: 2,
    },
    {
      key: "words",
      title: "Words",
      description: "Real vocabulary practice",
      number: 3,
    },
    {
      key: "sentences",
      title: "Sentences",
      description: "Full sentence flow",
      number: 4,
    },
    {
      key: "advanced",
      title: "Advanced",
      description: "Complex paragraphs",
      number: 5,
    },
  ];

  // --- Loading State ---
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-xl font-mono font-bold text-cyan-400 animate-pulse tracking-widest">
          LOADING CURRICULUM...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="p-8 rounded-xl border border-red-500/30 text-red-400 bg-red-950/10 backdrop-blur-md">
          <h2 className="text-lg font-bold mb-2">Connection Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
      <main className="max-w-6xl mx-auto px-6 pt-12">
        {/* Header & User Control Hub */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">
              HANGUL<span className="text-cyan-400">_TYPE</span>
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
              Mission_Select // Choose your module
            </p>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 font-mono text-xs font-bold uppercase tracking-wider hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-sm"
            >
              My Stats
            </Link>

            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-500 font-mono text-xs font-bold uppercase tracking-wider hover:text-rose-400 hover:border-rose-500/30 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Global Progress Section */}
        <section className="rounded-2xl p-8 mb-16 relative overflow-hidden border border-white/5 bg-slate-900/50 backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">
                Overall Progress
              </h2>
              <p className="text-slate-400 text-sm font-mono">
                {completedLessons.length} / {lessons.length} MODULES_COMPLETE
              </p>
            </div>
            <span className="text-3xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 relative z-10 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.6)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </section>

        {/* Phase List */}
        <div className="space-y-20">
          {phaseConfig.map((phase) => {
            const groupLessons =
              phaseGroups[phase.key as keyof typeof phaseGroups];
            if (groupLessons.length === 0) return null;

            return (
              <div
                key={phase.key}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700"
              >
                {/* Phase Title */}
                <div className="flex items-center gap-4 mb-8 border-l-2 border-cyan-500/30 pl-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-200">
                      {phase.title}
                    </h2>
                    <p className="text-slate-500 text-sm font-mono tracking-wide">
                      {phase.description.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Lesson Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupLessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson);
                    const badge = getDifficultyBadge(lesson.difficulty);

                    return (
                      <Link
                        key={lesson.id}
                        href={`/practice?lesson=${lesson.id}`}
                        className={`
                          group relative p-6 rounded-xl border transition-all duration-300
                          ${
                            completed
                              ? "bg-emerald-950/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                              : "bg-slate-900/40 border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.1)] backdrop-blur-md"
                          }
                        `}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span
                            className={`font-mono text-[10px] tracking-widest ${completed ? "text-emerald-500" : "text-slate-500 group-hover:text-cyan-400"}`}
                          >
                            ID: {lesson.id}
                          </span>
                          {completed && (
                            <span className="text-emerald-400 text-lg shadow-emerald-500/50 drop-shadow-sm">
                              ✓
                            </span>
                          )}
                        </div>

                        <h3
                          className={`font-bold mb-2 text-lg ${completed ? "text-emerald-100" : "text-slate-200 group-hover:text-white"}`}
                        >
                          {lesson.title}
                        </h3>

                        <p className="text-xs text-slate-400 mb-6 line-clamp-2 leading-relaxed h-8">
                          {lesson.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badge.style}`}
                          >
                            {badge.label.toUpperCase()}
                          </div>

                          {!completed && (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 text-xs font-mono font-bold tracking-tight">
                              START_SESSION →
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* FUTURE SECTORS: 10 Cards */}
          <div className="mt-24 opacity-60 hover:opacity-100 transition-opacity duration-700 animate-in fade-in slide-in-from-bottom-12">
            <div className="flex items-center gap-4 mb-8 border-l-2 border-slate-800 pl-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-500 italic">
                  Future Sectors
                </h2>
                <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                  Upcoming_Curriculum // Phase_02_Expansion
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
              {/* --- ROW 1: WORDS --- */}
              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Essential Words (1)
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  CORE_NOUNS
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Essential Words (2)
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  PEOPLE_&_PLACES
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Numbers & Time
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  COUNTING_SYSTEMS
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Food & Cafe
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  ORDERING_ESSENTIALS
                </p>
              </div>

              {/* --- ROW 2: SENTENCES --- */}
              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Common Greetings
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  SOCIAL_BASICS
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Simple Questions
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  INTERROGATIVE_FLOW
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Travel Phrases
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  TRANSIT_SURVIVAL
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m-5 10h.01M9 16h.01M9 20h.01M15 16h.01M15 20h.01M15 12h.01M15 8h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Seoul: City Life
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  METROPOLITAN_DATA
                </p>
              </div>

              {/* --- ROW 3: CITIES --- */}
              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Jeju: Island Life
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  PROVINCIAL_DATA
                </p>
              </div>

              <div className="p-6 rounded-xl border border-white/5 border-dashed bg-slate-900/10 flex flex-col justify-center items-center text-center group cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4 text-slate-700 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-tight group-hover:text-slate-400">
                  Busan: Port Life
                </h3>
                <p className="text-slate-700 font-mono text-[10px]">
                  MARITIME_DATA
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
