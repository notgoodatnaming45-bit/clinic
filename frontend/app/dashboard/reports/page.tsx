// "use client";

// import { useState } from "react";

// export default function ReportsPage() {
//   const [mode, setMode] = useState("Clinical Summary");

//   return (
//     <div className="space-y-6 p-8">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
//         <p className="text-gray-500">Draft clinical summaries and legal-medical reports.</p>
//       </div>

//       <div className="grid gap-4 md:grid-cols-3">
//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="font-semibold">Report Mode</p>
//           <select className="mt-3 w-full rounded-xl border p-3" value={mode} onChange={(e) => setMode(e.target.value)}>
//             <option>Clinical Summary</option>
//             <option>Legal Report</option>
//           </select>
//         </div>
//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="font-semibold">Status</p>
//           <p className="mt-3 rounded-xl bg-yellow-50 p-3 text-yellow-700">Pending Review</p>
//         </div>
//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="font-semibold">Signature</p>
//           <p className="mt-3 rounded-xl bg-gray-50 p-3 text-gray-600">Not Signed</p>
//         </div>
//       </div>

//       <textarea
//         className="min-h-96 w-full rounded-2xl border bg-white p-5 shadow-sm"
//         defaultValue={`${mode}\n\nPatient history:\n\nInjury mechanism:\n\nSymptoms progression:\n\nClinical findings:\n\nCausality / impairment discussion:\n\nPhysician final notes:`}
//       />

//       <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Save Draft</button>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { getPatientReports, getPatients, getReport } from "@/lib/api";

type Patient = {
  id: string;
  first_name_encrypted: string;
  last_name_encrypted: string;
  mrn: string;
};

type ReportListItem = {
  id: string;
  report_type: string;
  report_status: string;
  approved_at?: string | null;
  created_at: string;
};

type ReportDetail = {
  id: string;
  patient_id: string;
  report_type: string;
  ai_draft?: string | null;
  physician_edited_content?: string | null;
  finalized_content?: string | null;
  report_status: string;
  digital_signature?: string | null;
  approved_at?: string | null;
};

function cleanReportText(raw: string) {
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    const data = parsed.structured_data || parsed;

    if (data.message && data.preview) {
      return `${data.message}\n\nEXTRACTED TEXT PREVIEW\n\n${data.preview}`;
    }

    return JSON.stringify(data, null, 2);
  } catch {
    return raw;
  }
}

export default function ReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(
    null
  );

  async function loadPatients() {
    const data = await getPatients();
    setPatients(data);
  }

  async function loadReports(patientId: string) {
    if (!patientId) {
      setReports([]);
      return;
    }

    const data = await getPatientReports(patientId);
    setReports(data);
  }

  async function openReport(reportId: string) {
    const data = await getReport(reportId);
    setSelectedReport(data);
  }

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    setSelectedReport(null);
    loadReports(selectedPatientId);
  }, [selectedPatientId]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const reportContent =
    selectedReport?.finalized_content ||
    selectedReport?.physician_edited_content ||
    cleanReportText(selectedReport?.ai_draft || "");

  function printReport() {
    window.print();
  }

  return (
    <div className="space-y-6 print:p-0">
      <div className="print:hidden">
        <h1 className="text-4xl font-bold text-slate-900">Reports</h1>
        <p className="mt-2 text-slate-500">
          View finalized and physician-reviewed clinical/legal reports.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm print:hidden">
        <label className="mb-2 block text-sm font-medium text-slate-600">
          Select Patient
        </label>

        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full rounded-xl border p-3"
        >
          <option value="">Choose patient...</option>

          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.first_name_encrypted} {patient.last_name_encrypted} —{" "}
              {patient.mrn}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 print:block">
        <div className="rounded-2xl border bg-white p-6 shadow-sm print:hidden">
          <h2 className="text-xl font-bold text-slate-900">Report List</h2>

          <div className="mt-5 space-y-3">
            {reports.length === 0 ? (
              <p className="rounded-xl border border-dashed p-6 text-center text-slate-500">
                No reports found.
              </p>
            ) : (
              reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => openReport(report.id)}
                  className="w-full rounded-xl border p-4 text-left hover:bg-slate-50"
                >
                  <p className="font-semibold capitalize">
                    {report.report_type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Status: {report.report_status}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm lg:col-span-2 print:border-0 print:shadow-none">
          {!selectedReport ? (
            <p className="text-center text-slate-500">
              Select a report to view.
            </p>
          ) : (
            <div>
              <div className="mb-6 flex items-start justify-between gap-4 print:block">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 capitalize">
                    {selectedReport.report_type.replaceAll("_", " ")}
                  </h2>

                  {selectedPatient && (
                    <p className="mt-2 text-slate-600">
                      Patient: {selectedPatient.first_name_encrypted}{" "}
                      {selectedPatient.last_name_encrypted} • MRN:{" "}
                      {selectedPatient.mrn}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-slate-500">
                    Status: {selectedReport.report_status}
                  </p>

                  {selectedReport.approved_at && (
                    <p className="mt-1 text-sm text-slate-500">
                      Approved:{" "}
                      {new Date(selectedReport.approved_at).toLocaleString()}
                    </p>
                  )}

                  {selectedReport.digital_signature && (
                    <p className="mt-1 break-all text-xs text-slate-500">
                      Signature: {selectedReport.digital_signature}
                    </p>
                  )}
                </div>

                <button
                  onClick={printReport}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 print:hidden"
                >
                  Print / Save PDF
                </button>
              </div>

              <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-800 print:bg-white print:p-0">
                {reportContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}