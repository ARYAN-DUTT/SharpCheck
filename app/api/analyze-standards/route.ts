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
You are a technical extraction expert. Your job is to extract technical specifications, product category, and intended use from the provided input (text, images, or documents).
If the input is an image of a product or label, extract all visible technical specs.
Output strictly in this JSON format:
{
  "productName": "string",
  "productCategory": "string",
  "extractedSpecs": {
    "Capacity": "value",
    "Power": "value",
    // Add any other dynamic fields found (e.g. Material, Voltage, Dimensions, Intended Use, etc.)
  }
}
`;

const REASONING_PROMPT = `
You are an expert in Indian Standards (BIS) and Compliance.
You will be provided with:
1. Product specifications extracted from the user's input.
2. A list of retrieved Indian Standards from our authoritative database.

Your task is to analyze which of the retrieved standards apply to the product and provide clear reasoning.
Only recommend standards from the retrieved list. Do not fabricate IS numbers.
If none apply, say so.

Output strictly in this JSON format:
{
  "applicableStandards": [
    {
      "standard": "IS XXXXX",
      "title": "Title",
      "applicability": "Explain why it applies based on the specs",
      "confidence": "High" | "Medium" | "Requires Verification",
      "source": "Retrieved Database"
    }
  ],
  "relatedStandards": [
    {
      "standard": "IS YYYYY",
      "category": "Testing/Safety/Allied",
      "title": "Title"
    }
  ],
  "testingReqs": "Detailed explanation of testing required",
  "certificationReqs": "Detailed explanation of BIS/other certifications required"
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // updated model name

    let imageUrls: string[] = [];
    const imageParts = [];

    for (const file of files) {
      const part = await fileToGenerativePart(file);
      imageParts.push(part.inlineData);
      if (part.base64Image) imageUrls.push(part.base64Image);
    }
    
    for (const doc of docs) {
      const part = await fileToGenerativePart(doc);
      imageParts.push(part.inlineData);
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

    // Step 2: Retrieval (Mock RAG)
    const dbPath = path.join(process.cwd(), 'app/api/analyze-standards/standards_db.json');
    let dbContent = "[]";
    try {
      dbContent = await fs.readFile(dbPath, 'utf8');
    } catch (e) {
      console.warn("Could not read standards_db.json");
    }
    const standardsDb = JSON.parse(dbContent);
    
    // Very basic keyword matching for mock retrieval
    const productKeywords = `${extractedData.productName} ${extractedData.productCategory} ${JSON.stringify(extractedData.extractedSpecs)}`.toLowerCase();
    const retrievedStandards = standardsDb.filter((s: any) => 
      s.keywords.some((k: string) => productKeywords.includes(k)) ||
      productKeywords.includes(s.category.toLowerCase())
    );

    // Step 3: Reasoning
    const reasoningContent = [
      REASONING_PROMPT,
      `Product Specs: ${JSON.stringify(extractedData, null, 2)}`,
      `Retrieved Standards Database: ${JSON.stringify(retrievedStandards, null, 2)}`
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
      certificationReqs: reasoningData.certificationReqs || '',
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
