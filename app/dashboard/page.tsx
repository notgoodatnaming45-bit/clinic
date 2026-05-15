// "use client";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/api";
// import { Sidebar } from "@/components/Sidebar";
// import { StatsCards } from "@/components/StatsCards";
// import { CaseTable } from "@/components/CaseTable";
// import { Activity, Brain } from "lucide-react";

// export default function DashboardPage() {
//   const { data: patients, isLoading } = useQuery({
//     queryKey: ["patients"],
//     queryFn: () => api.get("/api/v1/patients/").then((r) => r.data),
//   });

//   const stats = {
//     intake: patients?.filter((p: any) => p.case_status === "intake").length ?? 0,
//     processing: patients?.filter((p: any) => p.case_status === "processing").length ?? 0,
//     review: patients?.filter((p: any) => p.case_status === "review").length ?? 0,
//     finalized: patients?.filter((p: any) => p.case_status === "finalized").length ?? 0,
//     stat: patients?.filter((p: any) => p.priority === "stat").length ?? 0,
//   };

//   return (
//     <div className="flex h-screen bg-slate-50">
//       <Sidebar />
//       <main className="flex-1 overflow-auto">
//         {/* Header */}
//         <div className="bg-white border-b border-slate-200 px-8 py-5">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
//               <Brain className="text-white" size={22} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-slate-900">Case Dashboard</h1>
//               <p className="text-sm text-slate-500">TBI Clinical Workflow Platform</p>
//             </div>
//           </div>
//         </div>

//         <div className="p-8 space-y-8">
//           <StatsCards stats={stats} />

//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Activity size={18} className="text-brand-500" />
//                 <h2 className="font-semibold text-slate-800">Active Cases</h2>
//               </div>
//               <a
//                 href="/dashboard/patients/new"
//                 className="bg-brand-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
//               >
//                 + New Patient
//               </a>
//             </div>
//             <CaseTable patients={patients || []} isLoading={isLoading} />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default function DashboardPage() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-4xl font-bold text-slate-900">
//           TBI Dashboard
//         </h1>

//         <p className="mt-2 text-slate-500">
//           Welcome to the RUF.AI clinical workflow platform.
//         </p>
//       </div>

//       <div className="grid gap-6 md:grid-cols-4">
//         <div className="rounded-2xl bg-white p-6 shadow-sm border">
//           <p className="text-sm text-slate-500">Active Cases</p>
//           <h2 className="mt-3 text-3xl font-bold">24</h2>
//         </div>

//         <div className="rounded-2xl bg-white p-6 shadow-sm border">
//           <p className="text-sm text-slate-500">Pending Reviews</p>
//           <h2 className="mt-3 text-3xl font-bold">8</h2>
//         </div>

//         <div className="rounded-2xl bg-white p-6 shadow-sm border">
//           <p className="text-sm text-slate-500">AI Drafts</p>
//           <h2 className="mt-3 text-3xl font-bold">17</h2>
//         </div>

//         <div className="rounded-2xl bg-white p-6 shadow-sm border">
//           <p className="text-sm text-slate-500">Audit Events</p>
//           <h2 className="mt-3 text-3xl font-bold">143</h2>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setPatients(JSON.parse(localStorage.getItem("patients") || "[]"));
    setLogs(JSON.parse(localStorage.getItem("auditLogs") || "[]"));
  }, []);

  const pendingReviews = patients.filter((p) => p.status === "Review").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">TBI Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Welcome to the RUF.AI clinical workflow platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Cases</p>
          <h2 className="mt-3 text-3xl font-bold">{patients.length}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Pending Reviews</p>
          <h2 className="mt-3 text-3xl font-bold">{pendingReviews}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">AI Drafts</p>
          <h2 className="mt-3 text-3xl font-bold">0</h2>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Audit Events</p>
          <h2 className="mt-3 text-3xl font-bold">{logs.length}</h2>
        </div>
      </div>
    </div>
  );
}