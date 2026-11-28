"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import api from "@/lib/axios";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      
      const { token, refreshToken, user } = response.data.data || response.data;

      localStorage.setItem("accessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(user));

      // Set cookie for Next.js middleware
      document.cookie = `accessToken=${token}; path=/; max-age=86400`;

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await api.post("/auth/google", { idToken });
      
      const { token, refreshToken, user } = response.data.data || response.data;

      localStorage.setItem("accessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(user));

      document.cookie = `accessToken=${token}; path=/; max-age=86400`;

      router.push("/");
    } catch (err: any) {
      console.error("GOOGLE LOGIN ERROR:", err);
      let errorMsg = err.response?.data?.message || err.message || "Failed to sign in with Google";
      
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(", ");
      }

      if (errorMsg.includes("User account not found")) {
        toast.error("User account not found. Please contact your administration.");
      } else {
        toast.error(errorMsg);
      }
      
      setError("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[980px] h-[540px] rounded-[32px] bg-white dark:bg-[#0c1322] shadow-[0_25px_70px_-15px_rgba(79,70,229,0.3)] border border-indigo-100/80 dark:border-slate-800 flex overflow-hidden">
      {/* =========================================================================
          LEFT SIDE: Vibrant Projected Organic Fluid Cloud with Login Form
         ========================================================================= */}
      <div className="relative w-full md:w-[50%] h-full z-20 flex flex-col justify-between p-6 sm:p-8 text-white overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#312e81]">
        {/* Soft Background Organic Circles (Matching Reference) */}
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full border-[18px] border-white/10" />
        <div className="pointer-events-none absolute left-6 bottom-20 h-16 w-16 rounded-full border-[10px] border-white/10" />
        <div className="pointer-events-none absolute right-10 top-12 h-20 w-20 rounded-full bg-white/5 blur-xl" />

        {/* ── Brand Header ── */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30 text-white font-black text-sm">
              F2
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">F2 CRM</span>
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white border border-white/30">
                ENTERPRISE
              </span>
            </div>
          </div>
        </div>

        {/* ── Welcome Heading ── */}
        <div className="relative z-10 my-auto py-1">
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white leading-tight">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs text-indigo-100/90 font-medium leading-relaxed">
            To keep connected with us please login with your official info
          </p>

          {/* ── Error Banner ── */}
          {error && (
            <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-red-500/20 border border-red-300/40 p-2 text-xs text-white">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-200 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* ── Form Inputs ── */}
          <form onSubmit={handleLogin} className="mt-3.5 space-y-2.5">
            {/* Email */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-200">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                placeholder="Official Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-full border border-white/25 bg-white/15 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-indigo-200/75 focus:bg-white/25 focus:border-white focus:ring-2 focus:ring-white/30 outline-none transition-all duration-150 backdrop-blur-md"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-200">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-full border border-white/25 bg-white/15 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-indigo-200/75 focus:bg-white/25 focus:border-white focus:ring-2 focus:ring-white/30 outline-none transition-all duration-150 backdrop-blur-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-indigo-200 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5 px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/40 bg-white/20 text-indigo-600 focus:ring-white"
                />
                <span className="text-[11px] font-medium text-indigo-100">
                  Remember me
                </span>
              </label>

              <span className="text-[10px] text-indigo-200 font-mono">
                Workstation Portal
              </span>
            </div>

            {/* SIGN IN Pill Button (Directly Matching Reference Button) */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-full border-2 border-white bg-transparent hover:bg-white hover:text-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>SIGN IN</span>
                )}
              </button>

              {/* Google Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
                </svg>
                <span>Google Workspace Sign In</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-indigo-200/80 font-medium text-center">
          256-bit SSL Encrypted • ISO 27001 Certified
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: Animated Projector + Magician / Enterprise Character Illustration
         ========================================================================= */}
      <div className="relative hidden md:flex md:w-[50%] h-full bg-[#f8faff] dark:bg-[#070b14] overflow-hidden items-center justify-center p-6">
        {/* Background Carnival / Ferris Wheel Sketched Outline (Matching Reference) */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20 dark:opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ferris Wheel Outline */}
          <circle cx="340" cy="180" r="140" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="340" cy="180" r="30" fill="none" stroke="#6366f1" strokeWidth="2" />
          <line x1="340" y1="40" x2="340" y2="320" stroke="#6366f1" strokeWidth="1.5" />
          <line x1="200" y1="180" x2="480" y2="180" stroke="#6366f1" strokeWidth="1.5" />
          <line x1="240" y1="80" x2="440" y2="280" stroke="#6366f1" strokeWidth="1.5" />
          <line x1="240" y1="280" x2="440" y2="80" stroke="#6366f1" strokeWidth="1.5" />
          {/* Circus Tent Outline */}
          <polygon points="340,180 270,360 410,360" fill="none" stroke="#a855f7" strokeWidth="1.5" />
        </svg>

        {/* ── Seamless Projector Beam Effect Connecting to Left Cloud ── */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-40 pointer-events-none z-10">
          <div className="w-full h-full bg-gradient-to-r from-transparent to-indigo-500/20 clip-path-beam" />
        </div>

        {/* ── Floating Animated Confetti & Golden Tickets (CSS Keyframe Floating) ── */}
        <div className="absolute top-12 left-28 animate-[bounce_3.5s_ease-in-out_infinite] rotate-12 bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded shadow-md z-10 border border-amber-300">
          ★ LEAD #101
        </div>
        <div className="absolute bottom-16 left-32 animate-[bounce_4.2s_ease-in-out_infinite] -rotate-12 bg-indigo-500 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow-md z-10">
          ₹ APPROVED
        </div>
        <div className="absolute top-20 right-16 animate-[bounce_3s_ease-in-out_infinite] rotate-45 text-amber-400 text-lg">
          ✦
        </div>
        <div className="absolute bottom-24 right-20 animate-[bounce_3.8s_ease-in-out_infinite] -rotate-12 bg-violet-500 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm z-10">
          7-DAY LOCK
        </div>

        {/* ── Main Illustration: Projector on Tripod + Magician Executive Character ── */}
        <div className="relative z-10 w-full max-w-[420px] flex items-center justify-center">
          <svg viewBox="0 0 460 380" className="w-full h-auto drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
            {/* ── PROJECTOR CAMERA ON TRIPOD ── */}
            <g transform="translate(60, 140)">
              {/* Tripod Legs */}
              <line x1="60" y1="75" x2="10" y2="200" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
              <line x1="60" y1="75" x2="60" y2="205" stroke="#334155" strokeWidth="5.5" strokeLinecap="round" />
              <line x1="60" y1="75" x2="110" y2="200" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
              <circle cx="60" cy="75" r="7" fill="#6366f1" />

              {/* Projector Body */}
              <rect x="15" y="25" width="85" height="50" rx="14" fill="#0f172a" stroke="#6366f1" strokeWidth="2.5" />
              <rect x="25" y="35" width="65" height="30" rx="8" fill="#1e1b4b" />

              {/* Glowing Projector Lens with Pulse */}
              <ellipse cx="10" cy="50" rx="10" ry="16" fill="#4f46e5" stroke="#818cf8" strokeWidth="2" />
              <ellipse cx="6" cy="50" rx="5" ry="11" fill="#c7d2fe" />

              {/* Projector Details / Dials */}
              <circle cx="45" cy="50" r="7" fill="#f59e0b" />
              <circle cx="68" cy="50" r="7" fill="#f59e0b" />
              <circle cx="45" cy="50" r="3" fill="#ffffff" />
              <circle cx="68" cy="50" r="3" fill="#ffffff" />

              {/* Dual Spinning Film Reels on Top (Animated Spin) */}
              <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: "35px 5px" }}>
                <circle cx="35" cy="5" r="22" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
                <circle cx="35" cy="5" r="16" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeDasharray="5 5" />
                <circle cx="35" cy="5" r="5" fill="#0f172a" />
              </g>
              <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: "85px 5px" }}>
                <circle cx="85" cy="5" r="22" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
                <circle cx="85" cy="5" r="16" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeDasharray="5 5" />
                <circle cx="85" cy="5" r="5" fill="#0f172a" />
              </g>

              {/* Glowing Projector Beam Rays going into Left Cloud */}
              <polygon points="0,50 -70,10 -70,90" fill="url(#beamGradient)" opacity="0.45" />
            </g>

            {/* ── MAGICIAN / RINGMASTER ENTERPRISE CHARACTER (Matching Reference) ── */}
            <g transform="translate(220, 60)">
              {/* Magician Cape (Teal/Cyan inner lining like reference) */}
              <path d="M 60 120 Q 20 180 30 250 Q 80 230 110 240 Q 140 180 100 120 Z" fill="#06b6d4" opacity="0.85" />

              {/* Suit Body / Tailcoat (Vibrant Magenta-Indigo matching reference) */}
              <path d="M 60 110 L 40 235 L 75 230 L 115 235 L 95 110 Z" fill="#4f46e5" />
              <path d="M 40 235 L 30 275 L 60 230 Z" fill="#3730a3" />
              <path d="M 115 235 L 125 275 L 95 230 Z" fill="#3730a3" />

              {/* White Shirt / Vest */}
              <polygon points="68,110 88,110 84,185 72,185" fill="#ffffff" />
              <circle cx="78" cy="135" r="2" fill="#f59e0b" />
              <circle cx="78" cy="150" r="2" fill="#f59e0b" />
              <circle cx="78" cy="165" r="2" fill="#f59e0b" />

              {/* Yellow Shoulder Epaulets (Reference Match) */}
              <ellipse cx="58" cy="112" rx="10" ry="5" fill="#f59e0b" />
              <ellipse cx="98" cy="112" rx="10" ry="5" fill="#f59e0b" />

              {/* Legs (Trousers) */}
              <path d="M 62 230 L 50 310 L 64 310 L 76 230 Z" fill="#4338ca" />
              <path d="M 80 230 L 98 300 L 112 295 L 92 230 Z" fill="#4338ca" />

              {/* Shoes (Pointed dress shoes) */}
              <ellipse cx="50" cy="314" rx="14" ry="6" fill="#1e1b4b" />
              <ellipse cx="110" cy="300" rx="14" ry="6" fill="#1e1b4b" />

              {/* Left Arm Raising Wand (Pointing to Projector) */}
              <path d="M 60 115 L 20 65 L 10 70" fill="none" stroke="#4f46e5" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="70" r="6" fill="#fbcfe8" />
              {/* Magic Wand */}
              <line x1="20" y1="85" x2="-25" y2="45" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <circle cx="-25" cy="45" r="5" fill="#fef08a" />
              <circle cx="-25" cy="45" r="8" fill="#fde047" opacity="0.4" className="animate-ping" />

              {/* Right Arm Holding Striped Cane */}
              <path d="M 98 115 L 135 150 L 140 180" fill="none" stroke="#4f46e5" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="140" cy="180" r="6" fill="#fbcfe8" />
              {/* Striped Circus Cane */}
              <line x1="145" y1="110" x2="140" y2="280" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 8" />

              {/* Neck & Head */}
              <rect x="73" y="96" width="10" height="15" fill="#fbcfe8" />
              <circle cx="78" cy="80" r="16" fill="#fbcfe8" />

              {/* Face Details: Moustache & Smile (Exact Reference Match) */}
              <path d="M 68 85 Q 78 80 88 85 Q 85 92 78 87 Q 71 92 68 85 Z" fill="#0f172a" />
              <circle cx="73" cy="76" r="2" fill="#0f172a" />
              <circle cx="83" cy="76" r="2" fill="#0f172a" />

              {/* Hair */}
              <path d="M 64 78 Q 62 65 78 65 Q 94 65 92 78" fill="#0f172a" />

              {/* Magician Top Hat with Purple Ribbon (Reference Match) */}
              <ellipse cx="94" cy="50" rx="16" ry="6" fill="#0f172a" transform="rotate(25 94 50)" />
              <rect x="85" y="18" width="18" height="28" rx="3" fill="#0f172a" transform="rotate(25 94 30)" />
              <rect x="87" y="34" width="18" height="6" fill="#818cf8" transform="rotate(25 94 30)" />

              {/* Floating Film Clapperboard */}
              <g transform="translate(100, 75) rotate(-18)">
                <rect x="0" y="0" width="28" height="22" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="0" y="0" width="28" height="7" fill="#ef4444" />
                <line x1="7" y1="0" x2="2" y2="7" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="15" y1="0" x2="10" y2="7" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="23" y1="0" x2="18" y2="7" stroke="#ffffff" strokeWidth="1.5" />
              </g>

              {/* Floating Spinning Film Reel in Hand */}
              <g transform="translate(80, 195) rotate(15)" className="animate-[spin_6s_linear_infinite]">
                <circle cx="20" cy="20" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
                <circle cx="20" cy="20" r="12" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="20" cy="20" r="4" fill="#0f172a" />
              </g>
            </g>

            {/* Gradient definition for projector beam */}
            <defs>
              <linearGradient id="beamGradient" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
