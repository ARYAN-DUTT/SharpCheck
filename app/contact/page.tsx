import Link from 'next/link';
import { DarkModeToggle } from '../ThemeContext';
import UserMenu from '@/components/UserMenu';

export default function ContactPage() {
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
            Contact Us
          </h1>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              [Default Text] We would love to hear from you. Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
            </p>
            
            <div className="mt-8 bg-gray-50 dark:bg-[#0F172A] p-6 rounded-xl border border-gray-200 dark:border-[#334155]">
              <h2 className="text-xl font-bold text-[var(--color-primary-blue)] dark:text-[#93C5FD] mb-4">Get in Touch</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span><strong>Email:</strong> support@navdrishti.example.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span><strong>Phone:</strong> +91 (123) 456-7890</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span><strong>Address:</strong> 123 Tech Park, Innovation Valley, New Delhi, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <DarkModeToggle />
    </div>
  );
}
