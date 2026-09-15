"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = "/";
  };

  if (loading) return <div className="w-10 h-10 md:w-12 md:h-12 animate-pulse bg-[var(--color-light-blue)] dark:bg-[#334155] rounded-full border border-gray-200 dark:border-gray-700"></div>;

  if (!user) {
    return (
      <Link href="/Signup" className="bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg text-sm md:text-base hover:brightness-110 transition-all font-medium shadow-sm">
        Sign Up
      </Link>
    );
  }

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--color-primary-blue)] text-white font-bold text-lg md:text-xl flex items-center justify-center hover:brightness-110 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-blue)] dark:focus:ring-offset-[#1E293B]"
      >
        {initials}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-3 z-50 transform origin-top-right transition-all">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors">
            Dashboard
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full text-left block px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
