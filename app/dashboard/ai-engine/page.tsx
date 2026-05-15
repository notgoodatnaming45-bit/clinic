// "use client";

// import { useState } from "react";

// export default function AIEnginePage() {
//   const [input, setInput] = useState("");
//   const [output, setOutput] = useState("");

//   function analyze() {
//     setOutput(`AI Extraction Preview

// Key markers:
// • GCS / neurological findings check
// • Symptom progression
// • Imaging and outside-provider records
// • Neuropsychological test references

// Clinical synthesis:
// The record suggests post-traumatic symptoms requiring physician verification.

// Legal-medical note:
// Causality and impairment wording must be reviewed before finalization.

// Source:
// ${input || "No source text entered."}`);
//   }

//   return (
//     <div className="space-y-6 p-8">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">AI Engine</h1>
//         <p className="text-gray-500">Extract clinical details and prepare physician-review drafts.</p>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <h2 className="text-xl font-bold">Source Text</h2>
//           <textarea className="mt-4 min-h-80 w-full rounded-xl border p-4" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste clinical note or document text..." />
//           <button onClick={analyze} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Run Analysis</button>
//         </div>

//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <h2 className="text-xl font-bold">AI Output</h2>
//           <pre className="mt-4 min-h-80 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-700">{output || "AI output will appear here."}</pre>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

type Patient = {
  id: string;
  name: string;
  mrn: string;
};

type DocumentItem = {
  id: string;
  fileName: string;
  patientId: string;
  patientName: string;
  category: string;
  status: string;
  extractedText?: string;
  extracted_text?: string;
  aiSummary?: string;
  findings?: string[];
};

type AIResult = {
  patient_id: string;
  patient_name: string;
  analysis_type: string;
  generated_at: string;
  summary: string;
  findings: string[];
  missing_information: string[];
  recommendations: string[];
  review_required: boolean;
};

export default function AIEnginePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState("Clinical Summary");
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPatients(JSON.parse(localStorage.getItem("patients") || "[]"));
    setDocuments(JSON.parse(localStorage.getItem("documents") || "[]"));
  }, []);

  const patientDocs = documents.filter(
    (doc) => doc.patientId === selectedPatientId
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  function toggleDocument(id: string) {
    setSelectedDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function addAuditLog(action: string) {
    const existing = JSON.parse(localStorage.getItem("auditLogs") || "[]");

    const log = {
      id: Date.now().toString(),
      time: new Date().toLocaleString(),
      user: "Admin User",
      action,
      route: "/dashboard/ai-engine",
      status: "Success",
    };

    localStorage.setItem("auditLogs", JSON.stringify([log, ...existing]));
  }

  async function runAnalysis() {
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }

    const selectedDocs = documents.filter((doc) =>
      selectedDocumentIds.includes(doc.id)
    );

    if (selectedDocs.length === 0) {
      alert("Please select at least one document.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${apiUrl}/api/v1/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.name,
          analysis_type: analysisType,
          documents: selectedDocs,
        }),
      });

      if (!response.ok) {
        throw new Error("AI backend request failed.");
      }

      const data: AIResult = await response.json();
      setResult(data);

      const existing = JSON.parse(localStorage.getItem("aiResults") || "[]");
      localStorage.setItem("aiResults", JSON.stringify([data, ...existing]));

      addAuditLog(`AI analysis generated for ${selectedPatient.name}`);
    } catch (error) {
      alert("AI analysis failed. Make sure backend is running.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function sendToReview() {
    if (!result) return;

    const existing = JSON.parse(localStorage.getItem("reviewQueue") || "[]");

    const reviewItem = {
      id: Date.now().toString(),
      patientId: result.patient_id,
      patientName: result.patient_name,
      analysisType: result.analysis_type,
      summary: result.summary,
      findings: result.findings,
      missingInformation: result.missing_information,
      recommendations: result.recommendations,
      status: "Pending Physician Review",
      createdAt: new Date().toLocaleString(),
    };

    localStorage.setItem("reviewQueue", JSON.stringify([reviewItem, ...existing]));
    addAuditLog(`Sent AI result to physician review for ${result.patient_name}`);

    alert("Sent to Physician Review.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">AI Engine</h1>
        <p className="mt-2 text-slate-500">
          Analyze patient documents, extract TBI markers, identify missing information, and prepare review-ready output.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">1. Select Patient</h2>

          <select
            className="mt-4 w-full rounded-xl border p-3"
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setSelectedDocumentIds([]);
              setResult(null);
            }}
          >
            <option value="">Choose patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} — {patient.mrn}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">2. Analysis Type</h2>

          <select
            className="mt-4 w-full rounded-xl border p-3"
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
          >
            <option>Clinical Summary</option>
            <option>TBI Marker Extraction</option>
            <option>Legal-Medical Draft</option>
            <option>Missing Information Check</option>
          </select>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">3. Run AI</h2>

          <button
            onClick={runAnalysis}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Patient Documents</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select documents to include in this AI analysis.
        </p>

        <div className="mt-5 space-y-3">
          {!selectedPatientId ? (
            <p className="rounded-xl bg-slate-50 p-4 text-slate-500">
              Select a patient first.
            </p>
          ) : patientDocs.length === 0 ? (
            <p className="rounded-xl bg-orange-50 p-4 text-orange-700">
              No documents found for this patient. Upload documents first.
            </p>
          ) : (
            patientDocs.map((doc) => (
              <label
                key={doc.id}
                className="flex cursor-pointer items-start gap-4 rounded-xl border p-4 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedDocumentIds.includes(doc.id)}
                  onChange={() => toggleDocument(doc.id)}
                  className="mt-1"
                />

                <div>
                  <p className="font-semibold text-slate-900">{doc.fileName}</p>
                  <p className="text-sm text-slate-500">
                    {doc.category} • {doc.status}
                  </p>

                  {(doc.extractedText || doc.extracted_text) ? (
                    <p className="mt-2 text-sm text-green-700">
                      Extracted text available.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-orange-700">
                      No extracted text available.
                    </p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {result && (
        <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                AI Analysis Result
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {result.analysis_type} • {new Date(result.generated_at).toLocaleString()}
              </p>
            </div>

            <button
              onClick={sendToReview}
              className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              Send to Review
            </button>
          </div>

          <div className="rounded-xl bg-blue-50 p-5">
            <h3 className="font-bold text-blue-900">Summary</h3>
            <p className="mt-2 text-blue-800">{result.summary}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border p-5">
              <h3 className="font-bold text-slate-900">Findings</h3>
              <div className="mt-3 space-y-2">
                {result.findings.length === 0 ? (
                  <p className="text-sm text-slate-500">No markers detected.</p>
                ) : (
                  result.findings.map((item) => (
                    <p key={item} className="rounded-lg bg-green-50 p-2 text-sm text-green-700">
                      {item}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border p-5">
              <h3 className="font-bold text-slate-900">Missing Information</h3>
              <div className="mt-3 space-y-2">
                {result.missing_information.map((item) => (
                  <p key={item} className="rounded-lg bg-orange-50 p-2 text-sm text-orange-700">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-5">
              <h3 className="font-bold text-slate-900">Recommendations</h3>
              <div className="mt-3 space-y-2">
                {result.recommendations.map((item) => (
                  <p key={item} className="rounded-lg bg-slate-50 p-2 text-sm text-slate-700">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            Physician review is required. AI output is not a final medical or legal opinion.
          </div>
        </div>
      )}
    </div>
  );
}