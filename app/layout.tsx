import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "InstaBoost — Grow your Instagram",
    template: "%s · InstaBoost",
  },
  description: "Exchange real followers, likes, and views with active users.",
  applicationName: "InstaBoost",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InstaBoost",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#F4F4F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${grotesk.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-grotesk)" }}
      >
        <NextTopLoader
          color="#18181b"
          height={3}
          showSpinner={false}
          shadow="0 0 8px rgba(24,24,27,0.4)"
        />
        {children}
      </body>
    </html>
  );
}
