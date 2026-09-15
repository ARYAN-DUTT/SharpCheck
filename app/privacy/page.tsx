import Link from 'next/link';
import { DarkModeToggle } from '../ThemeContext';
import UserMenu from '@/components/UserMenu';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
            <p><strong>Last Updated: [Date]</strong></p>
            
            <p>
              [Default Text] At NavDrishti, your privacy is a top priority. This Privacy Policy outlines the types of information we collect, how it is used, and how it is protected.
            </p>
            
            <h2 className="text-xl font-bold text-[var(--color-primary-blue)] dark:text-[#93C5FD] mt-6 mb-2">1. Information We Collect</h2>
            <p>
              [Default Text] We may collect personal information such as your name, email address, and any product images you upload for compliance checking. 
            </p>

            <h2 className="text-xl font-bold text-[var(--color-primary-blue)] dark:text-[#93C5FD] mt-6 mb-2">2. How We Use Your Information</h2>
            <p>
              [Default Text] The information we collect is used primarily to provide our core service: verifying legal metrology compliance. Uploaded images are processed via our AI backend to generate reports. We do not sell or rent your personal information to third parties.
            </p>

            <h2 className="text-xl font-bold text-[var(--color-primary-blue)] dark:text-[#93C5FD] mt-6 mb-2">3. Data Security</h2>
            <p>
              [Default Text] We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your information. 
            </p>
            
            <h2 className="text-xl font-bold text-[var(--color-primary-blue)] dark:text-[#93C5FD] mt-6 mb-2">4. Contacting Us</h2>
            <p>
              [Default Text] If there are any questions regarding this privacy policy, you may contact us using the information on our Contact page.
            </p>
          </div>
        </div>
      </main>

      <DarkModeToggle />
    </div>
  );
}
