import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DarkModeToggle } from '../ThemeContext';
import ReportList from './ReportList';
import UserMenu from '@/components/UserMenu';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/Signup');
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });

  const analyses = await prisma.standardsAnalysis.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  });

  const totalAnalyses = analyses.length;
  let standardsIdentified = 0;
  let standardsNotFound = 0;

  analyses.forEach(a => {
    try {
      const standards = JSON.parse(a.applicableStandards || "[]");
      standardsIdentified += standards.length;
      if (standards.length === 0) {
        standardsNotFound++;
      }
    } catch(e) {}
  });

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] transition-colors duration-300 bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-light-blue)] dark:from-[#0F172A] dark:to-[#1E293B] text-[var(--color-dark-blue)] dark:text-[#E2E8F0]">
      <header className="flex items-center justify-between py-4 md:py-5 px-4 md:px-8 transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B] shadow-sm">
        <Link href="/" className="text-2xl md:text-3xl font-[family-name:var(--font-pacifico)] text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-blue)] to-[var(--color-dark-blue)] dark:from-[#60A5FA] dark:to-[#F8FAFC]">
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
        <div className="w-full max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-blue)] to-[var(--color-dark-blue)] dark:from-[#60A5FA] dark:to-[#F8FAFC] tracking-tight">
                Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Welcome back, <span className="font-semibold text-[var(--color-primary-blue)]">{user?.name || 'User'}</span>
              </p>
            </div>
            
            <Link 
              href="/" 
              className="bg-[var(--color-primary-blue)] text-white px-5 py-2.5 rounded-lg text-sm md:text-base font-semibold shadow-md hover:brightness-110 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M20 8V6a2 2 0 0 0-2-2h-2M20 16v2a2 2 0 0 1-2 2h-2M9 10h6v4H9z" />
              </svg>
              New Analysis
            </Link>
          </div>

          {/* Stats Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-10 w-full">
            <div className="flex-1 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border-[2px] border-gray-100 dark:border-[#475569] shadow-sm flex items-center gap-4">
              <div className="p-4 bg-[var(--color-light-blue)] dark:bg-[#0F172A] rounded-full text-[var(--color-primary-blue)] dark:text-[#3B82F6]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Total Analyses</p>
                <p className="text-3xl font-bold text-[var(--color-dark-blue)] dark:text-white">{totalAnalyses}</p>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border-[2px] border-gray-100 dark:border-[#475569] shadow-sm flex items-center gap-4">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Standards Found</p>
                <p className="text-3xl font-bold text-[var(--color-dark-blue)] dark:text-white">{standardsIdentified}</p>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border-[2px] border-gray-100 dark:border-[#475569] shadow-sm flex items-center gap-4">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Standards Not Found</p>
                 <p className="text-3xl font-bold text-[var(--color-dark-blue)] dark:text-white">{standardsNotFound}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <ReportList initialAnalyses={analyses} />
          </div>
        </div>
      </main>

      <DarkModeToggle />
    </div>
  );
}
