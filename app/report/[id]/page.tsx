import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DarkModeToggle } from '../../ThemeContext';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const analysis = await prisma.standardsAnalysis.findUnique({
    where: { id: params.id },
  });

  if (!analysis) {
    notFound();
  }

  let extractedSpecs: any = {};
  try {
    extractedSpecs = JSON.parse(analysis.extractedSpecs || "{}");
  } catch (e) {}

  let applicableStandards: any[] = [];
  try {
    applicableStandards = JSON.parse(analysis.applicableStandards || "[]");
  } catch (e) {}

  let relatedStandards: any[] = [];
  try {
    relatedStandards = JSON.parse(analysis.relatedStandards || "[]");
  } catch (e) {}

  let parsedImageUrls: string[] = [];
  if (analysis.imageUrl) {
    try {
      parsedImageUrls = JSON.parse(analysis.imageUrl);
    } catch (e) {
      if (analysis.imageUrl.startsWith('data:image')) {
        parsedImageUrls = [analysis.imageUrl];
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] transition-colors duration-300 bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-light-blue)] dark:from-[#0F172A] dark:to-[#1E293B] text-[var(--color-dark-blue)] dark:text-[#E2E8F0]">
      <header className="flex items-center justify-between py-5 px-8 transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B] shadow-sm sticky top-0 z-50">
        <Link href="/" className="text-3xl font-[family-name:var(--font-pacifico)] text-[var(--color-dark-blue)] dark:text-[#93C5FD]">
          NavDrishti
        </Link>
        <Link href="/" className="bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg font-semibold hover:brightness-110 transition-all shadow-sm">
          &larr; Start New Analysis
        </Link>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto py-10 px-4 md:px-0">
        <div className="mb-8 border-b-2 border-gray-200 dark:border-gray-700 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--color-dark-blue)] dark:text-[#E2E8F0] tracking-tight">
              Standards Recommendation Report
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-mono text-sm">
              Analysis ID: {analysis.id} | Generated: {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-white dark:bg-[#1E293B] border-2 border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / Context */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border-[2px] border-gray-100 dark:border-[#475569] shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-[var(--color-dark-blue)] dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                Product Profile
              </h2>
              <div className="mb-4">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Name / Description</p>
                <p className="font-semibold text-lg">{analysis.productName || 'Unknown Product'}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Category</p>
                <span className="inline-block mt-1 bg-[var(--color-light-blue)] dark:bg-[#0F172A] text-[var(--color-primary-blue)] px-3 py-1 rounded-full text-sm font-semibold">
                  {analysis.productCategory || 'Uncategorized'}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border-[2px] border-gray-100 dark:border-[#475569] shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-[var(--color-dark-blue)] dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--color-primary-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Detected Specifications
              </h2>
              {Object.keys(extractedSpecs).length > 0 ? (
                <ul className="space-y-3">
                  {Object.entries(extractedSpecs).map(([key, value]) => (
                    <li key={key} className="flex flex-col">
                      <span className="text-sm text-gray-500 font-semibold">{key}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{String(value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No specific technical attributes extracted.</p>
              )}
            </div>

            {parsedImageUrls.length > 0 && (
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border-[2px] border-gray-100 dark:border-[#475569] shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-dark-blue)] dark:text-white">Image Input</h2>
                <div className="grid gap-4">
                  {parsedImageUrls.map((url, i) => (
                    <img key={i} src={url} alt={\`Provided input \${i+1}\`} className="rounded-xl border border-gray-200 dark:border-gray-700 w-full object-cover" />
                  ))}
                </div>
              </div>
            )}
            
            {analysis.rawTextInput && (
               <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border-[2px] border-gray-100 dark:border-[#475569] shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-dark-blue)] dark:text-white">Text Input</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{analysis.rawTextInput}"</p>
               </div>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Applicable Standards */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 border-[2px] border-gray-100 dark:border-[#475569] shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-[var(--color-dark-blue)] dark:text-white border-b-2 border-gray-100 dark:border-gray-700 pb-3">
                Applicable Indian Standards
              </h2>
              
              {applicableStandards.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {applicableStandards.map((std, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-[var(--color-primary-blue)]">{std.standard}</h3>
                        <span className={\`text-xs font-bold px-2 py-1 rounded-full uppercase \${
                          std.confidence === 'High' ? 'bg-green-100 text-green-700' :
                          std.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }\`}>
                          {std.confidence === 'Requires Verification' ? 'Needs Verification' : std.confidence + ' Confidence'}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{std.title}</p>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-[var(--color-primary-blue)]">
                        <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Applicability Reasoning</p>
                        <p className="text-gray-700 dark:text-gray-300">{std.applicability}</p>
                      </div>
                      
                      {std.source && (
                        <p className="text-xs text-gray-400 mt-4 text-right italic">Source: {std.source}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-lg text-gray-600 dark:text-gray-400">No applicable standards were confidently identified from our knowledge base for this product.</p>
                </div>
              )}
            </div>

            {/* Testing and Certification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border-[2px] border-gray-100 dark:border-[#475569] shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-[var(--color-dark-blue)] dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Testing Requirements
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {analysis.testingReqs || "No specific testing requirements were identified."}
                </p>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border-[2px] border-gray-100 dark:border-[#475569] shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-[var(--color-dark-blue)] dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Certification Requirements
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {analysis.certificationReqs || "No specific certification requirements were identified."}
                </p>
              </div>
            </div>

            {/* Related Standards */}
            {relatedStandards.length > 0 && (
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border-[2px] border-gray-100 dark:border-[#475569] shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-[var(--color-dark-blue)] dark:text-white">Related / Normative Standards</h3>
                <div className="grid gap-3">
                  {relatedStandards.map((std, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{std.standard}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{std.title}</p>
                      </div>
                      <span className="mt-2 sm:mt-0 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded w-max">
                        {std.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <DarkModeToggle />
    </div>
  );
}
