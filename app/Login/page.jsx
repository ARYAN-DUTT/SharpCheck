"use client";

import { useState } from "react";
import Link from "next/link";
import { DarkModeToggle } from "../ThemeContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to home page after successful login
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] overflow-hidden transition-colors duration-300 bg-white dark:bg-[#0F172A]">
      <div className="relative w-full flex justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] md:w-[120%] h-[35vh] rounded-b-[50%] transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B]" />
        <div className="relative z-10 flex flex-col items-center pt-8 pb-16 md:pt-12 md:pb-24">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NavDrishti Logo" className="w-16 h-12 md:w-24 md:h-18 object-contain" />
            <span className="text-4xl md:text-6xl font-[family-name:var(--font-pacifico)] text-[var(--color-primary-blue)] dark:text-[#93C5FD]">
              NavDrishti
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4 -mt-4 md:-mt-8 relative z-20">
        <div className="w-full max-w-xl rounded-3xl px-8 py-10 md:px-12 md:py-12 border-[3px] border-dashed transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B] border-[var(--color-border-dashed)] dark:border-[#475569]">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-[var(--color-primary-blue)] dark:text-[#93C5FD]">
            Welcome Back
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[var(--color-dark-blue)] dark:text-[#CBD5E1]">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all bg-white dark:bg-[#0F172A] text-[var(--color-dark-blue)] dark:text-[#E2E8F0]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-dark-blue)] dark:text-[#CBD5E1]">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all bg-white dark:bg-[#0F172A] text-[var(--color-dark-blue)] dark:text-[#E2E8F0] dark:placeholder-[#475569]" />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[var(--color-primary-blue)] text-white py-3 rounded-xl font-semibold text-lg hover:brightness-110 transition-all cursor-pointer mt-2 disabled:opacity-50">
              {loading ? "Logging In..." : "Log In"}
            </button>
            {error && <p className="text-red-500 text-sm text-center font-medium mt-1">{error}</p>}
          </form>

          <p className="text-center text-sm mt-6 text-[var(--color-dark-blue)] dark:text-[#94A3B8]">
            Don&apos;t have an account?{" "}
            <Link href="/Signup" className="text-[var(--color-primary-blue)] font-semibold underline hover:opacity-80 transition-opacity">Sign up</Link>
          </p>
        </div>
      </div>

      <div className="flex-1" />
      <DarkModeToggle />
    </div>
  );
}
