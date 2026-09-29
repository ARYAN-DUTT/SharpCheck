import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function run() {
  const dbPath = './app/api/analyze-standards/catalog.md';
  const catalogContent = await fs.readFile(dbPath, 'utf8');
  console.log("Catalog length:", catalogContent.length);

  const extractedData = {
    productName: "Fe 500D TMT reinforcement bars",
    productCategory: "Construction Material",
    extractedSpecs: {
      quantity: "500 MT",
      diameter: "12 mm and 16 mm",
      application: "RCC work in hospital building"
    }
  };

  const buildReasoningPrompt = (catalogMd) => `
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
5. "relatedStandards" must come from the catalog's Related lines or same-QCO entries. Mark each with its tag.
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

  const reasoningContent = [
    buildReasoningPrompt(catalogContent),
    `Product Specs: ${JSON.stringify(extractedData, null, 2)}`
  ];

  const result = await model.generateContent(reasoningContent);
  console.log(result.response.text());
}
run();
