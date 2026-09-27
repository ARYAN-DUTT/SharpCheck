"use client";

import { useRef, useState, useEffect, useCallback, type DragEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DarkModeToggle } from "./ThemeContext";
import UserMenu from "@/components/UserMenu";
import BoxAnimation from "./BoxAnimation";
import "./box-animation.css";
import "./carousel.css";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textSpec, setTextSpec] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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
    if (!file.type.startsWith('image/')) return Promise.resolve(file); // Don't compress non-images
    
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
              const compressedFile = new File([blob], file.name.replace(/\\.[^/.]+$/, "") + ".jpg", {
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

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0 && textSpec.trim() === "") {
      alert("Please provide a text specification, an image, or a document.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('textSpec', textSpec);
      
      for (const file of selectedFiles) {
        if (file.type.startsWith('image/')) {
          try {
            const compressed = await compressImage(file);
            formData.append('images', compressed);
          } catch (e) {
            formData.append('images', file);
          }
        } else {
          formData.append('documents', file);
        }
      }

      const response = await fetch('/api/analyze-standards', {
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
        throw new Error(data?.error || 'Failed to analyze standards');
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
            <nav className="flex gap-8 font-semibold text-base xl:text-lg text-[var(--color-dark-blue)] dark:text-[#CBD5E1]">
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

        <main className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 px-4 md:px-0 py-6 md:py-8 relative overflow-hidden">
          {/* 3D Carousel Background (Desktop Only) */}
          <div className="hidden lg:flex perspective-room">
            <div className="carousel-scene">
              <div className="carousel-track">
                {/* Set 1 */}
                <div className="carousel-item"><img src="/assets/carousel/item1.jpg" alt="Item 1" /></div>
                <div className="carousel-item"><img src="/assets/carousel/item2.jpg" alt="Item 2" /></div>
                <div className="carousel-item"><img src="/assets/carousel/item3.jpg" alt="Item 3" /></div>
                <div className="carousel-item"><img src="/assets/carousel/item4.jpg" alt="Item 4" /></div>
                {/* Set 2 */}
                <div className="carousel-item"><img src="/assets/carousel/item1.jpg" alt="Item 1" /></div>
                <div className="carousel-item"><img src="/assets/carousel/item2.jpg" alt="Item 2" /></div>
                <div className="carousel-item"><img src="/assets/carousel/item3.jpg" alt="Item 3" /></div>
                <div className="carousel-item"><img src="/assets/carousel/item4.jpg" alt="Item 4" /></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 relative z-10">
            <p className="text-xl md:text-4xl font-medium text-center text-[var(--color-dark-blue)] dark:text-[#CBD5E1] max-w-3xl">
              Discover the Indian Standards for your Product
            </p>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-xl text-center">
              Describe your procurement requirement or upload a product image to instantly identify applicable BIS standards and testing requirements.
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              w-full max-w-3xl flex flex-col gap-6 relative z-10
              rounded-3xl p-8 md:p-12
              border-4 border-dashed flex flex-col items-center justify-center
              transition-all duration-200
              bg-blue-100 dark:bg-slate-800 shadow-xl
              ${isDragging
                  ? "border-blue-500 scale-105 shadow-2xl"
                  : "border-gray-400 dark:border-gray-500"
                }
            `}
          >
            <div className="w-full flex flex-col gap-4">
              <label className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300 text-center">
                Enter procurement Specifications below
              </label>
              <textarea 
                value={textSpec}
                onChange={(e) => setTextSpec(e.target.value)}
                className="w-full min-h-[180px] p-5 rounded-2xl border-none bg-gray-300 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-blue-500 outline-none resize-none shadow-inner text-gray-900 dark:text-gray-100 transition-colors text-lg"
              />
            </div>

            <div className="text-blue-700 dark:text-blue-300 font-bold text-2xl">
              or
            </div>

            <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

            <div className="flex flex-col items-center gap-2 w-full max-w-sm">
              <button
                onClick={handleCameraCapture}
                className="md:hidden w-full flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
              >
                Take Photo
              </button>
              <button
                onClick={handleSelectPictures}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-5 rounded-full font-bold text-2xl shadow-lg hover:bg-blue-500 hover:shadow-xl transition-all cursor-pointer"
              >
                Select Pictures
              </button>
              <p className="text-base mt-2 text-blue-700 dark:text-blue-300 font-semibold hidden md:block">
                or drag and drop here
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-3 mt-4 bg-white/90 dark:bg-slate-800/90 px-6 py-3 rounded-full border border-blue-200 dark:border-blue-800 shadow-md">
                <p className="text-blue-700 dark:text-blue-300 text-base font-bold">
                  {selectedFiles.length} file(s) attached
                </p>
                <button onClick={(e) => { e.stopPropagation(); setSelectedFiles([]); }} className="text-red-500 text-base font-bold hover:underline">
                  Clear
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="relative z-10 bg-[var(--color-primary-blue)] text-white px-8 py-3 md:px-12 md:py-4 rounded-full font-semibold text-lg md:text-xl shadow-lg hover:brightness-110 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Standards...
              </>
            ) : (
              'Identify Indian Standards'
            )}
          </button>

          {error && (
            <div className="relative z-10 w-full max-w-sm md:max-w-4xl p-4 rounded-xl bg-red-50 border border-red-200">
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