"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeText, setWelcomeText] = useState("");

  const router = useRouter();
  const supabase = createClient();

  // Character pool for the background
  const hangulChars = [
    "한",
    "글",
    "형",
    "ㄱ",
    "ㄴ",
    "ㄷ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅅ",
    "ㅇ",
    "ㅈ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
    "ㅏ",
    "ㅑ",
    "ㅓ",
    "ㅕ",
    "ㅗ",
    "ㅛ",
    "ㅜ",
    "ㅠ",
    "ㅡ",
    "ㅣ",
  ];

  const fullMessage = "SYSTEM_READY: ENCODING_HANGUL_CURRICULUM...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setWelcomeText(fullMessage.slice(0, i));
      i++;
      if (i > fullMessage.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else {
      router.push("/lessons");
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          username: email.split("@")[0],
        },
      },
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for confirmation!");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden selection:bg-cyan-500/30">
      {/* HANGUL RAIN */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
        {/* Generate multiple floating characters */}
        {hangulChars.map((char, index) => (
          <div
            key={index}
            className={`absolute font-bold pointer-events-none 
              ${index % 2 === 0 ? "animate-float-slow" : "animate-float-fast"}
              ${index % 3 === 0 ? "text-cyan-500/20" : "text-emerald-500/20"}`}
            style={{
              left: `${(index * 7) % 100}%`, // Spread across the width
              top: `${(index * 13) % 100}%`, // Randomish starting heights
              fontSize: `${Math.max(24, (index * 12) % 80)}px`, // Variable sizes
              animationDelay: `${index * 1.5}s`, // Stagger the starts
            }}
          >
            {char}
          </div>
        ))}
      </div>

      {/* 2. Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none z-1" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none z-1" />

      {/* 3. The Glass Terminal Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-block mb-3 px-3 py-1 rounded-full border border-slate-700 bg-slate-950/50">
            <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
              ● {loading ? "AUTHENTICATING..." : "SYSTEM_READY"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white mb-2">
            HANGUL<span className="text-cyan-400">_TYPE</span>
          </h1>
          <div className="h-4 flex items-center justify-center">
            <p className="text-slate-400 font-mono text-[10px] tracking-wider">
              {welcomeText}
            </p>
            <span className="inline-block w-1.5 h-3 ml-1 bg-cyan-500 animate-pulse" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-cyan-400 ml-1 uppercase">
              usr_email
            </label>
            <input
              type="email"
              placeholder="IDENTIFIER@DOMAIN.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-800 font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all uppercase"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-cyan-400 ml-1 uppercase">
              pass_key
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-800 font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-bold text-sm font-mono tracking-wide bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 transition-all duration-200"
          >
            {loading ? "INITIALIZING..." : "ACCESS_SYSTEM"}
          </button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900/60 px-2 text-slate-600 font-mono">
                OR
              </span>
            </div>
          </div>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-bold text-sm font-mono tracking-wide bg-transparent border border-slate-800 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
          >
            CREATE_NEW_ID
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 text-slate-700 font-mono text-[10px] tracking-widest opacity-50">
        HANGUL_TYPE_OS v2.0.5 • SECURE_ENCRYPTION_ACTIVE
      </div>
    </div>
  );
}
