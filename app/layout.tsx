import "./globals.css";
import { ThemeProvider } from "./ThemeContext";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              var theme = localStorage.getItem('navdrishti-theme');
              if (theme !== 'light') {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}