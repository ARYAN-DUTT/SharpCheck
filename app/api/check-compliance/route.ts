import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

async function fileToGenerativePart(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type
    },
  };
}

const SYSTEM_PROMPT = `
You are a Legal Metrology Compliance Expert for Packaged Commodities in India.
Your task is to analyze the provided image(s) of a packaged product's label and determine if it complies with "The Legal Metrology (Packaged Commodities) Rules, 2011".

Identify the name of the product being checked, and evaluate the presence and validity of the following 9 parameters:
1. Name and address of the manufacturer, packer, or importer.
2. Common or generic name of the commodity.
3. Net quantity (in standard units of weight, measure, or number).
4. Month and year of manufacture, pre-packing, or import.
5. Retail sale price (Maximum Retail Price or MRP inclusive of all taxes).
6. Contact details for consumer complaints (name/designation, address, telephone number, and e-mail address).
7. Dimensions (if the size of the commodity is relevant, e.g., bedsheets, napkins).
8. Best Before / Expiry date (specifically for food products or perishables).
9. Country of Origin (specifically for imported products).

Respond strictly in JSON format with the following structure:
{
  "productName": "string", // The inferred or explicitly stated name of the product
  "parameters": [
    {
      "name": "string", // e.g., "1. Name and address of manufacturer"
      "status": "Compliant" | "Non-Compliant" | "Not Applicable" // Use "Not Applicable" for conditional parameters like Dimensions or Expiry Date if the product does not require them.
    }
  ],
  "isCompliant": boolean, // true if ALL APPLICABLE parameters are "Compliant". If any applicable parameter is "Non-Compliant", this must be false.
  "observations": "string" // A detailed explanation of your findings, what you saw, and why it is compliant or not in a formatted manner, with proper indentations. Use bullet points and also give headings.
}
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const imageUrls: string[] = [];

    const imageParts = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uniqueId = crypto.randomUUID();
        const fileName = `${uniqueId}.jpg`;
        const filePath = path.join(uploadDir, fileName);

        await sharp(buffer)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(filePath);

        imageUrls.push(`/uploads/${fileName}`);

        const base64Data = buffer.toString("base64");
        return {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          },
        };
      })
    );

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      ...imageParts,
    ]);

    const responseText = result.response.text();

    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    let parsedResult;

    if (jsonMatch && jsonMatch[1]) {
      parsedResult = JSON.parse(jsonMatch[1]);
    } else {
      parsedResult = JSON.parse(responseText);
    }

    const { getSession } = await import('@/lib/auth');
    const session = await getSession();

    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();

    const reportData: any = {
      productName: parsedResult.productName || 'Unknown Product',
      isCompliant: parsedResult.isCompliant,
      missingFields: JSON.stringify(parsedResult.parameters || []),
      observations: parsedResult.observations || '',
      imageUrl: JSON.stringify(imageUrls),
    };

    if (session?.userId) {
      reportData.userId = session.userId;
    }

    const report = await db.complianceReport.create({
      data: reportData
    });

    return NextResponse.json({
      success: true,
      report,
    });

  } catch (error) {
    console.error("Error checking compliance:", error);
    return NextResponse.json(
      { error: 'Failed to process the compliance check. ' + (error as Error).message },
      { status: 500 }
    );
  }
}
