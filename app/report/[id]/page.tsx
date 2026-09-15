import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DarkModeToggle } from '../../ThemeContext';
import PrintButton from './PrintButton';
import ReactMarkdown from 'react-markdown';
import UserMenu from '@/components/UserMenu';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const report = await prisma.complianceReport.findUnique({
    where: { id },
  });

  if (!report) {
    notFound();
  }

  let parameters: any[] = [];
  try {
    parameters = JSON.parse(report.missingFields || "[]");
  } catch (e) { }

  let images: string[] = [];
  try {
    images = JSON.parse(report.imageUrl || "[]");
  } catch (e) {
    if (report.imageUrl) images = [report.imageUrl];
  }

  const isOldFormat = parameters.length > 0 && typeof parameters[0] === 'string';

  let totalParameters = 6;
  let compliantParameters = 0;

  if (isOldFormat) {
    compliantParameters = 6 - parameters.length;
  } else if (parameters.length > 0) {
    const applicableParams = parameters.filter(p => p.status !== 'Not Applicable');
    totalParameters = applicableParams.length;
    compliantParameters = applicableParams.filter(p => p.status === 'Compliant').length;
  } else {
    totalParameters = 9;
    compliantParameters = report.isCompliant ? 9 : 0;
  }

  let complianceColor = "text-green-600 dark:text-green-400";
  let complianceBg = "bg-green-100 dark:bg-green-900/30";
  let complianceStroke = "text-green-600 dark:text-green-400";

  if (compliantParameters < totalParameters / 2) {
    complianceColor = "text-red-600 dark:text-red-400";
    complianceBg = "bg-red-100 dark:bg-red-900/30";
    complianceStroke = "text-red-600 dark:text-red-400";
  } else if (compliantParameters < totalParameters) {
    complianceColor = "text-orange-500 dark:text-orange-400";
    complianceBg = "bg-orange-100 dark:bg-orange-900/30";
    complianceStroke = "text-orange-500 dark:text-orange-400";
  }

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] transition-colors duration-300 bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-light-blue)] dark:from-[#0F172A] dark:to-[#1E293B] text-[var(--color-dark-blue)] dark:text-[#E2E8F0]">
      <header className="print:hidden flex items-center justify-between py-4 md:py-5 px-4 md:px-8 transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B] shadow-sm">
        <Link href="/" className="text-2xl md:text-3xl font-[family-name:var(--font-pacifico)] text-[var(--color-dark-blue)] dark:text-[#93C5FD]">
          NavDrishti
        </Link>
        <div className="flex gap-2 md:gap-4 items-center">
          <PrintButton />
          <Link href="/" className="hidden md:inline-block bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg text-sm md:text-base hover:brightness-110 transition-all font-medium shadow-sm cursor-pointer">
            &larr; Back
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-0 print:py-0 print:block">
        <div className="w-full max-w-4xl p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-[#1E293B] border-[3px] border-[var(--color-border-dashed)] dark:border-[#475569] shadow-md text-left transition-all duration-300 print:p-0 print:border-none print:shadow-none print:bg-transparent">

          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 pb-6 border-b border-gray-100 dark:border-gray-700 print:mb-4 print:pb-2 print:border-black print:block">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-dark-blue)] dark:text-[#E2E8F0] tracking-tight print:text-black">
                Compliance Report
              </h1>
              {report.productName && (
                <h2 className="text-xl md:text-2xl font-bold mt-2 text-[var(--color-primary-blue)] dark:text-[#93C5FD] print:text-black print:mt-1">
                  Product: {report.productName}
                </h2>
              )}
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md inline-block print:bg-transparent print:p-0 print:text-black">
                ID: {report.id}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400 print:text-black print:mt-2">
              {new Date(report.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-8 bg-[var(--color-light-blue)] dark:bg-[#0F172A] p-4 rounded-2xl border border-[var(--color-primary-blue)]/20 dark:border-[#334155] print:border-none print:p-0 print:bg-transparent print:mb-4">
            <div className={`flex items-center justify-center h-14 w-14 rounded-full shadow-inner ${complianceBg}`}>
              {compliantParameters === totalParameters && totalParameters > 0 ? (
                <svg className={`h-7 w-7 ${complianceStroke}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : compliantParameters >= totalParameters / 2 ? (
                <svg className={`h-7 w-7 ${complianceStroke}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className={`h-7 w-7 ${complianceStroke}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--color-dark-blue)] dark:text-[#E2E8F0] print:text-black">Compliance Score</h3>
              <p className={`font-semibold text-lg ${complianceColor} print:text-black`}>
                {compliantParameters} out of {totalParameters} parameters compliant
              </p>
            </div>
          </div>

          <div className="mb-8 print:mb-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 border-l-4 border-[var(--color-primary-blue)] dark:border-[#3B82F6] pl-3 print:border-none print:pl-0 print:text-black">
              Detailed Parameters
            </h3>
            <div className="bg-gray-50 dark:bg-[#0F172A] rounded-xl p-5 border border-gray-200 dark:border-[#334155] shadow-sm print:bg-transparent print:border-none print:shadow-none print:p-0">
              <ul className="space-y-3">
                {isOldFormat ? (
                  parameters.map((field: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-600 dark:text-red-400 font-medium">Missing: {field}</span>
                    </li>
                  ))
                ) : (
                  parameters.map((param: any, index: number) => {
                    const isCompliant = param.status === 'Compliant';
                    const isNotApplicable = param.status === 'Not Applicable';
                    const isError = param.status === 'Non-Compliant';

                    let icon = (
                      <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    );
                    let textColor = "text-gray-500 dark:text-gray-400 font-medium print:text-black";

                    if (isCompliant) {
                      icon = (
                        <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      );
                      textColor = "text-green-600 dark:text-green-400 font-medium print:text-black";
                    } else if (isError) {
                      icon = (
                        <svg className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      );
                      textColor = "text-red-600 dark:text-red-400 font-medium print:text-black";
                    }

                    return (
                      <li key={index} className="flex items-start">
                        {icon}
                        <span className={textColor}>
                          {param.name}: {param.status}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 border-l-4 border-[var(--color-primary-blue)] dark:border-[#3B82F6] pl-3 print:border-none print:pl-0 print:text-black">
              Observations
            </h3>
            <div className="bg-gray-50 dark:bg-[#0F172A] rounded-xl p-6 border border-gray-200 dark:border-[#334155] shadow-sm print:bg-transparent print:border-none print:shadow-none print:p-0">
              <div className="text-[var(--color-dark-blue)] dark:text-[#CBD5E1] leading-relaxed print:text-black">
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3 text-[var(--color-primary-blue)] dark:text-[#93C5FD]" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-3 text-[var(--color-primary-blue)] dark:text-[#93C5FD]" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-4 mb-2 text-[var(--color-primary-blue)] dark:text-[#93C5FD]" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,
                  }}
                >
                  {report.observations}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mt-8 print:mt-6">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 border-l-4 border-[var(--color-primary-blue)] dark:border-[#3B82F6] pl-3 print:border-none print:pl-0 print:text-black">
                Scanned Images
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:block">
                {images.map((img, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#334155] break-inside-avoid print:border-none print:rounded-none print:mb-6 print:flex print:justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Scanned product ${idx + 1}`} className="w-full h-auto object-cover print:w-auto print:max-h-[600px] print:object-contain" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <div className="print:hidden">
        <DarkModeToggle />
      </div>
    </div>
  );
}
