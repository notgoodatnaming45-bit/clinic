// "use client";

// import { useEffect, useState } from "react";

// type Patient = {
//   id: string;
//   name: string;
//   mrn: string;
// };

// type DocumentItem = {
//   id: string;
//   fileName: string;
//   patientId: string;
//   patientName: string;
//   category: string;
//   status: "Uploaded" | "AI Processed";
//   uploadedBy: string;
//   uploadedAt: string;
//   aiSummary: string;
// };

// export default function DocumentsPage() {
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [documents, setDocuments] = useState<DocumentItem[]>([]);
//   const [selectedPatientId, setSelectedPatientId] = useState("");
//   const [category, setCategory] = useState("Imaging");
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     setPatients(JSON.parse(localStorage.getItem("patients") || "[]"));
//     setDocuments(JSON.parse(localStorage.getItem("documents") || "[]"));
//   }, []);

//   function addAuditLog(action: string) {
//     const existing = JSON.parse(localStorage.getItem("auditLogs") || "[]");

//     const newLog = {
//       id: Date.now().toString(),
//       time: new Date().toLocaleString(),
//       user: "Admin User",
//       action,
//       route: "/dashboard/documents",
//       status: "Success",
//     };

//     localStorage.setItem("auditLogs", JSON.stringify([newLog, ...existing]));
//   }

//   function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
//     const files = Array.from(e.target.files || []);

//     if (!selectedPatientId) {
//       alert("Please select a patient first.");
//       return;
//     }

//     if (files.length === 0) return;

//     const patient = patients.find((p) => p.id === selectedPatientId);

//     if (!patient) {
//       alert("Patient not found.");
//       return;
//     }

//     const newDocuments: DocumentItem[] = files.map((file) => ({
//       id: `${Date.now()}-${file.name}`,
//       fileName: file.name,
//       patientId: patient.id,
//       patientName: patient.name,
//       category,
//       status: "Uploaded",
//       uploadedBy: "Admin User",
//       uploadedAt: new Date().toLocaleString(),
//       aiSummary: "",
//     }));

//     const updated = [...newDocuments, ...documents];

//     setDocuments(updated);
//     localStorage.setItem("documents", JSON.stringify(updated));

//     addAuditLog(`Uploaded ${files.length} document(s) for ${patient.name}`);

//     e.target.value = "";
//   }

//   function runAIProcessing(id: string) {
//     const updated: DocumentItem[] = documents.map((doc) =>
//       doc.id === id
//         ? {
//             ...doc,
//             status: "AI Processed",
//             aiSummary:
//               "AI extraction preview: key injury markers, symptom progression, imaging references, and clinical/legal documentation points were identified. Physician review is required before final use.",
//           }
//         : doc
//     );

//     setDocuments(updated);
//     localStorage.setItem("documents", JSON.stringify(updated));
//     addAuditLog("Ran AI processing on document");
//   }

//   function deleteDocument(id: string) {
//     const updated = documents.filter((doc) => doc.id !== id);

//     setDocuments(updated);
//     localStorage.setItem("documents", JSON.stringify(updated));
//     addAuditLog("Deleted document");
//   }

//   const filteredDocuments = documents.filter((doc) => {
//     const text = `${doc.fileName} ${doc.patientName} ${doc.category} ${doc.status}`;
//     return text.toLowerCase().includes(search.toLowerCase());
//   });

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-4xl font-bold text-slate-900">Documents</h1>
//         <p className="mt-2 text-slate-500">
//           Upload, link, categorize, process, and audit patient medical records.
//         </p>
//       </div>

//       <div className="grid gap-6 md:grid-cols-4">
//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="text-sm text-slate-500">Total Documents</p>
//           <h2 className="mt-2 text-3xl font-bold">{documents.length}</h2>
//         </div>

//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="text-sm text-slate-500">AI Processed</p>
//           <h2 className="mt-2 text-3xl font-bold">
//             {documents.filter((doc) => doc.status === "AI Processed").length}
//           </h2>
//         </div>

//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="text-sm text-slate-500">Linked Patients</p>
//           <h2 className="mt-2 text-3xl font-bold">
//             {new Set(documents.map((doc) => doc.patientId)).size}
//           </h2>
//         </div>

//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="text-sm text-slate-500">Pending AI</p>
//           <h2 className="mt-2 text-3xl font-bold">
//             {documents.filter((doc) => doc.status === "Uploaded").length}
//           </h2>
//         </div>
//       </div>

//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <h2 className="text-xl font-bold text-slate-900">Upload Documents</h2>
//         <p className="mt-1 text-sm text-slate-500">
//           Select a patient, choose a category, then upload records.
//         </p>

//         <div className="mt-5 grid gap-4 md:grid-cols-3">
//           <select
//             className="rounded-xl border p-3"
//             value={selectedPatientId}
//             onChange={(e) => setSelectedPatientId(e.target.value)}
//           >
//             <option value="">Select patient</option>
//             {patients.map((patient) => (
//               <option key={patient.id} value={patient.id}>
//                 {patient.name} — {patient.mrn}
//               </option>
//             ))}
//           </select>

//           <select
//             className="rounded-xl border p-3"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//           >
//             <option>Imaging</option>
//             <option>Physician Notes</option>
//             <option>Neuropsychology</option>
//             <option>Insurance</option>
//             <option>Legal</option>
//             <option>Labs</option>
//             <option>AI Drafts</option>
//           </select>

//           <label className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700">
//             Upload Files
//             <input
//               type="file"
//               multiple
//               className="hidden"
//               onChange={handleUpload}
//             />
//           </label>
//         </div>

//         {patients.length === 0 && (
//           <p className="mt-4 rounded-xl bg-orange-50 p-4 text-sm text-orange-700">
//             No patients found. Add a patient first before uploading documents.
//           </p>
//         )}
//       </div>

//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <div className="flex items-center justify-between gap-4">
//           <div>
//             <h2 className="text-xl font-bold text-slate-900">
//               Document Library
//             </h2>
//             <p className="mt-1 text-sm text-slate-500">
//               View linked files, categories, AI status, and audit-ready metadata.
//             </p>
//           </div>

//           <input
//             className="w-72 rounded-xl border p-3"
//             placeholder="Search documents..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <div className="mt-5 overflow-hidden rounded-2xl border">
//           <table className="w-full text-left">
//             <thead className="bg-slate-50 text-sm text-slate-500">
//               <tr>
//                 <th className="p-4">File</th>
//                 <th className="p-4">Patient</th>
//                 <th className="p-4">Category</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Uploaded</th>
//                 <th className="p-4">Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredDocuments.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="p-8 text-center text-slate-500">
//                     No documents uploaded yet.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredDocuments.map((doc) => (
//                   <tr key={doc.id} className="border-t align-top">
//                     <td className="p-4">
//                       <p className="font-semibold text-slate-900">
//                         {doc.fileName}
//                       </p>

//                       {doc.aiSummary && (
//                         <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
//                           {doc.aiSummary}
//                         </p>
//                       )}
//                     </td>

//                     <td className="p-4">{doc.patientName}</td>

//                     <td className="p-4">
//                       <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
//                         {doc.category}
//                       </span>
//                     </td>

//                     <td className="p-4">
//                       <span
//                         className={`rounded-full px-3 py-1 text-sm ${
//                           doc.status === "AI Processed"
//                             ? "bg-green-100 text-green-700"
//                             : "bg-yellow-100 text-yellow-700"
//                         }`}
//                       >
//                         {doc.status}
//                       </span>
//                     </td>

//                     <td className="p-4 text-sm text-slate-500">
//                       <p>{doc.uploadedAt}</p>
//                       <p>{doc.uploadedBy}</p>
//                     </td>

//                     <td className="space-y-2 p-4">
//                       <button
//                         onClick={() => runAIProcessing(doc.id)}
//                         className="block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
//                       >
//                         Run AI
//                       </button>

//                       <button
//                         onClick={() => deleteDocument(doc.id)}
//                         className="block rounded-lg border px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
//                       >
//                         Delete
//                       </button>
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

import { useEffect, useState } from "react";

type Patient = {
  id: string;
  name: string;
  mrn: string;
};

type DocumentItem = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  patientId: string;
  patientName: string;
  category: string;
  status: "Uploaded" | "Processed" | "Needs Backend OCR";
  uploadedBy: string;
  uploadedAt: string;
  extractedText: string;
  aiSummary: string;
  findings: string[];
};

export default function DocumentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [category, setCategory] = useState("Imaging");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPatients(JSON.parse(localStorage.getItem("patients") || "[]"));
    setDocuments(JSON.parse(localStorage.getItem("documents") || "[]"));
  }, []);

  function addAuditLog(action: string) {
    const existing = JSON.parse(localStorage.getItem("auditLogs") || "[]");

    const newLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleString(),
      user: "Admin User",
      action,
      route: "/dashboard/documents",
      status: "Success",
    };

    localStorage.setItem("auditLogs", JSON.stringify([newLog, ...existing]));
  }

  function canReadInBrowser(file: File) {
    return (
      file.type.startsWith("text/") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".json") ||
      file.name.endsWith(".md")
    );
  }

  function analyzeText(text: string) {
    const lower = text.toLowerCase();

    const checks = [
      ["Headache", ["headache", "migraine", "head pain"]],
      ["Dizziness", ["dizziness", "dizzy", "vertigo"]],
      ["Memory Issues", ["memory", "forgetful", "recall"]],
      ["Sleep Disturbance", ["sleep", "insomnia", "fatigue"]],
      ["Loss of Consciousness", ["loss of consciousness", "loc", "unconscious"]],
      ["Nausea", ["nausea", "vomiting"]],
      ["Vision Problems", ["blurred vision", "vision", "photophobia", "light sensitivity"]],
      ["Cognitive Symptoms", ["confusion", "brain fog", "concentration", "attention"]],
      ["Imaging Reference", ["mri", "ct scan", "imaging", "radiology"]],
      ["Legal / Claim Reference", ["attorney", "claim", "insurance", "workers compensation", "case"]],
    ];

    const findings = checks
      .filter(([, words]) => words.some((word) => lower.includes(word)))
      .map(([label]) => label);

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const summary =
      findings.length > 0
        ? `Processed actual document text. Found ${findings.length} relevant item(s): ${findings.join(
            ", "
          )}. Word count: ${wordCount}. Physician review is still required before clinical/legal use.`
        : `Processed actual document text. No obvious TBI markers were detected by the local browser analyzer. Word count: ${wordCount}. Physician review is still required.`;

    return { findings, summary };
  }

  async function readFileText(file: File): Promise<string> {
    return await file.text();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (!selectedPatientId) {
      alert("Please select a patient first.");
      return;
    }

    const patient = patients.find((p) => p.id === selectedPatientId);

    if (!patient) {
      alert("Patient not found.");
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const newDocs: DocumentItem[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/api/v1/documents/process`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      newDocs.push({
        id: `${Date.now()}-${file.name}`,
        fileName: result.file_name,
        fileType: result.file_type,
        fileSize: file.size,
        patientId: patient.id,
        patientName: patient.name,
        category,
        status: result.status === "Processed" ? "Processed" : "Needs Backend OCR",
        uploadedBy: "Admin User",
        uploadedAt: new Date().toLocaleString(),
        extractedText: result.extracted_text,
        aiSummary: result.summary,
        findings: result.findings || [],
      });
  }

    const updated = [...newDocs, ...documents];

    setDocuments(updated);
    localStorage.setItem("documents", JSON.stringify(updated));

    addAuditLog(`Uploaded and backend-processed ${files.length} document(s)`);

    e.target.value = "";
    }

  function reprocessDocument(id: string) {
    const updated = documents.map((doc) => {
      if (doc.id !== id) return doc;

      if (!doc.extractedText) {
        return {
          ...doc,
          status: "Needs Backend OCR" as const,
          aiSummary:
            "No readable browser text found. This document requires backend OCR/parser processing.",
        };
      }

      const analysis = analyzeText(doc.extractedText);

      return {
        ...doc,
        status: "Processed" as const,
        aiSummary: analysis.summary,
        findings: analysis.findings,
      };
    });

    setDocuments(updated);
    localStorage.setItem("documents", JSON.stringify(updated));
    addAuditLog("Reprocessed document text");
  }

  function deleteDocument(id: string) {
    const updated = documents.filter((doc) => doc.id !== id);
    setDocuments(updated);
    localStorage.setItem("documents", JSON.stringify(updated));
    addAuditLog("Deleted document");
  }

  const filteredDocuments = documents.filter((doc) => {
    const text = `${doc.fileName} ${doc.patientName} ${doc.category} ${doc.status} ${doc.aiSummary}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Documents</h1>
        <p className="mt-2 text-slate-500">
          Upload, link, categorize, extract text, analyze findings, and audit patient records.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Documents</p>
          <h2 className="mt-2 text-3xl font-bold">{documents.length}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Processed</p>
          <h2 className="mt-2 text-3xl font-bold">
            {documents.filter((doc) => doc.status === "Processed").length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Needs OCR</p>
          <h2 className="mt-2 text-3xl font-bold">
            {documents.filter((doc) => doc.status === "Needs Backend OCR").length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Linked Patients</p>
          <h2 className="mt-2 text-3xl font-bold">
            {new Set(documents.map((doc) => doc.patientId)).size}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Upload Documents</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <select
            className="rounded-xl border p-3"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} — {patient.mrn}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border p-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Imaging</option>
            <option>Physician Notes</option>
            <option>Neuropsychology</option>
            <option>Insurance</option>
            <option>Legal</option>
            <option>Labs</option>
            <option>AI Drafts</option>
          </select>

          <label className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700">
            Upload Files
            <input type="file" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Browser extraction works for TXT, CSV, JSON, and Markdown. PDF, DOCX, images, and DICOM require backend OCR/parser.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Document Library</h2>
            <p className="mt-1 text-sm text-slate-500">
              View files, extracted text, local findings, and processing status.
            </p>
          </div>

          <input
            className="w-72 rounded-xl border p-3"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="p-4">File</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Findings</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-t align-top">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{doc.fileName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {(doc.fileSize / 1024).toFixed(1)} KB • {doc.fileType}
                      </p>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        {doc.aiSummary}
                      </p>

                      {doc.extractedText && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-semibold text-blue-600">
                            View extracted text
                          </summary>
                          <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-slate-50 p-3 text-xs whitespace-pre-wrap">
                            {doc.extractedText}
                          </pre>
                        </details>
                      )}
                    </td>

                    <td className="p-4">{doc.patientName}</td>

                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        {doc.category}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          doc.status === "Processed"
                            ? "bg-green-100 text-green-700"
                            : doc.status === "Needs Backend OCR"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {(doc.findings || []).length === 0 ? (
                        <span className="text-sm text-slate-400">None detected</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(doc.findings || []).map((finding) => (
                            <span
                              key={finding}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                            >
                              {finding}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="space-y-2 p-4">
                      <button
                        onClick={() => reprocessDocument(doc.id)}
                        className="block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Reprocess
                      </button>

                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="block rounded-lg border px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
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