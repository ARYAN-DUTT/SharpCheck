import Link from 'next/link';
import { DarkModeToggle } from '../ThemeContext';
import UserMenu from '@/components/UserMenu';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] transition-colors duration-300 bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-light-blue)] dark:from-[#0F172A] dark:to-[#1E293B] text-[var(--color-dark-blue)] dark:text-[#E2E8F0]">
      <header className="flex items-center justify-between py-4 md:py-5 px-4 md:px-8 transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B] shadow-sm">
        <Link href="/" className="text-2xl md:text-3xl font-[family-name:var(--font-pacifico)] text-[var(--color-dark-blue)] dark:text-[#93C5FD]">
          NavDrishti
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/" className="hidden md:inline-block bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg text-sm md:text-base hover:brightness-110 transition-all font-medium shadow-sm cursor-pointer">
            &larr; Back to Home
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-0">
        <div className="w-full max-w-4xl p-8 md:p-12 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-[#1E293B] border-[3px] border-[var(--color-border-dashed)] dark:border-[#475569] shadow-md text-left transition-all duration-300">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-dark-blue)] dark:text-[#E2E8F0] tracking-tight mb-6">
            About Us
          </h1>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              [Default Text] NavDrishti is dedicated to simplifying compliance checking for packaged commodities. 
              Our mission is to empower businesses and consumers alike with automated, AI-driven tools that quickly and accurately verify adherence to Legal Metrology rules.
            </p>
            
            <h2 className="text-2xl font-bold text-[var(--color-primary-blue)] dark:text-[#93C5FD] mt-8 mb-4">Our Vision</h2>
            <p>
              [Default Text] We envision a world where regulatory compliance is effortless and transparent. By leveraging cutting-edge vision technology and artificial intelligence, we aim to eliminate manual checking errors, save time, and ensure that every product on the shelf meets the highest standards of legal packaging requirements.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-primary-blue)] dark:text-[#93C5FD] mt-8 mb-4">How It Works</h2>
            <p>
              [Default Text] NavDrishti allows users to upload images of their product packaging. Our system analyzes these images in real-time, cross-referencing the visible data against established Legal Metrology parameters (such as MRP, Manufacturer Details, Expiry Date, etc.), and generates a comprehensive compliance report instantly.
            </p>
          </div>
        </div>
      </main>

      <DarkModeToggle />
    </div>
  );
}
