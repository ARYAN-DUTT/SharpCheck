"use client";
import React, { useState } from 'react';

export default function ExportPDFButton({ analysis, extractedSpecs, applicableStandards, relatedStandards }: any) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      
      pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

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

      // Convert Extracted Specs to Table Rows
      const specRows = Object.keys(extractedSpecs).length > 0 
        ? Object.entries(extractedSpecs).map(([key, val]) => [
            { text: key, bold: true, fillColor: '#F8FAFC', padding: [5, 5, 5, 5] },
            { text: String(val), padding: [5, 5, 5, 5] }
          ])
        : [[{ text: 'No specific technical attributes extracted.', colSpan: 2, alignment: 'center', italics: true, color: '#64748B' }, {}]];

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [ 40, 60, 40, 60 ],
        content: [
          { text: 'STANDARDS RECOMMENDATION REPORT', style: 'header', alignment: 'center' },
          { text: `Report Reference ID: ${analysis.id}`, alignment: 'center', fontSize: 10, color: '#64748B', margin: [0, 0, 0, 20] },

          // Product Details Table
          { text: '1. Product Profile', style: 'sectionTitle' },
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [{ text: 'Product Name / Description', style: 'tableHeader' }, { text: analysis.productName || 'Unknown', style: 'tableCell' }],
                [{ text: 'Category', style: 'tableHeader' }, { text: analysis.productCategory || 'Uncategorized', style: 'tableCell' }],
                [{ text: 'Date of Analysis', style: 'tableHeader' }, { text: new Date(analysis.createdAt).toLocaleString(), style: 'tableCell' }]
              ]
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20]
          },

          // Detected Specifications Table
          { text: '2. Detected Specifications', style: 'sectionTitle' },
          {
            table: {
              widths: ['40%', '60%'],
              body: specRows
            },
            layout: {
              hLineWidth: function (i: any, node: any) { return (i === 0 || i === node.table.body.length) ? 1 : 0.5; },
              vLineWidth: function (i: any, node: any) { return (i === 0 || i === node.table.widths.length) ? 1 : 0.5; },
              hLineColor: function () { return '#CBD5E1'; },
              vLineColor: function () { return '#CBD5E1'; },
            },
            margin: [0, 0, 0, 20]
          },

          // Applicable Standards (Blocks)
          { text: '3. Applicable Indian Standards', style: 'sectionTitle' },
          ...(applicableStandards.length > 0 ? applicableStandards.map((std: any) => ([
            {
              table: {
                widths: ['100%'],
                body: [
                  [{ text: `Standard: ${std.standard}`, bold: true, fontSize: 12, fillColor: '#EFF6FF', color: '#1E40AF' }],
                  [{ text: `Title: ${std.title}`, margin: [0, 2, 0, 2] }],
                  [{ text: `Confidence: ${std.confidence}`, bold: true, color: std.confidence === 'High' ? '#166534' : '#9A3412', margin: [0, 2, 0, 2] }],
                  [{ text: `Applicability Reasoning: ${std.applicability}`, margin: [0, 2, 0, 2] }]
                ]
              },
              layout: 'borders',
              margin: [0, 0, 0, 10]
            }
          ])) : [
            { text: 'No mandatory BIS/CRS standards directly applicable to this product category based on the extracted specifications.', italics: true, color: '#475569', margin: [0, 0, 0, 20] }
          ]),

          { text: '4. Testing & Certification Requirements', style: 'sectionTitle' },
          {
            table: {
              widths: ['100%'],
              body: (() => {
                const rows = [];
                rows.push([{ text: 'A. Testing Requirements', bold: true, fillColor: '#F8FAFC' }]);
                rows.push([{ text: analysis.testingReqs || "No specific testing requirements were identified.", margin: [0, 5, 0, 5] }]);
                
                rows.push([{ text: 'B. Certification Requirements', bold: true, fillColor: '#F8FAFC' }]);
                
                if (analysis.certificationReqs) {
                  try {
                    const certData = JSON.parse(analysis.certificationReqs);
                    if (certData.certification) {
                      rows.push([{ text: [
                        { text: `Scheme: ${certData.certification.scheme}\n`, bold: true, color: '#166534' },
                        ...(certData.certification.basis ? [{ text: `Basis: ${certData.certification.basis}\n`, color: '#15803d' }] : []),
                        ...(certData.certification.note ? [{ text: certData.certification.note, color: '#3f6212' }] : [])
                      ], margin: [0, 5, 0, 5], fillColor: '#f0fdf4' }]);
                    }
                    if (certData.regulatoryOverlays && certData.regulatoryOverlays.length > 0) {
                      rows.push([{ text: 'Regulatory Overlays', bold: true, color: '#b45309', margin: [0, 10, 0, 2] }]);
                      certData.regulatoryOverlays.forEach((overlay: any) => {
                        rows.push([{ text: [
                          { text: `${overlay.name}\n`, bold: true, color: '#92400e' },
                          { text: `${overlay.why}\n`, color: '#b45309' },
                          ...(overlay.actions && overlay.actions.length > 0 ? [{ text: `Actions: ${overlay.actions.join(', ')}`, color: '#334155' }] : [])
                        ], margin: [0, 2, 0, 5], fillColor: '#fffbeb' }]);
                      });
                    }
                    if (certData.missingInfo && certData.missingInfo.length > 0) {
                      rows.push([{ text: 'Missing Information', bold: true, color: '#b91c1c', margin: [0, 10, 0, 2] }]);
                      certData.missingInfo.forEach((info: string) => {
                        rows.push([{ text: `• ${info}`, color: '#991b1b', margin: [0, 2, 0, 2], fillColor: '#fef2f2' }]);
                      });
                    }
                  } catch (e) {
                    rows.push([{ text: analysis.certificationReqs, margin: [0, 5, 0, 5] }]);
                  }
                } else {
                  rows.push([{ text: "No specific certification requirements were identified.", margin: [0, 5, 0, 5] }]);
                }
                return rows;
              })()
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20]
          },

          { text: '5. Related / Normative Standards', style: 'sectionTitle' },
          ...(relatedStandards.length > 0 ? [
            {
              ul: relatedStandards.map((std: any) => ({ text: [{text: `${std.standard}`, bold: true}, ` - ${std.title} (${std.category})`], margin: [0, 3, 0, 3] }))
            }
          ] : [
            { text: "None identified.", margin: [0, 0, 0, 20] }
          ])
        ],
        styles: {
          header: { fontSize: 22, bold: true, margin: [0, 0, 0, 5], color: '#0F172A' },
          sectionTitle: { fontSize: 16, bold: true, margin: [0, 15, 0, 10], color: '#1E3A8A' },
          tableHeader: { bold: true, fillColor: '#F1F5F9', color: '#334155', padding: [5, 5, 5, 5] },
          tableCell: { padding: [5, 5, 5, 5] }
        },
        defaultStyle: {
          fontSize: 11,
          lineHeight: 1.4,
          color: '#1E293B'
        }
      };

      if (parsedImageUrls.length > 0) {
        docDefinition.content.push({ text: 'Appendix A: Scanned Images', style: 'sectionTitle', pageBreak: 'before' });
        parsedImageUrls.forEach((url) => {
          docDefinition.content.push({
            image: url,
            width: 400,
            alignment: 'center',
            margin: [0, 10, 0, 20]
          });
        });
      }

      // Add 'End of Report' at the very end
      docDefinition.content.push({
        text: '--- End of Report ---',
        alignment: 'center',
        margin: [0, 30, 0, 0],
        bold: true,
        color: '#64748B'
      });

      pdfMake.createPdf(docDefinition).download(`NavDrishti_Official_Report_${analysis.id}.pdf`);
    } catch (e) {
      console.error("PDF Generation failed:", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={generatePDF}
      disabled={isExporting}
      className="print:hidden bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg text-sm md:text-base hover:brightness-110 transition-all font-medium shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      )}
      {isExporting ? 'Exporting...' : 'Export PDF'}
    </button>
  );
}
