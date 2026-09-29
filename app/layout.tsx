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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <Script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('navdrishti-theme');
                if (theme !== 'light') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `
          }}
        />
        <Script
          id="sw-register"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}