// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { getPatients } from "@/lib/api";

// type Patient = {
//   id: string;
//   first_name_encrypted: string;
//   last_name_encrypted: string;
//   mrn: string;
//   injury_date: string;
//   case_status: string;
//   priority: string;
//   created_at?: string;
// };

// export default function PatientsPage() {
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   async function loadPatients() {
//     try {
//       const data = await getPatients();
//       setPatients(data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load patients");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadPatients();
//   }, []);

//   const filtered = patients.filter((patient) => {
//     const fullName =
//       `${patient.first_name_encrypted} ${patient.last_name_encrypted}`.toLowerCase();

//     return (
//       fullName.includes(search.toLowerCase()) ||
//       patient.mrn?.toLowerCase().includes(search.toLowerCase())
//     );
//   });

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h1 className="text-4xl font-bold text-slate-900">
//             Patients
//           </h1>

//           <p className="mt-2 text-slate-500">
//             Manage patient records and monitor TBI workflow status.
//           </p>
//         </div>

//         <Link
//           href="/dashboard/patients/new"
//           className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
//         >
//           Add Patient
//         </Link>
//       </div>

//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <div className="flex items-center justify-between gap-4">
//           <div>
//             <h2 className="text-xl font-bold text-slate-900">
//               Patient Records
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Total Patients: {patients.length}
//             </p>
//           </div>

//           <input
//             className="w-72 rounded-xl border p-3"
//             placeholder="Search by name or MRN..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <div className="mt-6 overflow-hidden rounded-2xl border">
//           <table className="w-full text-left">
//             <thead className="bg-slate-50 text-sm text-slate-500">
//               <tr>
//                 <th className="p-4">Patient</th>
//                 <th className="p-4">MRN</th>
//                 <th className="p-4">Injury Date</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Priority</th>
//                 <th className="p-4">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} className="p-8 text-center text-slate-500">
//                     Loading patients...
//                   </td>
//                 </tr>
//               ) : filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="p-8 text-center text-slate-500">
//                     No patients found.
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((patient) => (
//                   <tr
//                     key={patient.id}
//                     className="border-t hover:bg-slate-50"
//                   >
//                     <td className="p-4">
//                       <div>
//                         <p className="font-semibold text-slate-900">
//                           {patient.first_name_encrypted}{" "}
//                           {patient.last_name_encrypted}
//                         </p>

//                         <p className="mt-1 text-xs text-slate-500">
//                           Patient ID: {patient.id}
//                         </p>
//                       </div>
//                     </td>

//                     <td className="p-4 font-medium">
//                       {patient.mrn}
//                     </td>

//                     <td className="p-4">
//                       {patient.injury_date || "-"}
//                     </td>

//                     <td className="p-4">
//                       <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
//                         {patient.case_status}
//                       </span>
//                     </td>

//                     <td className="p-4">
//                       <span
//                         className={`rounded-full px-3 py-1 text-sm ${
//                           patient.priority === "stat"
//                             ? "bg-red-100 text-red-700"
//                             : patient.priority === "urgent"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : "bg-green-100 text-green-700"
//                         }`}
//                       >
//                         {patient.priority}
//                       </span>
//                     </td>

//                     <td className="p-4">
//                       <Link
//                         href={`/dashboard/patients/${patient.id}`}
//                         className="font-semibold text-blue-600 hover:text-blue-800"
//                       >
//                         Open
//                       </Link>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPatients } from "@/lib/api";

type Patient = {
  id: string;
  first_name_encrypted: string;
  last_name_encrypted: string;
  mrn: string;
  injury_date: string;
  case_status: string;
  priority: string;
  created_at?: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadPatients() {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = patients.filter((patient) => {
    const fullName =
      `${patient.first_name_encrypted} ${patient.last_name_encrypted}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      patient.mrn?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
            Patients
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:mt-2">
            Manage patient records and monitor TBI workflow status.
          </p>
        </div>
        <Link
          href="/dashboard/patients/new"
          className="w-full rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700 sm:w-auto"
        >
          Add Patient
        </Link>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Patient Records
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Total Patients: {patients.length}
            </p>
          </div>
          <input
            className="w-full rounded-xl border p-2.5 text-sm sm:w-72 sm:p-3"
            placeholder="Search by name or MRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border sm:mt-6">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 sm:p-4">Patient</th>
                <th className="p-3 sm:p-4">MRN</th>
                <th className="p-3 sm:p-4">Injury Date</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4">Priority</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading patients...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No patients found.
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr key={patient.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 sm:p-4">
                      <p className="font-semibold text-slate-900">
                        {patient.first_name_encrypted} {patient.last_name_encrypted}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        ID: {patient.id}
                      </p>
                    </td>
                    <td className="p-3 font-medium sm:p-4">{patient.mrn}</td>
                    <td className="p-3 sm:p-4">{patient.injury_date || "-"}</td>
                    <td className="p-3 sm:p-4">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                        {patient.case_status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          patient.priority === "stat"
                            ? "bg-red-100 text-red-700"
                            : patient.priority === "urgent"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {patient.priority}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}