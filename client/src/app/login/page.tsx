"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeText, setWelcomeText] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

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
    if (!email || !password) {
      setMessage("⚠️ Please enter both email and password");
      return;
    }

    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Success! Redirecting...");
      router.push("/lessons");
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setMessage("⚠️ Please enter both email and password to create account");
      return;
    }

    if (password.length < 6) {
      setMessage("⚠️ Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setMessage("");

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
      console.error("Sign-up error:", error);
      setMessage(
        `❌ ${error.message}\n\n💡 You can still use the app as a guest!`,
      );
    } else {
      setMessage("✅ Account created! Check your email for confirmation.");
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (mode === "signin") {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  const handleGuestMode = () => {
    router.push("/lessons");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden selection:bg-cyan-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
        {hangulChars.map((char, index) => (
          <div
            key={index}
            className={`absolute font-bold pointer-events-none
              ${index % 2 === 0 ? "animate-float-slow" : "animate-float-fast"}
              ${index % 3 === 0 ? "text-cyan-500/20" : "text-emerald-500/20"}`}
            style={{
              left: `${(index * 7) % 100}%`,
              top: `${(index * 13) % 100}%`,
              fontSize: `${Math.max(24, (index * 12) % 80)}px`,
              animationDelay: `${index * 1.5}s`,
            }}
          >
            {char}
          </div>
        ))}
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none z-1" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none z-1" />

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
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

        <div className="flex gap-2 p-1 bg-slate-950/50 rounded-lg mb-6">
          <button
            onClick={() => {
              setMode("signin");
              setMessage("");
            }}
            className={`flex-1 px-4 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "signin"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            className={`flex-1 px-4 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "signup"
                ? "bg-emerald-500 text-slate-950"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-slate-950/50 border border-slate-700">
            <p className="text-xs text-slate-300 font-mono whitespace-pre-line">
              {message}
            </p>
          </div>
        )}

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

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg font-bold text-sm font-mono tracking-wide shadow-lg disabled:opacity-50 transition-all duration-200 ${
              mode === "signin"
                ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            }`}
          >
            {loading
              ? "PROCESSING..."
              : mode === "signin"
                ? "ACCESS_SYSTEM"
                : "CREATE_ACCOUNT"}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900/60 px-2 text-slate-600 font-mono">
                NO ACCOUNT NEEDED
              </span>
            </div>
          </div>

          <button
            onClick={handleGuestMode}
            className="w-full px-4 py-3 rounded-lg font-bold text-sm font-mono tracking-wide bg-transparent border border-yellow-500/20 text-yellow-500/70 hover:border-yellow-500/40 hover:text-yellow-400 transition-all"
          >
            CONTINUE_AS_GUEST →
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
          <p className="text-xs text-slate-500 font-mono text-center">
            💡 Guest mode: Practice freely. Progress won't be saved.
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 text-slate-700 font-mono text-[10px] tracking-widest opacity-50">
        HANGUL_TYPE_OS v2.0.5 • SECURE_ENCRYPTION_ACTIVE
      </div>
    </div>
  );
}
