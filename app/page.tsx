"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { DarkModeToggle } from "./ThemeContext";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelectPictures = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleCheck = () => {
    if (selectedFiles.length === 0) {
      alert("Please select or drop pictures first.");
      return;
    }
    alert(`Checking ${selectedFiles.length} file(s)...`);
  };

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] transition-colors duration-300 bg-[var(--color-bg-page)] dark:bg-[#0F172A] text-[var(--color-dark-blue)] dark:text-[#E2E8F0]">
      {/* ─── Header / Navbar ─── */}
      <header className="flex items-center justify-between py-1 px-3 md:px-4 transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B]">
        {/* Hamburger menu - mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 transition-all duration-300 bg-[var(--color-dark-blue)] dark:bg-[#93C5FD] ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 transition-all duration-300 bg-[var(--color-dark-blue)] dark:bg-[#93C5FD] ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 transition-all duration-300 bg-[var(--color-dark-blue)] dark:bg-[#93C5FD] ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

        {/* Logo */}
        <span className="ml-2 text-2xl md:text-4xl font-[family-name:var(--font-pacifico)] flex-1 text-center md:text-left text-[var(--color-dark-blue)] dark:text-[#93C5FD]">
          NavDrishti
        </span>

        {/* Nav links - desktop */}
        <div className="flex-1 hidden md:block">
          <nav className="flex gap-16 font-semibold text-lg justify-between text-[var(--color-dark-blue)] dark:text-[#CBD5E1]">
            <a href="#" className="hover:opacity-70 transition-opacity">Home</a>
            <a href="#" className="hover:opacity-70 transition-opacity">About Us</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Contact</a>
          </nav>
        </div>

        {/* Sign Up button */}
        <div className="flex-none md:flex-1 flex justify-end">
          <Link href="/Signup" className="bg-[var(--color-primary-blue)] text-white px-2 py-1 mr-1 md:mr-2 rounded-lg text-sm md:text-base hover:brightness-110 transition-all cursor-pointer">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <div className="md:hidden transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B]">
          <nav className="flex flex-col items-center gap-4 py-4 font-semibold text-base text-[var(--color-dark-blue)] dark:text-[#CBD5E1]">
            <a href="#" className="hover:opacity-70 transition-opacity" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#" className="hover:opacity-70 transition-opacity" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="#" className="hover:opacity-70 transition-opacity" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
        </div>
      )}

      {/* ─── Main content ─── */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 px-4 md:px-0 py-6 md:py-0">
        <p className="text-base md:text-xl font-medium text-center text-[var(--color-dark-blue)] dark:text-[#CBD5E1]">
          Some random line conveying what the project does
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            w-full max-w-sm md:max-w-4xl rounded-[1.5rem] md:rounded-[2rem] px-6 md:px-20 min-h-[350px] md:min-h-[520px]
            border-[3px] border-dashed flex flex-col items-center justify-center gap-3
            transition-all duration-200
            bg-[var(--color-light-blue)] dark:bg-[#1E293B]
            ${isDragging
              ? "border-[var(--color-primary-blue)] scale-[1.02] shadow-lg"
              : "border-[var(--color-border-dashed)] dark:border-[#475569]"
            }
          `}
        >
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />

          <button
            onClick={handleSelectPictures}
            className="bg-[var(--color-primary-blue)] text-white px-8 py-4 md:px-16 md:py-6 rounded-2xl md:rounded-3xl font-semibold text-lg md:text-2xl hover:brightness-110 transition-all cursor-pointer"
          >
            Select Pictures
          </button>

          <p className="text-sm mt-1 text-[var(--color-dark-blue)] dark:text-[#94A3B8]">
            or drag and drop here
          </p>

          {selectedFiles.length > 0 && (
            <p className="text-[var(--color-primary-blue)] text-sm font-medium mt-2">
              {selectedFiles.length} file(s) selected
            </p>
          )}
        </div>

        <button
          onClick={handleCheck}
          className="bg-[var(--color-primary-blue)] text-white px-8 py-2.5 md:px-10 md:py-3 rounded-full font-semibold text-base md:text-lg shadow-md hover:brightness-110 hover:shadow-lg transition-all cursor-pointer"
        >
          Check
        </button>
      </main>

      <DarkModeToggle />
    </div>
  );
}