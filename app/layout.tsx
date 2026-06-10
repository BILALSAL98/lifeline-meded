import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifeline Medical Education — Your Lifeline Through Medical School",
  description:
    "Transform medical education from passive memorization into active understanding through AI-guided learning. Built for medical students, PA students, and residents.",
  keywords: [
    "medical education",
    "USMLE Step 1",
    "USMLE Step 2",
    "AI tutor",
    "medical school",
    "question bank",
    "spaced repetition",
    "clinical reasoning",
  ],
  authors: [{ name: "Lifeline Medical Education" }],
  openGraph: {
    title: "Lifeline Medical Education",
    description: "Your Lifeline Through Medical School",
    type: "website",
    siteName: "Lifeline Medical Education",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lifeline Medical Education",
    description: "Your Lifeline Through Medical School",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#021533",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#060810] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
