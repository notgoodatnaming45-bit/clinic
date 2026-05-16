// // "use client";

// // import { useEffect, useState } from "react";
// // import { getPatients, getPatientDocuments, uploadDocument } from "@/lib/api";

// // type Patient = {
// //   id: string;
// //   first_name_encrypted: string;
// //   last_name_encrypted: string;
// //   mrn: string;
// // };

// // type DocumentItem = {
// //   id: string;
// //   patient_id: string;
// //   filename: string;
// //   file_type: string;
// //   file_size_bytes?: number;
// //   doc_status: string;
// //   provider_name?: string;
// //   document_date?: string;
// //   created_at: string;
// // };

// // export default function DocumentsPage() {
// //   const [patients, setPatients] = useState<Patient[]>([]);
// //   const [documents, setDocuments] = useState<DocumentItem[]>([]);
// //   const [selectedPatientId, setSelectedPatientId] = useState("");
// //   const [uploading, setUploading] = useState(false);
// //   const [loadingDocs, setLoadingDocs] = useState(false);
// //   const [search, setSearch] = useState("");

// //   async function loadPatients() {
// //     try {
// //       const data = await getPatients();
// //       setPatients(data);
// //     } catch (error) {
// //       console.error(error);
// //       alert("Failed to load patients.");
// //     }
// //   }

// //   async function loadDocuments(patientId: string) {
// //     if (!patientId) return;

// //     setLoadingDocs(true);

// //     try {
// //       const data = await getPatientDocuments(patientId);
// //       setDocuments(data);
// //     } catch (error) {
// //       console.error(error);
// //       alert("Failed to load documents.");
// //     } finally {
// //       setLoadingDocs(false);
// //     }
// //   }

// //   useEffect(() => {
// //     loadPatients();
// //   }, []);

// //   useEffect(() => {
// //     if (selectedPatientId) {
// //       loadDocuments(selectedPatientId);
// //     }
// //   }, [selectedPatientId]);

// //   async function handleUpload(
// //     e: React.ChangeEvent<HTMLInputElement>
// //   ) {
// //     const files = Array.from(e.target.files || []);

// //     if (!selectedPatientId) {
// //       alert("Select a patient first.");
// //       return;
// //     }

// //     if (files.length === 0) return;

// //     setUploading(true);

// //     try {
// //       for (const file of files) {
// //         await uploadDocument(selectedPatientId, file);
// //       }

// //       await loadDocuments(selectedPatientId);

// //       alert("Documents uploaded successfully.");
// //     } catch (error) {
// //       console.error(error);
// //       alert("Failed to upload documents.");
// //     } finally {
// //       setUploading(false);
// //       e.target.value = "";
// //     }
// //   }

// //   const filteredDocs = documents.filter((doc) =>
// //     doc.filename.toLowerCase().includes(search.toLowerCase())
// //   );

// //   const selectedPatient = patients.find(
// //     (p) => p.id === selectedPatientId
// //   );

// //   return (
// //     <div className="space-y-6">
// //       <div>
// //         <h1 className="text-4xl font-bold text-slate-900">
// //           Documents
// //         </h1>

// //         <p className="mt-2 text-slate-500">
// //           PostgreSQL-backed document management and uploads.
// //         </p>
// //       </div>

// //       <div className="rounded-2xl border bg-white p-6 shadow-sm">
// //         <div className="grid gap-4 md:grid-cols-2">
// //           <div>
// //             <label className="mb-2 block text-sm font-medium text-slate-600">
// //               Select Patient
// //             </label>

// //             <select
// //               value={selectedPatientId}
// //               onChange={(e) => setSelectedPatientId(e.target.value)}
// //               className="w-full rounded-xl border p-3"
// //             >
// //               <option value="">Choose patient...</option>

// //               {patients.map((patient) => (
// //                 <option key={patient.id} value={patient.id}>
// //                   {patient.first_name_encrypted}{" "}
// //                   {patient.last_name_encrypted} — {patient.mrn}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           <div>
// //             <label className="mb-2 block text-sm font-medium text-slate-600">
// //               Upload Documents
// //             </label>

// //             <input
// //               type="file"
// //               multiple
// //               onChange={handleUpload}
// //               disabled={!selectedPatientId || uploading}
// //               className="w-full rounded-xl border p-3"
// //             />
// //           </div>
// //         </div>

// //         {selectedPatient && (
// //           <div className="mt-5 rounded-2xl bg-slate-50 p-4">
// //             <p className="font-semibold text-slate-900">
// //               {selectedPatient.first_name_encrypted}{" "}
// //               {selectedPatient.last_name_encrypted}
// //             </p>

// //             <p className="mt-1 text-sm text-slate-500">
// //               MRN: {selectedPatient.mrn}
// //             </p>
// //           </div>
// //         )}
// //       </div>

// //       <div className="rounded-2xl border bg-white p-6 shadow-sm">
// //         <div className="flex flex-wrap items-center justify-between gap-4">
// //           <div>
// //             <h2 className="text-xl font-bold text-slate-900">
// //               Uploaded Documents
// //             </h2>

// //             <p className="mt-1 text-sm text-slate-500">
// //               Real backend document records from PostgreSQL.
// //             </p>
// //           </div>

// //           <input
// //             className="w-72 rounded-xl border p-3"
// //             placeholder="Search documents..."
// //             value={search}
// //             onChange={(e) => setSearch(e.target.value)}
// //           />
// //         </div>

// //         <div className="mt-6 overflow-hidden rounded-2xl border">
// //           <table className="w-full text-left">
// //             <thead className="bg-slate-50 text-sm text-slate-500">
// //               <tr>
// //                 <th className="p-4">File</th>
// //                 <th className="p-4">Type</th>
// //                 <th className="p-4">Size</th>
// //                 <th className="p-4">Status</th>
// //                 <th className="p-4">Uploaded</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {loadingDocs ? (
// //                 <tr>
// //                   <td colSpan={5} className="p-8 text-center text-slate-500">
// //                     Loading documents...
// //                   </td>
// //                 </tr>
// //               ) : filteredDocs.length === 0 ? (
// //                 <tr>
// //                   <td colSpan={5} className="p-8 text-center text-slate-500">
// //                     No documents found.
// //                   </td>
// //                 </tr>
// //               ) : (
// //                 filteredDocs.map((doc) => (
// //                   <tr
// //                     key={doc.id}
// //                     className="border-t hover:bg-slate-50"
// //                   >
// //                     <td className="p-4">
// //                       <p className="font-semibold text-slate-900">
// //                         {doc.filename}
// //                       </p>

// //                       <p className="mt-1 text-xs text-slate-500">
// //                         Document ID: {doc.id}
// //                       </p>
// //                     </td>

// //                     <td className="p-4 capitalize">
// //                       {doc.file_type}
// //                     </td>

// //                     <td className="p-4">
// //                       {doc.file_size_bytes
// //                         ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB`
// //                         : "-"}
// //                     </td>

// //                     <td className="p-4">
// //                       <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
// //                         {doc.doc_status}
// //                       </span>
// //                     </td>

// //                     <td className="p-4 text-sm text-slate-500">
// //                       {new Date(doc.created_at).toLocaleString()}
// //                     </td>
// //                   </tr>
// //                 ))
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import {
//   getDocumentDownloadUrl,
//   getPatientDocuments,
//   getPatients,
//   uploadDocument,
// } from "@/lib/api";

// type Patient = {
//   id: string;
//   first_name_encrypted: string;
//   last_name_encrypted: string;
//   mrn: string;
// };

// type DocumentItem = {
//   id: string;
//   patient_id: string;
//   filename: string;
//   file_type: string;
//   file_size_bytes?: number;
//   doc_status: string;
//   provider_name?: string;
//   document_date?: string;
//   created_at: string;
// };

// export default function DocumentsPage() {
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [documents, setDocuments] = useState<DocumentItem[]>([]);
//   const [selectedPatientId, setSelectedPatientId] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [loadingDocs, setLoadingDocs] = useState(false);
//   const [search, setSearch] = useState("");

//   async function loadPatients() {
//     try {
//       const data = await getPatients();
//       setPatients(data);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to load patients.");
//     }
//   }

//   async function loadDocuments(patientId: string) {
//     if (!patientId) {
//       setDocuments([]);
//       return;
//     }

//     setLoadingDocs(true);

//     try {
//       const data = await getPatientDocuments(patientId);
//       setDocuments(data);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to load documents.");
//     } finally {
//       setLoadingDocs(false);
//     }
//   }

//   useEffect(() => {
//     loadPatients();
//   }, []);

//   useEffect(() => {
//     loadDocuments(selectedPatientId);
//   }, [selectedPatientId]);

//   async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
//     const files = Array.from(e.target.files || []);

//     if (!selectedPatientId) {
//       alert("Select a patient first.");
//       return;
//     }

//     if (files.length === 0) return;

//     setUploading(true);

//     try {
//       for (const file of files) {
//         await uploadDocument(selectedPatientId, file);
//       }

//       await loadDocuments(selectedPatientId);
//       alert("Documents uploaded successfully.");
//     } catch (error) {
//       console.error(error);
//       alert("Failed to upload documents.");
//     } finally {
//       setUploading(false);
//       e.target.value = "";
//     }
//   }

//   const selectedPatient = patients.find((p) => p.id === selectedPatientId);

//   const filteredDocs = documents.filter((doc) =>
//     doc.filename.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-4xl font-bold text-slate-900">Documents</h1>
//         <p className="mt-2 text-slate-500">
//           Upload, view, and manage real backend documents.
//         </p>
//       </div>

//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <div className="grid gap-4 md:grid-cols-2">
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-600">
//               Select Patient
//             </label>

//             <select
//               value={selectedPatientId}
//               onChange={(e) => setSelectedPatientId(e.target.value)}
//               className="w-full rounded-xl border p-3"
//             >
//               <option value="">Choose patient...</option>

//               {patients.map((patient) => (
//                 <option key={patient.id} value={patient.id}>
//                   {patient.first_name_encrypted}{" "}
//                   {patient.last_name_encrypted} — {patient.mrn}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-600">
//               Upload Documents
//             </label>

//             <input
//               type="file"
//               multiple
//               onChange={handleUpload}
//               disabled={!selectedPatientId || uploading}
//               className="w-full rounded-xl border p-3"
//             />
//           </div>
//         </div>

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

//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <h2 className="text-xl font-bold text-slate-900">
//               Uploaded Documents
//             </h2>
//             <p className="mt-1 text-sm text-slate-500">
//               {selectedPatientId
//                 ? "Documents linked to the selected patient."
//                 : "Select a patient to view documents."}
//             </p>
//           </div>

//           <input
//             className="w-72 rounded-xl border p-3"
//             placeholder="Search documents..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <div className="mt-6 overflow-hidden rounded-2xl border">
//           <table className="w-full text-left">
//             <thead className="bg-slate-50 text-sm text-slate-500">
//               <tr>
//                 <th className="p-4">File</th>
//                 <th className="p-4">Type</th>
//                 <th className="p-4">Size</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Uploaded</th>
//                 <th className="p-4">Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loadingDocs ? (
//                 <tr>
//                   <td colSpan={6} className="p-8 text-center text-slate-500">
//                     Loading documents...
//                   </td>
//                 </tr>
//               ) : filteredDocs.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="p-8 text-center text-slate-500">
//                     No documents found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredDocs.map((doc) => (
//                   <tr key={doc.id} className="border-t hover:bg-slate-50">
//                     <td className="p-4">
//                       <p className="font-semibold text-slate-900">
//                         {doc.filename}
//                       </p>
//                       <p className="mt-1 text-xs text-slate-500">
//                         Document ID: {doc.id}
//                       </p>
//                     </td>

//                     <td className="p-4 capitalize">{doc.file_type}</td>

//                     <td className="p-4">
//                       {doc.file_size_bytes
//                         ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB`
//                         : "-"}
//                     </td>

//                     <td className="p-4">
//                       <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
//                         {doc.doc_status}
//                       </span>
//                     </td>

//                     <td className="p-4 text-sm text-slate-500">
//                       {new Date(doc.created_at).toLocaleString()}
//                     </td>

//                     <td className="p-4">
//                       <a
//                         href={getDocumentDownloadUrl(doc.id)}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="font-semibold text-blue-600 hover:text-blue-800"
//                       >
//                         View / Download
//                       </a>
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
import {
  getDocumentDownloadUrl,
  getPatientDocuments,
  getPatients,
  uploadDocument,
} from "@/lib/api";

type Patient = {
  id: string;
  first_name_encrypted: string;
  last_name_encrypted: string;
  mrn: string;
};

type DocumentItem = {
  id: string;
  patient_id: string;
  filename: string;
  file_type: string;
  file_size_bytes?: number;
  doc_status: string;
  provider_name?: string;
  document_date?: string;
  created_at: string;
};

export default function DocumentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [search, setSearch] = useState("");

  async function loadPatients() {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load patients.");
    }
  }

  async function loadDocuments(patientId: string) {
    if (!patientId) {
      setDocuments([]);
      return;
    }
    setLoadingDocs(true);
    try {
      const data = await getPatientDocuments(patientId);
      setDocuments(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load documents.");
    } finally {
      setLoadingDocs(false);
    }
  }

  useEffect(() => { loadPatients(); }, []);
  useEffect(() => { loadDocuments(selectedPatientId); }, [selectedPatientId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!selectedPatientId) { alert("Select a patient first."); return; }
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        await uploadDocument(selectedPatientId, file);
      }
      await loadDocuments(selectedPatientId);
      alert("Documents uploaded successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to upload documents.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
          Documents
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:mt-2">
          Upload, view, and manage real backend documents.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
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
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Upload Documents
            </label>
            <input
              type="file"
              multiple
              onChange={handleUpload}
              disabled={!selectedPatientId || uploading}
              className="w-full rounded-xl border p-3 text-sm"
            />
          </div>
        </div>

        {selectedPatient && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 sm:mt-5">
            <p className="font-semibold text-slate-900">
              {selectedPatient.first_name_encrypted} {selectedPatient.last_name_encrypted}
            </p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              MRN: {selectedPatient.mrn} • Patient ID: {selectedPatient.id}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Uploaded Documents
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {selectedPatientId
                ? "Documents linked to the selected patient."
                : "Select a patient to view documents."}
            </p>
          </div>
          <input
            className="w-full rounded-xl border p-2.5 text-sm sm:w-64 sm:p-3"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border sm:mt-6">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 sm:p-4">File</th>
                <th className="p-3 sm:p-4">Type</th>
                <th className="p-3 sm:p-4">Size</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4">Uploaded</th>
                <th className="p-3 sm:p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingDocs ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading documents...
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 sm:p-4">
                      <p className="font-semibold text-slate-900">{doc.filename}</p>
                      <p className="mt-0.5 text-xs text-slate-500">ID: {doc.id}</p>
                    </td>
                    <td className="p-3 capitalize sm:p-4">{doc.file_type}</td>
                    <td className="p-3 sm:p-4">
                      {doc.file_size_bytes
                        ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB`
                        : "-"}
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                        {doc.doc_status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500 sm:p-4">
                      {new Date(doc.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 sm:p-4">
                      <a
                        href={getDocumentDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View
                      </a>
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