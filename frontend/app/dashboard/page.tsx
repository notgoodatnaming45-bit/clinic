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
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
          TBI Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:mt-2 sm:text-base">
          PostgreSQL-backed clinical workflow overview.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        {[
          { label: "Active Cases", value: activeCases },
          { label: "Pending Reviews", value: pendingReviews },
          { label: "Urgent / Stat Cases", value: urgentCases },
          { label: "Total Patients", value: patients.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
            <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
            <h2 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl">
              {loading ? "..." : value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Recent Patients
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Latest records from PostgreSQL.
            </p>
          </div>
          <Link
            href="/dashboard/patients"
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto sm:px-5 sm:py-3"
          >
            View All Patients
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border sm:mt-6">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 sm:p-4">Patient</th>
                <th className="p-3 sm:p-4">MRN</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4">Priority</th>
                <th className="p-3 sm:p-4">Open</th>
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
                    <td className="p-3 sm:p-4">
                      <p className="font-semibold text-slate-900">
                        {patient.first_name_encrypted} {patient.last_name_encrypted}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        ID: {patient.id}
                      </p>
                    </td>
                    <td className="p-3 sm:p-4">{patient.mrn}</td>
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
