// "use client";
// import Link from "next/link";
// import clsx from "clsx";

// const statusColors: Record<string, string> = {
//   intake:      "badge-intake",
//   processing:  "badge-processing",
//   review:      "badge-review",
//   finalized:   "badge-finalized",
//   archived:    "badge-archived",
// };

// const priorityColors: Record<string, string> = {
//   stat:    "badge-stat",
//   urgent:  "badge-urgent",
//   routine: "badge-routine",
// };

// interface Patient {
//   id: string;
//   mrn: string;
//   case_status: string;
//   priority: string;
//   injury_date?: string;
//   created_at: string;
// }

// export function CaseTable({ patients, isLoading }: { patients: Patient[]; isLoading: boolean }) {
//   if (isLoading) {
//     return (
//       <div className="p-12 text-center text-slate-400">
//         <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-3" />
//         Loading cases...
//       </div>
//     );
//   }

//   if (!patients.length) {
//     return (
//       <div className="p-12 text-center text-slate-400">
//         No cases yet. <Link href="/dashboard/patients/new" className="text-brand-500 hover:underline">Create the first patient →</Link>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="bg-slate-50 border-b border-slate-100">
//             <th className="text-left px-6 py-3 font-medium text-slate-600">MRN</th>
//             <th className="text-left px-6 py-3 font-medium text-slate-600">Status</th>
//             <th className="text-left px-6 py-3 font-medium text-slate-600">Priority</th>
//             <th className="text-left px-6 py-3 font-medium text-slate-600">Injury Date</th>
//             <th className="text-left px-6 py-3 font-medium text-slate-600">Created</th>
//             <th className="text-left px-6 py-3 font-medium text-slate-600">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-50">
//           {patients.map((p) => (
//             <tr key={p.id} className="hover:bg-slate-50 transition-colors">
//               <td className="px-6 py-4 font-mono font-medium text-slate-800">{p.mrn}</td>
//               <td className="px-6 py-4">
//                 <span className={clsx("px-2 py-1 rounded-md text-xs font-medium", statusColors[p.case_status])}>
//                   {p.case_status.replace("_", " ")}
//                 </span>
//               </td>
//               <td className="px-6 py-4">
//                 <span className={clsx("px-2 py-1 rounded-md text-xs font-medium", priorityColors[p.priority])}>
//                   {p.priority.toUpperCase()}
//                 </span>
//               </td>
//               <td className="px-6 py-4 text-slate-600">{p.injury_date || "—"}</td>
//               <td className="px-6 py-4 text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
//               <td className="px-6 py-4">
//                 <Link
//                   href={`/dashboard/patients/${p.id}`}
//                   className="text-brand-500 hover:text-brand-700 font-medium hover:underline"
//                 >
//                   Open →
//                 </Link>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";
import Link from "next/link";
import clsx from "clsx";

const statusColors: Record<string, string> = {
  intake:     "badge-intake",
  processing: "badge-processing",
  review:     "badge-review",
  finalized:  "badge-finalized",
  archived:   "badge-archived",
};

const priorityColors: Record<string, string> = {
  stat:    "badge-stat",
  urgent:  "badge-urgent",
  routine: "badge-routine",
};

interface Patient {
  id: string;
  mrn: string;
  case_status: string;
  priority: string;
  injury_date?: string;
  created_at: string;
}

export function CaseTable({ patients, isLoading }: { patients: Patient[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 sm:p-12">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        Loading cases...
      </div>
    );
  }

  if (!patients.length) {
    return (
      <div className="p-8 text-center text-slate-400 sm:p-12">
        No cases yet.{" "}
        <Link href="/dashboard/patients/new" className="text-brand-500 hover:underline">
          Create the first patient →
        </Link>
      </div>
    );
  }

  return (
    /* overflow-x-auto ensures the table scrolls horizontally on small screens instead of breaking layout */
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-4 py-3 text-left font-medium text-slate-600 sm:px-6">MRN</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600 sm:px-6">Status</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600 sm:px-6">Priority</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600 sm:px-6">Injury Date</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600 sm:px-6">Created</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600 sm:px-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {patients.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-slate-50">
              <td className="px-4 py-3 font-mono font-medium text-slate-800 sm:px-6 sm:py-4">
                {p.mrn}
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <span className={clsx("rounded-md px-2 py-1 text-xs font-medium", statusColors[p.case_status])}>
                  {p.case_status.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <span className={clsx("rounded-md px-2 py-1 text-xs font-medium", priorityColors[p.priority])}>
                  {p.priority.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 sm:px-6 sm:py-4">
                {p.injury_date || "—"}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 sm:px-6 sm:py-4">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <Link
                  href={`/dashboard/patients/${p.id}`}
                  className="font-medium text-brand-500 hover:text-brand-700 hover:underline"
                >
                  Open →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
