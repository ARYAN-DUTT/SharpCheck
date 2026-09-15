"use client";

import { useRef, useState, useEffect, useCallback, type DragEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DarkModeToggle } from "./ThemeContext";
import UserMenu from "@/components/UserMenu";
import BoxAnimation from "./BoxAnimation";
import "./box-animation.css";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Package animation
  // Box animation state — plays on every page refresh
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    setShowAnimation(false);
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.reload();
  };

  const handleSelectPictures = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
      setError(null);
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
      setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files as FileList)]);
      setError(null);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          }, 'image/jpeg', 0.8);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleCheck = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select or drop pictures first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        try {
          const compressed = await compressImage(file);
          formData.append('images', compressed);
        } catch (e) {
          console.error("Compression failed, using original file", e);
          formData.append('images', file);
        }
      }

      const response = await fetch('/api/check-compliance', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(!response.ok ? text || 'Server Error' : 'Invalid JSON from server');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to check compliance');
      }

      router.push(`/report/${data.report.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {showAnimation && <BoxAnimation onComplete={handleAnimationComplete} />}
      <div className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] transition-colors duration-300 bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-light-blue)] dark:from-[#0F172A] dark:to-[#1E293B] text-[var(--color-dark-blue)] dark:text-[#E2E8F0]">
        <header className="flex items-center justify-between py-4 md:py-5 px-4 md:px-8 transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B] shadow-sm">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 transition-all duration-300 bg-[var(--color-dark-blue)] dark:bg-[#93C5FD] ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 transition-all duration-300 bg-[var(--color-dark-blue)] dark:bg-[#93C5FD] ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 transition-all duration-300 bg-[var(--color-dark-blue)] dark:bg-[#93C5FD] ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

          <span className="ml-2 text-2xl md:text-4xl font-[family-name:var(--font-pacifico)] flex-1 text-center md:text-left text-[var(--color-dark-blue)] dark:text-[#93C5FD]">
            NavDrishti
          </span>

          <div className="flex-1 hidden lg:flex justify-center">
            <nav className="flex gap-4 xl:gap-8 font-semibold text-base xl:text-lg text-[var(--color-dark-blue)] dark:text-[#CBD5E1]">
              <Link href="/" className="hover:opacity-70 transition-opacity whitespace-nowrap">Home</Link>
              <Link href="/about" className="hover:opacity-70 transition-opacity whitespace-nowrap">About Us</Link>
              <Link href="/contact" className="hover:opacity-70 transition-opacity whitespace-nowrap">Contact</Link>
              <Link href="/privacy" className="hover:opacity-70 transition-opacity whitespace-nowrap">Privacy Policy</Link>
            </nav>
          </div>

          <div className="flex-none md:flex-1 flex justify-end gap-2 items-center">
            {user && (
              <Link href="/dashboard" className="hidden md:inline-block bg-[var(--color-light-blue)] text-[var(--color-dark-blue)] border-2 border-[var(--color-primary-blue)] px-3 py-1.5 mr-2 rounded-lg text-sm md:text-base hover:bg-[var(--color-primary-blue)] hover:text-white transition-all cursor-pointer font-medium shadow-sm">
                Dashboard
              </Link>
            )}
            <UserMenu />
          </div>
        </header>

        {menuOpen && (
          <div className="lg:hidden transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B]">
            <nav className="flex flex-col items-center gap-4 py-4 font-semibold text-base text-[var(--color-dark-blue)] dark:text-[#CBD5E1]">
              <Link href="/" className="hover:opacity-70 transition-opacity" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/about" className="hover:opacity-70 transition-opacity" onClick={() => setMenuOpen(false)}>About Us</Link>
              <Link href="/contact" className="hover:opacity-70 transition-opacity" onClick={() => setMenuOpen(false)}>Contact</Link>
              <Link href="/privacy" className="hover:opacity-70 transition-opacity" onClick={() => setMenuOpen(false)}>Privacy Policy</Link>
            </nav>
          </div>
        )}

        <main className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 px-4 md:px-0 py-6 md:py-0">
          <p className="text-xl md:text-4xl font-medium text-center text-[var(--color-dark-blue)] dark:text-[#CBD5E1] max-w-3xl ">
            {user ? `Welcome, ${user.name}` : "Check the Label. Know the Truth."}
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
            w-full max-w-[95%] md:max-w-4xl rounded-[1.5rem] md:rounded-[2rem] px-4 md:px-20 py-8 md:py-12 min-h-[280px] md:min-h-[520px]
            border-[3px] border-dashed flex flex-col items-center justify-center gap-4 md:gap-6
            transition-all duration-200
            bg-[var(--color-light-blue)] dark:bg-[#1E293B]
            ${isDragging
                ? "border-[var(--color-primary-blue)] scale-[1.02] shadow-lg"
                : "border-[var(--color-border-dashed)] dark:border-[#475569]"
              }
          `}
          >
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

            <div className="flex flex-col sm:flex-row gap-3 md:gap-6 w-full sm:w-auto px-4 sm:px-0">
              <button
                onClick={handleCameraCapture}
                className="md:hidden flex-1 flex items-center justify-center gap-2 bg-white text-[var(--color-primary-blue)] border-2 border-[var(--color-primary-blue)] px-6 py-3.5 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-xl hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Take Photo
              </button>
              <button
                onClick={handleSelectPictures}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary-blue)] text-white px-6 py-3.5 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-xl hover:brightness-110 transition-all cursor-pointer shadow-sm"
              >
                <svg className="md:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="md:hidden">Gallery</span>
                <span className="hidden md:inline">Select Pictures</span>
              </button>
            </div>

            <p className="text-sm mt-2 text-[var(--color-dark-blue)] dark:text-[#94A3B8]">
              or drag and drop here
            </p>

            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-3 mt-2">
                <p className="text-[var(--color-primary-blue)] text-sm font-medium">
                  {selectedFiles.length} file(s) selected
                </p>
                <button onClick={(e) => { e.stopPropagation(); setSelectedFiles([]); }} className="text-red-500 text-sm font-semibold hover:underline">
                  Clear
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleCheck}
            disabled={loading}
            className="bg-[var(--color-primary-blue)] text-white px-8 py-2.5 md:px-10 md:py-3 rounded-full font-semibold text-base md:text-lg shadow-md hover:brightness-110 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : (
              'Check Compliance'
            )}
          </button>

          {error && (
            <div className="w-full max-w-sm md:max-w-4xl p-4 rounded-xl bg-red-50 border border-red-200">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          )}
        </main>

        <DarkModeToggle />
      </div>
    </>

  );
}