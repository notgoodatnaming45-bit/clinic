// import { ClipboardList, Cpu, Eye, CheckCircle, AlertTriangle } from "lucide-react";

// interface Stats {
//   intake: number;
//   processing: number;
//   review: number;
//   finalized: number;
//   stat: number;
// }

// const cards = [
//   { key: "intake",      label: "Intake",          icon: ClipboardList, color: "bg-blue-50 text-blue-600",   border: "border-blue-200" },
//   { key: "processing",  label: "Processing",       icon: Cpu,           color: "bg-yellow-50 text-yellow-600", border: "border-yellow-200" },
//   { key: "review",      label: "Needs Review",     icon: Eye,           color: "bg-purple-50 text-purple-600", border: "border-purple-200" },
//   { key: "finalized",   label: "Finalized",         icon: CheckCircle,   color: "bg-green-50 text-green-600",  border: "border-green-200" },
//   { key: "stat",        label: "STAT Priority",    icon: AlertTriangle, color: "bg-red-50 text-red-600",      border: "border-red-200" },
// ];

// export function StatsCards({ stats }: { stats: Stats }) {
//   return (
//     <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
//       {cards.map(({ key, label, icon: Icon, color, border }) => (
//         <div key={key} className={`bg-white rounded-xl border ${border} p-4 shadow-sm`}>
//           <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
//             <Icon size={18} />
//           </div>
//           <p className="text-2xl font-bold text-slate-900">{(stats as any)[key]}</p>
//           <p className="text-sm text-slate-500 mt-0.5">{label}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

import { ClipboardList, Cpu, Eye, CheckCircle, AlertTriangle } from "lucide-react";

interface Stats {
  intake: number;
  processing: number;
  review: number;
  finalized: number;
  stat: number;
}

const cards = [
  { key: "intake",     label: "Intake",        icon: ClipboardList, color: "bg-blue-50 text-blue-600",   border: "border-blue-200" },
  { key: "processing", label: "Processing",     icon: Cpu,           color: "bg-yellow-50 text-yellow-600", border: "border-yellow-200" },
  { key: "review",     label: "Needs Review",   icon: Eye,           color: "bg-purple-50 text-purple-600", border: "border-purple-200" },
  { key: "finalized",  label: "Finalized",      icon: CheckCircle,   color: "bg-green-50 text-green-600",  border: "border-green-200" },
  { key: "stat",       label: "STAT Priority",  icon: AlertTriangle, color: "bg-red-50 text-red-600",      border: "border-red-200" },
];

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    /* 2 cols on mobile, 3 on sm, 5 on lg */
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-4">
      {cards.map(({ key, label, icon: Icon, color, border }) => (
        <div key={key} className={`rounded-xl border ${border} bg-white p-4 shadow-sm`}>
          <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${color} sm:h-10 sm:w-10`}>
            <Icon size={17} />
          </div>
          <p className="text-xl font-bold text-slate-900 sm:text-2xl">
            {(stats as any)[key]}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{label}</p>
        </div>
      ))}
    </div>
  );
}
