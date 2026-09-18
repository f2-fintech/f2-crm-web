"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import api from "@/lib/axios";

export function SignInFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

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

      router.push(redirectTo);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials or server error");
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
      </form>
    </div>
  );
}

export default function SignInForm() {
  return (
    <Suspense fallback={<div />}>
      <SignInFormInner />
    </Suspense>
  );
}