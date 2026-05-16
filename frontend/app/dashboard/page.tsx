// "use client";

// import { useEffect, useState } from "react";

// export default function DashboardPage() {
//   const [patients, setPatients] = useState<any[]>([]);
//   const [logs, setLogs] = useState<any[]>([]);

//   useEffect(() => {
//     setPatients(JSON.parse(localStorage.getItem("patients") || "[]"));
//     setLogs(JSON.parse(localStorage.getItem("auditLogs") || "[]"));
//   }, []);

//   const pendingReviews = patients.filter((p) => p.status === "Review").length;

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-4xl font-bold text-slate-900">TBI Dashboard</h1>
//         <p className="mt-2 text-slate-500">
//           Welcome to the RUF.AI clinical workflow platform.
//         </p>
//       </div>

//       <div className="grid gap-6 md:grid-cols-4">
//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <p className="text-sm text-slate-500">Active Cases</p>
//           <h2 className="mt-3 text-3xl font-bold">{patients.length}</h2>
//         </div>

//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <p className="text-sm text-slate-500">Pending Reviews</p>
//           <h2 className="mt-3 text-3xl font-bold">{pendingReviews}</h2>
//         </div>

//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <p className="text-sm text-slate-500">AI Drafts</p>
//           <h2 className="mt-3 text-3xl font-bold">0</h2>
//         </div>

//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <p className="text-sm text-slate-500">Audit Events</p>
//           <h2 className="mt-3 text-3xl font-bold">{logs.length}</h2>
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
  injury_date: string | null;
  case_status: string;
  priority: string;
  created_at?: string;
};

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const activeCases = patients.filter(
    (p) => p.case_status !== "finalized" && p.case_status !== "archived"
  ).length;

  const pendingReviews = patients.filter(
    (p) => p.case_status === "review"
  ).length;

  const urgentCases = patients.filter(
    (p) => p.priority === "urgent" || p.priority === "stat"
  ).length;

  const recentPatients = patients.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">TBI Dashboard</h1>
        <p className="mt-2 text-slate-500">
          PostgreSQL-backed clinical workflow overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Cases</p>
          <h2 className="mt-3 text-3xl font-bold">
            {loading ? "..." : activeCases}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Pending Reviews</p>
          <h2 className="mt-3 text-3xl font-bold">
            {loading ? "..." : pendingReviews}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Urgent / Stat Cases</p>
          <h2 className="mt-3 text-3xl font-bold">
            {loading ? "..." : urgentCases}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Patients</p>
          <h2 className="mt-3 text-3xl font-bold">
            {loading ? "..." : patients.length}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recent Patients
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest records from PostgreSQL.
            </p>
          </div>

          <Link
            href="/dashboard/patients"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            View All Patients
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">MRN</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Open</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading dashboard...
                  </td>
                </tr>
              ) : recentPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No patients yet.
                  </td>
                </tr>
              ) : (
                recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-t hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">
                        {patient.first_name_encrypted}{" "}
                        {patient.last_name_encrypted}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        ID: {patient.id}
                      </p>
                    </td>

                    <td className="p-4">{patient.mrn}</td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                        {patient.case_status}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
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

                    <td className="p-4">
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