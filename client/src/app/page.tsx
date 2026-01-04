// src/app/page.tsx
'use client'

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [welcomeText, setWelcomeText] = useState('')
  const fullMessage = "SYSTEM_INITIALIZED: READY_TO_Type_KOREAN..."
  
  // Reuse the Hangul Rain characters
  const hangulChars = ['한', '글', '형', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ'];
  const rainDrops = Array.from({ length: 30 });

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setWelcomeText(fullMessage.slice(0, i))
      i++
      if (i > fullMessage.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      
      {/* 1. Background Data Rain */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        {rainDrops.map((_, index) => (
          <div
            key={index}
            className={`absolute font-bold animate-float-slow text-cyan-500/20`}
            style={{
              left: `${(index * 7) % 100}%`,
              top: `${(index * 13) % 100}%`,
              fontSize: `${Math.max(24, (index * 15) % 100)}px`,
              animationDelay: `${index * 1.2}s`,
            }}
          >
            {hangulChars[index % hangulChars.length]}
          </div>
        ))}
      </div>

      {/* 2. Hero Section */}
      <div className="relative z-10 text-center space-y-8 px-6">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono tracking-widest uppercase">
            {welcomeText}<span className="inline-block w-1.5 h-3 ml-1 bg-cyan-500 animate-pulse" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter">
            HANGUL<span className="text-cyan-400">_TYPE</span>
          </h1>
          
          <p className="text-slate-500 font-mono text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Master the Korean keyboard through immersive, interactive typing practice.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/lessons"
            className="group relative px-10 py-4 bg-cyan-500 text-slate-950 rounded-xl font-bold text-lg transition-all hover:bg-cyan-400 hover:-translate-y-1 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <span className="font-mono mr-2 opacity-50"></span>
            Start Lessons
          </Link>
          
          <Link
            href="/login"
            className="px-10 py-4 border border-slate-800 text-slate-400 rounded-xl font-bold text-lg hover:border-slate-600 hover:text-white transition-all font-mono"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* cool footer display */}
      <div className="absolute bottom-12 flex gap-12 text-[10px] font-mono text-slate-700 uppercase tracking-widest">
        <div>Status: <span className="text-emerald-500">Stable</span></div>
        <div>Version: <span className="text-slate-400">2.0.5</span></div>
      </div>
    </main>
  );
}