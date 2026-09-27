# NavDrishti

**NavDrishti** is a compliance-checking tool designed to verify if packaged commodities in India adhere to the **Legal Metrology Act, 2009** and **The Legal Metrology (Packaged Commodities) Rules, 2011**. It uses Google's Generative AI (Gemini) to visually inspect product labels from uploaded images and determine their legal compliance.

---

## 🔄 Complete Workflow

### 1. Authentication & Landing (Home Page)
- Users can optionally sign up/log in (`/Login`, `/Signup`). Authentication is handled securely using JWTs (`jose`) and password hashing (`bcryptjs`).
- The Home page features an interactive, drag-and-drop interface for users to either select images from their device or take a photo directly using their camera.
- A client-side script compresses the image using an HTML Canvas before uploading to optimize performance and reduce bandwidth.

### 2. Compliance Checking (The Engine)
- Once images are uploaded, they are sent to the backend API (`/api/check-compliance`).
- The backend uses `sharp` to further resize and format the image to a standardized JPEG.
- The image, alongside the text of the Legal Metrology Acts, is passed to **Google's Gemini AI** (`gemini-flash-latest`). 
- The AI is explicitly instructed to act as a Legal Metrology Compliance Expert and check for **9 critical parameters** on the label:
  1. Manufacturer name & address
  2. Generic name of the commodity
  3. Net quantity
  4. Date of manufacture/packing
  5. Retail price (MRP)
  6. Consumer care details
  7. Dimensions (if applicable)
  8. Expiry/Best Before date
  9. Country of origin

### 3. Data Storage & Generation
- The AI returns structured JSON data containing the product name, its overall compliance status, any missing fields, and detailed observations.
- This result, along with the image (stored as a base64 string), is saved to a PostgreSQL database using **Prisma** under a `ComplianceReport` model. If the user is logged in, the report is securely linked to their account.

### 4. Viewing the Report
- After processing, the user is redirected to a dynamic report page (`/report/[id]`) to view the detailed findings, identifying exactly which legal rules the product passed or failed.

### 5. Dashboard & History
- Authenticated users can visit their Dashboard (`/dashboard`) to see their entire history of scans. 
- The dashboard provides quick analytics: total scans performed, overall compliance percentage, and a breakdown of compliant vs. non-compliant products.

---

## 🚀 Key Features

- **AI-Powered Visual Inspection:** Uses `gemini-flash-latest` to read and understand product labels contextually, rather than relying on strict, easily-broken OCR templates.
- **Smart Image Optimization:** Implements a dual-layer compression system (client-side Canvas API + server-side `sharp` library) to handle large camera images seamlessly.
- **Dynamic Dashboard Analytics:** Automatically calculates and displays a user's compliance metrics and historical data.
- **Modern, Responsive UI:** Built with Next.js App Router, Tailwind CSS, and custom CSS animations (like the 3D Carousel and Box Animation).
- **Dark Mode Support:** Fully integrated dark/light mode context across the entire application.
- **Secure Authentication:** Custom-built, cookie-based JWT authentication system.
- **Robust Database:** Uses Prisma ORM with a PostgreSQL database to manage Users and Compliance Reports.
