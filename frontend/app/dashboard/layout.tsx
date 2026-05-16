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

// import { Sidebar } from "@/components/Sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-slate-50">
//       <Sidebar />
//       <main className="pl-64 p-6">
//         {children}
//       </main>
//     </div>
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
//       <main className="ml-64 min-h-screen p-8">
//         {children}
//       </main>
//     </div>
//   );
// }

// export default function DashboardPage() {
//   return (
//     <div className="space-y-6"></div>


// import { Sidebar } from "@/components/Sidebar";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar />
//       <main className="ml-64 min-h-screen p-8">
//         {children}
//       </main>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("tbi_access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}