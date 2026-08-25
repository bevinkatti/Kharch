import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kharch — Where is my salary",
  description: "Track your monthly expenses, savings, and know exactly where your salary went. Free, private, and fast.",
  keywords: ["budget tracker", "salary tracker", "expense manager", "India", "kharch"],
  authors: [{ name: "Kharch" }],
  openGraph: {
    title: "Kharch — Where is my salary",
    description: "Track your monthly expenses and savings. Free forever.",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0d14",
  width: "device-width",
  initialScale: 1,
  // Do NOT set maximumScale — it blocks accessibility zoom
  // interactiveWidget keeps the layout stable when keyboard opens
  interactiveWidget: "resizes-content",
};

// Inline script injected before React hydration — reads localStorage and
// sets data-theme on <html> so there is zero flash of wrong theme.
const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('kharch-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
`;

// Service worker registration
const swScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function(error) {
    console.error("Kharch service worker registration failed:", error);
    });
  });
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body suppressHydrationWarning>
          {children}
          <script dangerouslySetInnerHTML={{ __html: swScript }} />
        </body>
      </html>
    </ClerkProvider>
  );
}
