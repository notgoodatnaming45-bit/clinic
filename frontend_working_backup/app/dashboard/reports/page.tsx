"use client";

import { useState } from "react";

export default function ReportsPage() {
  const [mode, setMode] = useState("Clinical Summary");

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Draft clinical summaries and legal-medical reports.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="font-semibold">Report Mode</p>
          <select className="mt-3 w-full rounded-xl border p-3" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option>Clinical Summary</option>
            <option>Legal Report</option>
          </select>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="font-semibold">Status</p>
          <p className="mt-3 rounded-xl bg-yellow-50 p-3 text-yellow-700">Pending Review</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="font-semibold">Signature</p>
          <p className="mt-3 rounded-xl bg-gray-50 p-3 text-gray-600">Not Signed</p>
        </div>
      </div>

      <textarea
        className="min-h-96 w-full rounded-2xl border bg-white p-5 shadow-sm"
        defaultValue={`${mode}\n\nPatient history:\n\nInjury mechanism:\n\nSymptoms progression:\n\nClinical findings:\n\nCausality / impairment discussion:\n\nPhysician final notes:`}
      />

      <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Save Draft</button>
    </div>
  );
}