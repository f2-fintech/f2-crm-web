"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import api from "@/lib/axios";

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

      // Also set a cookie so Next.js middleware knows the user is logged in
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
      
      // If the error message is an array (e.g. class-validator), join it
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(", ");
      }

      if (errorMsg.includes("User account not found")) {
        toast.error("User not found. Please contact your administration.");
      } else {
        toast.error(errorMsg);
      }
      
      // Clear the main form error just in case
      setError("");
    } finally {
      setLoading(false);
    }
  };

  return (    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="mb-10 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white shadow-md">
            F2
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              F2 CRM
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Secure CRM Portal
            </p>
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sign in with your official account to continue.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="space-y-6"
      >
        {/* Email */}
        <div>
          <Label>
            Official Email
            <span className="ml-1 text-error-500">*</span>
          </Label>

          <Input
            type="email"
            placeholder="name@f2fintech.in"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>
              Password
              <span className="ml-1 text-error-500">*</span>
            </Label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500" />
              ) : (
                <EyeCloseIcon className="fill-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={rememberMe}
              onChange={setRememberMe}
            />

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Remember me
            </span>
          </div>
        </div>

        {/* Login Button */}
        <Button
          className="w-full"
          size="md"
          disabled={loading}
        >
          {loading
            ? "Signing In..."
            : "Login to Dashboard"}
        </Button>

        <div className="relative flex items-center justify-center py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative bg-white dark:bg-gray-900 px-4 text-sm text-gray-500">
            Or continue with
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </form>
    </div>
  );
}