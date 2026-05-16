// import { Sidebar } from "@/components/Sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar />
//       <main className="min-h-screen pl-64">
//         {children}
//       </main>
//     </div>
//   );

// import type { Metadata } from "next";
// import "./globals.css";
// import { Providers } from "./providers";

// export const metadata: Metadata = {
//   title: "RUF.AI TBI Clinic Platform",
//   description: "HIPAA-focused TBI clinic workflow system",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

// import { Sidebar } from "@/components/Sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar />
//       <main className="min-h-screen pl-64">
//         {children}
//       </main>
//     </div>
//   );
// }

// import "./globals.css";
// import { Providers } from "./providers";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

// import { Sidebar } from "@/components/Sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar />

//       <main className="min-h-screen p-4 md:p-8 lg:ml-64">
//         {children}
//       </main>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Sidebar } from "@/components/Sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const [authorized, setAuthorized] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("tbi_access_token");
//     if (!token) {
//       router.push("/login");
//       return;
//     }
//     setAuthorized(true);
//   }, [router]);

//   if (!authorized) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-50">
//         <p className="text-slate-500">Checking authentication...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar />
//       {/* On mobile: no left margin (sidebar is a drawer). On desktop: 256px left margin for fixed sidebar. */}
//       <main className="min-h-screen p-4 sm:p-6 lg:ml-64 lg:p-8">
//         {children}
//       </main>
//     </div>
//   );
// }

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TBI Clinic Platform",
  description: "HIPAA-Compliant AI Clinical Workflow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}