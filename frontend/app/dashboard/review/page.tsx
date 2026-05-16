// "use client";

// import { useEffect, useState } from "react";
// import {
//   approveReport,
//   editReport,
//   getPatientReports,
//   getPatients,
//   getReport,
// } from "@/lib/api";

// type Patient = {
//   id: string;
//   first_name_encrypted: string;
//   last_name_encrypted: string;
//   mrn: string;
// };

// type ReportListItem = {
//   id: string;
//   report_type: string;
//   report_status: string;
//   approved_at?: string | null;
//   created_at: string;
// };

// type ReportDetail = {
//   id: string;
//   patient_id: string;
//   report_type: string;
//   ai_draft?: string | null;
//   physician_edited_content?: string | null;
//   finalized_content?: string | null;
//   report_status: string;
//   digital_signature?: string | null;
//   approved_at?: string | null;
// };

// function formatReportContent(raw: string) {
//   if (!raw) return "";

//   try {
//     const fixedJson = raw.replaceAll("'", '"');
//     const parsed = JSON.parse(fixedJson);

//     const data = parsed.structured_data || parsed;

//     if (data.message && data.preview) {
//       return `${data.message}\n\nExtracted Text Preview:\n\n${data.preview}`;
//     }

//     return JSON.stringify(data, null, 2);
//   } catch {
//     return raw;
//   }
// }

// function safeFormatJson(raw: string) {
//   try {
//     const fixed = raw.replaceAll("'", '"');
//     return JSON.parse(fixed);
//   } catch {
//     return null;
//   }
// }

// export default function ReviewPage() {
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [reports, setReports] = useState<ReportListItem[]>([]);
//   const [selectedPatientId, setSelectedPatientId] = useState("");
//   const [selectedReportId, setSelectedReportId] = useState("");
//   const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(
//     null
//   );
//   const [editorContent, setEditorContent] = useState("");
//   const [loadingReports, setLoadingReports] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");

//   async function loadPatients() {
//     try {
//       const data = await getPatients();
//       setPatients(data);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to load patients.");
//     }
//   }

//   async function loadReports(patientId: string) {
//     if (!patientId) {
//       setReports([]);
//       return;
//     }

//     setLoadingReports(true);

//     try {
//       const data = await getPatientReports(patientId);
//       setReports(data);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to load reports.");
//     } finally {
//       setLoadingReports(false);
//     }
//   }

//   async function openReport(reportId: string) {
//   try {
//     const data = await getReport(reportId);

//     setSelectedReport(data);
//     setSelectedReportId(reportId);

//     const rawContent =
//       data.physician_edited_content ||
//       data.finalized_content ||
//       data.ai_draft ||
//       "";

//     let formattedContent = rawContent;

//     try {
//       const fixedJson = rawContent.replaceAll("'", '"');
//       const parsed = JSON.parse(fixedJson);

//       const structured = parsed.structured_data || parsed;

//       if (structured.message && structured.preview) {
//         formattedContent =
//           `${structured.message}\n\n` +
//           `==============================\n` +
//           `EXTRACTED TEXT PREVIEW\n` +
//           `==============================\n\n` +
//           structured.preview;
//       } else {
//         formattedContent = JSON.stringify(structured, null, 2);
//       }
//     } catch {
//       formattedContent = rawContent;
//     }

//     setEditorContent(formattedContent);
//   } catch (error) {
//     console.error(error);
//     alert("Failed to open report.");
//   }
// }

// useEffect(() => {
//   loadPatients();
// }, []);

// useEffect(() => {
//   setSelectedReport(null);
//   setSelectedReportId("");
//   setEditorContent("");
//   loadReports(selectedPatientId);
// }, [selectedPatientId]);

//   async function saveEdits() {
//     if (!selectedReport) return;

//     setSaving(true);

//     try {
//       await editReport(selectedReport.id, editorContent);
//       alert("Report edits saved.");
//       await openReport(selectedReport.id);
//       await loadReports(selectedPatientId);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to save report edits.");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function approveSelectedReport() {
//     if (!selectedReport) return;

//     const confirmed = confirm(
//       "Approve and finalize this report? This will create a digital signature."
//     );

//     if (!confirmed) return;

//     setSaving(true);

//     try {
//       await editReport(selectedReport.id, editorContent);
//       await approveReport(selectedReport.id, true);
//       alert("Report approved and finalized.");
//       await openReport(selectedReport.id);
//       await loadReports(selectedPatientId);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to approve report.");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function rejectSelectedReport() {
//     if (!selectedReport) return;

//     if (!rejectReason.trim()) {
//       alert("Please enter a rejection reason.");
//       return;
//     }

//     setSaving(true);

//     try {
//       await approveReport(selectedReport.id, false, rejectReason);
//       alert("Report rejected.");
//       setRejectReason("");
//       await openReport(selectedReport.id);
//       await loadReports(selectedPatientId);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to reject report.");
//     } finally {
//       setSaving(false);
//     }
//   }

//   const selectedPatient = patients.find((p) => p.id === selectedPatientId);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-4xl font-bold text-slate-900">
//           Review & Approve
//         </h1>
//         <p className="mt-2 text-slate-500">
//           Physician review workflow for AI-generated reports.
//         </p>
//       </div>

//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <label className="mb-2 block text-sm font-medium text-slate-600">
//           Select Patient
//         </label>

//         <select
//           value={selectedPatientId}
//           onChange={(e) => setSelectedPatientId(e.target.value)}
//           className="w-full rounded-xl border p-3"
//         >
//           <option value="">Choose patient...</option>

//           {patients.map((patient) => (
//             <option key={patient.id} value={patient.id}>
//               {patient.first_name_encrypted} {patient.last_name_encrypted} —{" "}
//               {patient.mrn}
//             </option>
//           ))}
//         </select>

//         {selectedPatient && (
//           <div className="mt-5 rounded-2xl bg-slate-50 p-4">
//             <p className="font-semibold text-slate-900">
//               {selectedPatient.first_name_encrypted}{" "}
//               {selectedPatient.last_name_encrypted}
//             </p>
//             <p className="mt-1 text-sm text-slate-500">
//               MRN: {selectedPatient.mrn} • Patient ID: {selectedPatient.id}
//             </p>
//           </div>
//         )}
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-1">
//           <h2 className="text-xl font-bold text-slate-900">Reports</h2>
//           <p className="mt-1 text-sm text-slate-500">
//             Reports created from AI extractions.
//           </p>

//           <div className="mt-5 space-y-3">
//             {loadingReports ? (
//               <p className="text-sm text-slate-500">Loading reports...</p>
//             ) : reports.length === 0 ? (
//               <div className="rounded-xl border border-dashed p-6 text-center text-slate-500">
//                 No reports found for this patient yet.
//               </div>
//             ) : (
//               reports.map((report) => (
//                 <button
//                   key={report.id}
//                   onClick={() => openReport(report.id)}
//                   className={`w-full rounded-xl border p-4 text-left transition ${
//                     selectedReportId === report.id
//                       ? "border-blue-500 bg-blue-50"
//                       : "hover:bg-slate-50"
//                   }`}
//                 >
//                   <p className="font-semibold capitalize text-slate-900">
//                     {report.report_type.replaceAll("_", " ")}
//                   </p>

//                   <p className="mt-1 text-sm text-slate-500">
//                     Status: {report.report_status}
//                   </p>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Created: {new Date(report.created_at).toLocaleString()}
//                   </p>
//                 </button>
//               ))
//             )}
//           </div>
//         </div>

//         <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
//           {!selectedReport ? (
//             <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed">
//               <p className="text-slate-500">
//                 Select a report to review and approve.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-5">
//               <div className="flex flex-wrap items-start justify-between gap-4">
//                 <div>
//                   <h2 className="text-2xl font-bold text-slate-900 capitalize">
//                     {selectedReport.report_type.replaceAll("_", " ")}
//                   </h2>

//                   <p className="mt-1 text-sm text-slate-500">
//                     Status: {selectedReport.report_status}
//                   </p>

//                   {selectedReport.digital_signature && (
//                     <p className="mt-1 text-xs text-slate-500">
//                       Digital Signature: {selectedReport.digital_signature}
//                     </p>
//                   )}
//                 </div>

//                 <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
//                   {selectedReport.report_status}
//                 </span>
//               </div>

//               <textarea
//                 value={editorContent}
//                 onChange={(e) => setEditorContent(e.target.value)}
//                 disabled={selectedReport.report_status === "finalized"}
//                 className="min-h-[420px] w-full rounded-xl border p-4 font-mono text-sm disabled:bg-slate-100"
//                 placeholder="Report content will appear here..."
//               />

//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={saveEdits}
//                   disabled={saving || selectedReport.report_status === "finalized"}
//                   className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {saving ? "Saving..." : "Save Edits"}
//                 </button>

//                 <button
//                   onClick={approveSelectedReport}
//                   disabled={saving || selectedReport.report_status === "finalized"}
//                   className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
//                 >
//                   Approve & Finalize
//                 </button>
//               </div>

//               <div className="rounded-2xl border bg-slate-50 p-4">
//                 <label className="mb-2 block text-sm font-medium text-slate-600">
//                   Rejection Reason
//                 </label>

//                 <textarea
//                   value={rejectReason}
//                   onChange={(e) => setRejectReason(e.target.value)}
//                   className="min-h-24 w-full rounded-xl border p-3"
//                   placeholder="Explain why this report is rejected..."
//                 />

//                 <button
//                   onClick={rejectSelectedReport}
//                   disabled={saving || selectedReport.report_status === "finalized"}
//                   className="mt-3 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
//                 >
//                   Reject Report
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { approveReport, editReport, getPatientReports, getPatients, getReport } from "@/lib/api";

type Patient = { id: string; first_name_encrypted: string; last_name_encrypted: string; mrn: string; };
type ReportListItem = { id: string; report_type: string; report_status: string; approved_at?: string | null; created_at: string; };
type ReportDetail = { id: string; patient_id: string; report_type: string; ai_draft?: string | null; physician_edited_content?: string | null; finalized_content?: string | null; report_status: string; digital_signature?: string | null; approved_at?: string | null; };

export default function ReviewPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [loadingReports, setLoadingReports] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function loadPatients() {
    try { const data = await getPatients(); setPatients(data); }
    catch (error) { console.error(error); alert("Failed to load patients."); }
  }

  async function loadReports(patientId: string) {
    if (!patientId) { setReports([]); return; }
    setLoadingReports(true);
    try { const data = await getPatientReports(patientId); setReports(data); }
    catch (error) { console.error(error); alert("Failed to load reports."); }
    finally { setLoadingReports(false); }
  }

  async function openReport(reportId: string) {
    try {
      const data = await getReport(reportId);
      setSelectedReport(data);
      setSelectedReportId(reportId);
      const rawContent = data.physician_edited_content || data.finalized_content || data.ai_draft || "";
      let formattedContent = rawContent;
      try {
        const parsed = JSON.parse(rawContent.replaceAll("'", '"'));
        const structured = parsed.structured_data || parsed;
        if (structured.message && structured.preview) {
          formattedContent = `${structured.message}\n\n==============================\nEXTRACTED TEXT PREVIEW\n==============================\n\n${structured.preview}`;
        } else {
          formattedContent = JSON.stringify(structured, null, 2);
        }
      } catch { formattedContent = rawContent; }
      setEditorContent(formattedContent);
    } catch (error) { console.error(error); alert("Failed to open report."); }
  }

  useEffect(() => { loadPatients(); }, []);
  useEffect(() => {
    setSelectedReport(null); setSelectedReportId(""); setEditorContent("");
    loadReports(selectedPatientId);
  }, [selectedPatientId]);

  async function saveEdits() {
    if (!selectedReport) return;
    setSaving(true);
    try { await editReport(selectedReport.id, editorContent); alert("Report edits saved."); await openReport(selectedReport.id); await loadReports(selectedPatientId); }
    catch (error) { console.error(error); alert("Failed to save report edits."); }
    finally { setSaving(false); }
  }

  async function approveSelectedReport() {
    if (!selectedReport) return;
    if (!confirm("Approve and finalize this report? This will create a digital signature.")) return;
    setSaving(true);
    try { await editReport(selectedReport.id, editorContent); await approveReport(selectedReport.id, true); alert("Report approved and finalized."); await openReport(selectedReport.id); await loadReports(selectedPatientId); }
    catch (error) { console.error(error); alert("Failed to approve report."); }
    finally { setSaving(false); }
  }

  async function rejectSelectedReport() {
    if (!selectedReport) return;
    if (!rejectReason.trim()) { alert("Please enter a rejection reason."); return; }
    setSaving(true);
    try { await approveReport(selectedReport.id, false, rejectReason); alert("Report rejected."); setRejectReason(""); await openReport(selectedReport.id); await loadReports(selectedPatientId); }
    catch (error) { console.error(error); alert("Failed to reject report."); }
    finally { setSaving(false); }
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
          Review & Approve
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:mt-2">
          Physician review workflow for AI-generated reports.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <label className="mb-2 block text-sm font-medium text-slate-600">
          Select Patient
        </label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full rounded-xl border p-3 text-sm"
        >
          <option value="">Choose patient...</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.first_name_encrypted} {patient.last_name_encrypted} — {patient.mrn}
            </option>
          ))}
        </select>
        {selectedPatient && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 sm:mt-5">
            <p className="font-semibold text-slate-900">
              {selectedPatient.first_name_encrypted} {selectedPatient.last_name_encrypted}
            </p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              MRN: {selectedPatient.mrn} • ID: {selectedPatient.id}
            </p>
          </div>
        )}
      </div>

      {/* Reports list + editor. Stack on mobile, side-by-side on lg */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report list */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Reports</h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Reports created from AI extractions.
          </p>
          <div className="mt-4 space-y-3 sm:mt-5">
            {loadingReports ? (
              <p className="text-sm text-slate-500">Loading reports...</p>
            ) : reports.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                No reports found for this patient yet.
              </div>
            ) : (
              reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => openReport(report.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedReportId === report.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-semibold capitalize text-slate-900">
                    {report.report_type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Status: {report.report_status}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Created: {new Date(report.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor panel */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          {!selectedReport ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed sm:min-h-96">
              <p className="text-sm text-slate-500">
                Select a report to review and approve.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <h2 className="text-xl font-bold capitalize text-slate-900 sm:text-2xl">
                    {selectedReport.report_type.replaceAll("_", " ")}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Status: {selectedReport.report_status}
                  </p>
                  {selectedReport.digital_signature && (
                    <p className="mt-1 break-all text-xs text-slate-500">
                      Signature: {selectedReport.digital_signature}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  {selectedReport.report_status}
                </span>
              </div>

              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                disabled={selectedReport.report_status === "finalized"}
                className="min-h-64 w-full rounded-xl border p-4 font-mono text-sm disabled:bg-slate-100 sm:min-h-[420px]"
                placeholder="Report content will appear here..."
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <button
                  onClick={saveEdits}
                  disabled={saving || selectedReport.report_status === "finalized"}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
                >
                  {saving ? "Saving..." : "Save Edits"}
                </button>
                <button
                  onClick={approveSelectedReport}
                  disabled={saving || selectedReport.report_status === "finalized"}
                  className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50 sm:w-auto"
                >
                  Approve & Finalize
                </button>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-24 w-full rounded-xl border p-3 text-sm"
                  placeholder="Explain why this report is rejected..."
                />
                <button
                  onClick={rejectSelectedReport}
                  disabled={saving || selectedReport.report_status === "finalized"}
                  className="mt-3 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50 sm:w-auto"
                >
                  Reject Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
