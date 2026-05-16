// "use client";

// import { useEffect, useState } from "react";

// type Patient = {
//   id: string;
//   name: string;
//   mrn: string;
//   injuryDate: string;
//   status: string;
//   priority: string;
// };

// export default function PatientsPage() {
//   const [patients, setPatients] = useState<Patient[]>([]);

//   useEffect(() => {
//     const saved = localStorage.getItem("patients");
//     setPatients(saved ? JSON.parse(saved) : []);
//   }, []);

//   return (
//     <div className="space-y-6 p-8">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
//           <p className="text-gray-500">Track active TBI cases and intake status.</p>
//         </div>
//         <a href="/dashboard/patients/new" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700">
//           Add Patient
//         </a>
//       </div>

//       <div className="grid gap-4 md:grid-cols-4">
//         {["Intake", "Processing", "Review", "Finalized"].map((s) => (
//           <div key={s} className="rounded-2xl border bg-white p-5 shadow-sm">
//             <p className="text-sm text-gray-500">{s}</p>
//             <p className="mt-2 text-3xl font-bold">{patients.filter((p) => p.status === s).length}</p>
//           </div>
//         ))}
//       </div>

//       <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
//         <table className="w-full text-left">
//           <thead className="bg-gray-50 text-sm text-gray-500">
//             <tr>
//               <th className="p-4">Patient</th>
//               <th className="p-4">MRN</th>
//               <th className="p-4">Injury Date</th>
//               <th className="p-4">Status</th>
//               <th className="p-4">Priority</th>
//             </tr>
//           </thead>
//           <tbody>
//             {patients.length === 0 ? (
//               <tr><td colSpan={5} className="p-8 text-center text-gray-500">No patients added yet.</td></tr>
//             ) : patients.map((p) => (
//               <tr key={p.id} className="border-t">
//                 <td className="p-4 font-semibold">{p.name}</td>
//                 <td className="p-4">{p.mrn}</td>
//                 <td className="p-4">{p.injuryDate}</td>
//                 <td className="p-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{p.status}</span></td>
//                 <td className="p-4"><span className="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">{p.priority}</span></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Patient = {
  id: string;
  name: string;
  mrn: string;
  injuryDate: string;
  status: string;
  priority: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("patients");
    setPatients(saved ? JSON.parse(saved) : []);
  }, []);

  function clearPatients() {
    localStorage.removeItem("patients");
    setPatients([]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Patients</h1>
          <p className="mt-2 text-slate-500">
            Manage active TBI cases and intake status.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearPatients}
            className="rounded-xl border bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>

          <Link
            href="/dashboard/patients/new"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Add Patient
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {["Intake", "Processing", "Review", "Finalized"].map((status) => (
          <div key={status} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{status}</p>
            <p className="mt-2 text-3xl font-bold">
              {patients.filter((p) => p.status === status).length}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="p-4">Patient</th>
              <th className="p-4">MRN</th>
              <th className="p-4">Injury Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Priority</th>
            </tr>
          </thead>

          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No patients added yet.
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="border-t">

                  <td className="p-4 font-semibold">
                    <Link href={`/dashboard/patients/${patient.id}`} className="text-blue-600 hover:underline">
                      {patient.name}
                    </Link>
                  </td>
                  
                  {/* <td className="p-4 font-semibold">{patient.name}</td> */}
                  <td className="p-4">{patient.mrn}</td>
                  <td className="p-4">{patient.injuryDate}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">
                      {patient.priority}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}