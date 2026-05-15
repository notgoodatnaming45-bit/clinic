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


import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}