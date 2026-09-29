import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function fileToGenerativePart(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  if (file.type.startsWith('image/')) {
    const resizedBuffer = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    return {
      inlineData: { data: resizedBuffer.toString('base64'), mimeType: 'image/jpeg' },
      base64Image: `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`
    };
  } else {
    // For PDF or other documents
    return {
      inlineData: { data: buffer.toString('base64'), mimeType: file.type },
      base64Image: null
    };
  }
}

const EXTRACTION_PROMPT = `
You extract structured product data from tender text, product descriptions, labels, or images.
Input may be in any Indian language or English, or mixed. Translate meaning into English; do not transliterate.

Rules:
- Extract only what is stated or clearly visible. Never guess values.
- Add "searchTerms": 3-8 English AND original-language keywords (e.g. "TMT bar", "सरिया") for catalog matching.
- Set "isPackagedForRetail" to true if the product is sold as a sealed consumer pack (food, water, oil, soap, paint tins, cement bags, etc.), else false.
- Set "isFood" to true if it is food or a beverage.

Output ONLY this JSON, no markdown:
{
  "productName": "string",
  "productCategory": "string",
  "originalLanguage": "string",
  "searchTerms": ["string"],
  "isPackagedForRetail": boolean,
  "isFood": boolean,
  "extractedSpecs": { "<field>": "<value>" }
}
`;

const buildReasoningPrompt = (catalogMd: string) => `
You are a compliance assistant that recommends Indian Standards for procurement specifications.

CATALOG (your ONLY source of standards):
<catalog>
${catalogMd}
</catalog>

You receive extracted product specs. Follow these rules exactly:

1. Recommend ONLY standards that appear in the catalog. Never use an IS number, year, QCO number or regulation from your own memory. If nothing fits, return an empty "applicableStandards" and set "coverage" to "not_in_catalog".
2. Match on meaning, not keywords. Use the specs (grade, voltage, material, use) to choose between variants, e.g. OPC vs PPC cement, RCCB vs MCB.
3. Copy the catalog tag for each recommendation: "BIS-verified" or "verify". Do not upgrade a "verify" item.
4. Version: state the year ONLY if the catalog gives one. Otherwise set "version" to "Confirm latest year and amendments on Manak".
5. "relatedStandards" must come from the catalog's Related lines or same-QCO entries. Mark each with its tag. Use "Installation" only for installation or erection standards. Use "Normative Reference" for design and application codes. List a "Related Product" only if the user spec hints at it (e.g. they asked for accessories), otherwise mention it in "missingInfo" instead of listing it twice.
6. Certification: use only these values for "scheme": "ISI Mark (QCO)", "CRS", "FMCS", "Hallmarking", "Voluntary", "Not determinable". Quote the QCO or order named in the catalog.
7. Food: BIS certification is NOT mandatory for the de-notified food standards. Say "Voluntary (BIS)" and add FSSAI licence and FSS labelling/packaging regulations under "regulatoryOverlays".
8. If isPackagedForRetail is true, add a Legal Metrology (Packaged Commodities) Rules, 2011 overlay: mandatory Rule 6 declarations, and any Second Schedule standard pack size the catalog lists for this commodity. Note Rule 3 (over 25 kg/25 L and industrial packs are excluded, except cement/fertilizer bags up to 50 kg).
9. Confidence: "High" = spec clearly matches one catalog entry. "Medium" = plausible, spec ambiguous. "Requires Verification" = tag is "verify" or the spec is missing a deciding detail. List missing details in "missingInfo".
10. Never state a limit, test value or clause number that is not in the catalog. For testing, name the test standards listed in Related and say the values must be read from the standard.

Output ONLY this JSON, no markdown:
{
  "coverage": "covered" | "partial" | "not_in_catalog",
  "applicableStandards": [
    {
      "standard": "IS number as written in catalog",
      "version": "string",
      "title": "string",
      "applicability": "1-2 sentences tying specific spec values to this standard",
      "confidence": "High" | "Medium" | "Requires Verification",
      "catalogTag": "BIS-verified" | "verify"
    }
  ],
  "relatedStandards": [
    {
      "standard": "string",
      "category": "Normative Reference | Test Method | Terminology | Safety | Installation | Related Product",
      "title": "string",
      "catalogTag": "BIS-verified" | "verify"
    }
  ],
  "certification": {
    "scheme": "ISI Mark (QCO)" | "CRS" | "FMCS" | "Hallmarking" | "Voluntary" | "Not determinable",
    "basis": "QCO or order named in catalog, or empty",
    "note": "string"
  },
  "regulatoryOverlays": [
    { "name": "string", "why": "string", "actions": ["string"] }
  ],
  "testingReqs": "string",
  "missingInfo": ["details the officer should add to the tender spec"]
}
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const textSpec = formData.get('textSpec') as string || '';
    const files = formData.getAll('images') as File[];
    const docs = formData.getAll('documents') as File[];

    if (!textSpec && files.length === 0 && docs.length === 0) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Reverted back to the original model name

    let imageUrls: string[] = [];
    const imageParts = [];

    for (const file of files) {
      const part = await fileToGenerativePart(file);
      imageParts.push({ inlineData: part.inlineData });
      if (part.base64Image) imageUrls.push(part.base64Image);
    }
    
    for (const doc of docs) {
      const part = await fileToGenerativePart(doc);
      imageParts.push({ inlineData: part.inlineData });
    }

    // Step 1: Extraction
    const extractionContent = [EXTRACTION_PROMPT];
    if (textSpec) extractionContent.push(`User Text Specification: ${textSpec}`);
    extractionContent.push(...imageParts);

    const extractionResult = await model.generateContent(extractionContent);
    const extractionText = extractionResult.response.text();
    let extractedData;
    try {
      const jsonMatch = extractionText.match(/```json\n([\s\S]*?)\n```/);
      extractedData = JSON.parse(jsonMatch ? jsonMatch[1] : extractionText);
    } catch(e) {
      console.error("Failed to parse extraction JSON", extractionText);
      throw new Error("Failed to extract specifications");
    }

    // Step 2: Retrieval (Read Catalog)
    const dbPath = path.join(process.cwd(), 'app/api/analyze-standards/catalog.md');
    let catalogContent = "";
    try {
      catalogContent = await fs.readFile(dbPath, 'utf8');
    } catch (e) {
      console.warn("Could not read catalog.md");
      catalogContent = "Catalog is currently unavailable.";
    }

    // Step 3: Reasoning
    const reasoningContent = [
      buildReasoningPrompt(catalogContent),
      `Product Specs: ${JSON.stringify(extractedData, null, 2)}`
    ];


    const reasoningResult = await model.generateContent(reasoningContent);
    const reasoningText = reasoningResult.response.text();
    let reasoningData;
    try {
      const jsonMatch = reasoningText.match(/```json\n([\s\S]*?)\n```/);
      reasoningData = JSON.parse(jsonMatch ? jsonMatch[1] : reasoningText);
    } catch(e) {
      console.error("Failed to parse reasoning JSON", reasoningText);
      throw new Error("Failed to reason about standards");
    }

    const { getSession } = await import('@/lib/auth');
    const session = await getSession();

    const reportData: any = {
      productName: extractedData.productName || 'Unknown Product',
      productCategory: extractedData.productCategory || 'Unknown Category',
      extractedSpecs: JSON.stringify(extractedData.extractedSpecs || {}),
      applicableStandards: JSON.stringify(reasoningData.applicableStandards || []),
      relatedStandards: JSON.stringify(reasoningData.relatedStandards || []),
      testingReqs: reasoningData.testingReqs || '',
      certificationReqs: JSON.stringify({
        certification: reasoningData.certification,
        regulatoryOverlays: reasoningData.regulatoryOverlays,
        missingInfo: reasoningData.missingInfo,
        coverage: reasoningData.coverage
      }),
      imageUrl: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
      rawTextInput: textSpec || null,
    };

    if (session?.userId) {
      reportData.userId = session.userId;
    }

    const report = await prisma.standardsAnalysis.create({
      data: reportData
    });

    return NextResponse.json({
      success: true,
      report,
    });

  } catch (error) {
    console.error("Error analyzing standards:", error);
    return NextResponse.json(
      { error: 'Failed to process the analysis. ' + (error as Error).message },
      { status: 500 }
    );
  }
}
