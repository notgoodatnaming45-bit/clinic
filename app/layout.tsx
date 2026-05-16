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

import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}