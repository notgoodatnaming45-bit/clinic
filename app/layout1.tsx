import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TBI Clinic — AI Clinical Platform",
  description: "HIPAA-Compliant TBI Case Management & AI Reporting",
  robots: "noindex, nofollow",  // Internal app — don't index
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}