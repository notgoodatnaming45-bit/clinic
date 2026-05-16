// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   deletePatient,
//   getPatient,
//   getPatientDocuments,
//   updatePatient,
// } from "@/lib/api";

// type Patient = {
//   id: string;
//   first_name_encrypted: string;
//   last_name_encrypted: string;
//   date_of_birth_encrypted: string;
//   mrn: string;
//   injury_date: string | null;
//   case_status: string;
//   priority: string;
//   created_at?: string;
//   updated_at?: string;
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

// export default function PatientDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const patientId = params.id as string;

//   const [patient, setPatient] = useState<Patient | null>(null);
//   const [documents, setDocuments] = useState<DocumentItem[]>([]);
//   const [notes, setNotes] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   async function loadPatient() {
//     try {
//       const data = await getPatient(patientId);
//       setPatient(data);

//       const docs = await getPatientDocuments(patientId);
//       setDocuments(docs);

//       setNotes(localStorage.getItem(`patient-notes-${patientId}`) || "");
//     } catch (error) {
//       console.error(error);
//       alert("Failed to load patient.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadPatient();
//   }, [patientId]);

//   function updateField(field: keyof Patient, value: string) {
//     if (!patient) return;
//     setPatient({ ...patient, [field]: value });
//   }

//   async function savePatient() {
//     if (!patient) return;

//     setSaving(true);

//     try {
//       await updatePatient(patient.id, {
//         first_name: patient.first_name_encrypted,
//         last_name: patient.last_name_encrypted,
//         date_of_birth: patient.date_of_birth_encrypted,
//         mrn: patient.mrn,
//         injury_date: patient.injury_date || "",
//         case_status: patient.case_status,
//         priority: patient.priority,
//       });

//       alert("Patient updated.");
//       await loadPatient();
//     } catch (error) {
//       console.error(error);
//       alert("Failed to update patient.");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function removePatient() {
//     if (!patient) return;

//     const confirmed = confirm(
//       `Delete ${patient.first_name_encrypted} ${patient.last_name_encrypted}? This cannot be undone.`
//     );

//     if (!confirmed) return;

//     try {
//       await deletePatient(patient.id);
//       router.push("/dashboard/patients");
//     } catch (error) {
//       console.error(error);
//       alert("Failed to delete patient.");
//     }
//   }

//   function saveNotes() {
//     localStorage.setItem(`patient-notes-${patientId}`, notes);
//     alert("Notes saved.");
//   }

//   if (loading) {
//     return (
//       <div className="rounded-2xl border bg-white p-8 text-slate-500 shadow-sm">
//         Loading patient...
//       </div>
//     );
//   }

//   if (!patient) {
//     return (
//       <div className="space-y-4">
//         <h1 className="text-3xl font-bold text-slate-900">
//           Patient not found
//         </h1>

//         <Link href="/dashboard/patients" className="text-blue-600">
//           Back to Patients
//         </Link>
//       </div>
//     );
//   }

//   const fullName = `${patient.first_name_encrypted} ${patient.last_name_encrypted}`;

//   return (
//     <div className="space-y-6">
//       <div>
//         <Link
//           href="/dashboard/patients"
//           className="text-sm font-semibold text-blue-600 hover:underline"
//         >
//           ← Back to Patients
//         </Link>

//         <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
//           <div>
//             <h1 className="text-4xl font-bold text-slate-900">{fullName}</h1>

//             <p className="mt-2 text-slate-500">
//               MRN: {patient.mrn} • Patient ID: {patient.id}
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <button
//               onClick={savePatient}
//               disabled={saving}
//               className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>

//             <button
//               onClick={removePatient}
//               className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
//             >
//               Delete Patient
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="grid gap-6 md:grid-cols-4">
//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="text-sm text-slate-500">Status</p>
//           <p className="mt-2 text-2xl font-bold capitalize">
//             {patient.case_status}
//           </p>
//         </div>

//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="text-sm text-slate-500">Priority</p>
//           <p className="mt-2 text-2xl font-bold capitalize">
//             {patient.priority}
//           </p>
//         </div>

//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="text-sm text-slate-500">Documents</p>
//           <p className="mt-2 text-2xl font-bold">{documents.length}</p>
//         </div>

//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <p className="text-sm text-slate-500">Created</p>
//           <p className="mt-2 text-sm font-bold">
//             {patient.created_at
//               ? new Date(patient.created_at).toLocaleDateString()
//               : "-"}
//           </p>
//         </div>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-2">
//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <h2 className="text-xl font-bold text-slate-900">
//             Edit Patient Details
//           </h2>

//           <div className="mt-5 space-y-4">
//             <div className="grid gap-4 md:grid-cols-2">
//               <input
//                 className="rounded-xl border p-3"
//                 value={patient.first_name_encrypted}
//                 onChange={(e) =>
//                   updateField("first_name_encrypted", e.target.value)
//                 }
//                 placeholder="First name"
//               />

//               <input
//                 className="rounded-xl border p-3"
//                 value={patient.last_name_encrypted}
//                 onChange={(e) =>
//                   updateField("last_name_encrypted", e.target.value)
//                 }
//                 placeholder="Last name"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-slate-600">
//                 Date of Birth
//               </label>
//               <input
//                 className="w-full rounded-xl border p-3"
//                 type="date"
//                 value={patient.date_of_birth_encrypted || ""}
//                 onChange={(e) =>
//                   updateField("date_of_birth_encrypted", e.target.value)
//                 }
//               />
//             </div>

//             <input
//               className="w-full rounded-xl border p-3"
//               value={patient.mrn}
//               onChange={(e) => updateField("mrn", e.target.value)}
//               placeholder="MRN / Case number"
//             />

//             <div>
//               <label className="mb-1 block text-sm font-medium text-slate-600">
//                 Injury Date
//               </label>
//               <input
//                 className="w-full rounded-xl border p-3"
//                 type="date"
//                 value={patient.injury_date || ""}
//                 onChange={(e) => updateField("injury_date", e.target.value)}
//               />
//             </div>

//             <select
//               className="w-full rounded-xl border p-3"
//               value={patient.case_status}
//               onChange={(e) => updateField("case_status", e.target.value)}
//             >
//               <option value="intake">Intake</option>
//               <option value="processing">Processing</option>
//               <option value="review">Review</option>
//               <option value="finalized">Finalized</option>
//               <option value="archived">Archived</option>
//             </select>

//             <select
//               className="w-full rounded-xl border p-3"
//               value={patient.priority}
//               onChange={(e) => updateField("priority", e.target.value)}
//             >
//               <option value="routine">Routine</option>
//               <option value="urgent">Urgent</option>
//               <option value="stat">Stat</option>
//             </select>
//           </div>
//         </div>

//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <h2 className="text-xl font-bold text-slate-900">Case Notes</h2>

//           <textarea
//             className="mt-4 min-h-64 w-full rounded-xl border p-4"
//             placeholder="Add physician notes, case updates, review comments, or internal notes..."
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//           />

//           <button
//             onClick={saveNotes}
//             className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
//           >
//             Save Notes
//           </button>

//           <p className="mt-3 text-sm text-slate-500">
//             Notes are still stored locally for now. Next step is moving notes to PostgreSQL.
//           </p>
//         </div>
//       </div>

//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <h2 className="text-xl font-bold text-slate-900">
//               Patient Documents
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Real backend documents linked to this patient.
//             </p>
//           </div>

//           <Link
//             href="/dashboard/documents"
//             className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
//           >
//             Upload Documents
//           </Link>
//         </div>

//         <div className="mt-5 overflow-hidden rounded-2xl border">
//           <table className="w-full text-left">
//             <thead className="bg-slate-50 text-sm text-slate-500">
//               <tr>
//                 <th className="p-4">File</th>
//                 <th className="p-4">Type</th>
//                 <th className="p-4">Size</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Uploaded</th>
//               </tr>
//             </thead>

//             <tbody>
//               {documents.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="p-8 text-center text-slate-500">
//                     No documents linked yet.
//                   </td>
//                 </tr>
//               ) : (
//                 documents.map((doc) => (
//                   <tr key={doc.id} className="border-t align-top">
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
import { useParams, useRouter } from "next/navigation";
import {
  deletePatient,
  getDocumentDownloadUrl,
  getPatient,
  getPatientDocuments,
  updatePatient,
} from "@/lib/api";

type Patient = {
  id: string;
  first_name_encrypted: string;
  last_name_encrypted: string;
  date_of_birth_encrypted: string;
  mrn: string;
  injury_date: string | null;
  case_status: string;
  priority: string;
  case_notes?: string | null;
  created_at?: string;
  updated_at?: string;
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

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  async function loadPatient() {
    setLoading(true);

    try {
      const data = await getPatient(patientId);
      setPatient(data);
      setNotes(data.case_notes || "");

      const docs = await getPatientDocuments(patientId);
      setDocuments(docs);
    } catch (error) {
      console.error(error);
      alert("Failed to load patient.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  function updateField(field: keyof Patient, value: string) {
    if (!patient) return;
    setPatient({ ...patient, [field]: value });
  }

  async function savePatient() {
    if (!patient) return;

    setSaving(true);

    try {
      await updatePatient(patient.id, {
        first_name: patient.first_name_encrypted,
        last_name: patient.last_name_encrypted,
        date_of_birth: patient.date_of_birth_encrypted,
        mrn: patient.mrn,
        injury_date: patient.injury_date || "",
        case_status: patient.case_status,
        priority: patient.priority,
        case_notes: notes,
      });

      alert("Patient updated.");
      await loadPatient();
    } catch (error) {
      console.error(error);
      alert("Failed to update patient.");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    if (!patient) return;

    setSavingNotes(true);

    try {
      await updatePatient(patient.id, {
        first_name: patient.first_name_encrypted,
        last_name: patient.last_name_encrypted,
        date_of_birth: patient.date_of_birth_encrypted,
        mrn: patient.mrn,
        injury_date: patient.injury_date || "",
        case_status: patient.case_status,
        priority: patient.priority,
        case_notes: notes,
      });

      alert("Notes saved.");
      await loadPatient();
    } catch (error) {
      console.error(error);
      alert("Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function removePatient() {
    if (!patient) return;

    const confirmed = confirm(
      `Delete ${patient.first_name_encrypted} ${patient.last_name_encrypted}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deletePatient(patient.id);
      router.push("/dashboard/patients");
    } catch (error) {
      console.error(error);
      alert("Failed to delete patient.");
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-slate-500 shadow-sm">
        Loading patient...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Patient not found
        </h1>

        <Link href="/dashboard/patients" className="text-blue-600">
          Back to Patients
        </Link>
      </div>
    );
  }

  const fullName = `${patient.first_name_encrypted} ${patient.last_name_encrypted}`;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/patients"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to Patients
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{fullName}</h1>

            <p className="mt-2 text-slate-500">
              MRN: {patient.mrn} • Patient ID: {patient.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={savePatient}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={removePatient}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Delete Patient
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-2 text-2xl font-bold capitalize">
            {patient.case_status}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Priority</p>
          <p className="mt-2 text-2xl font-bold capitalize">
            {patient.priority}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Documents</p>
          <p className="mt-2 text-2xl font-bold">{documents.length}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Created</p>
          <p className="mt-2 text-sm font-bold">
            {patient.created_at
              ? new Date(patient.created_at).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Edit Patient Details
          </h2>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border p-3"
                value={patient.first_name_encrypted}
                onChange={(e) =>
                  updateField("first_name_encrypted", e.target.value)
                }
                placeholder="First name"
              />

              <input
                className="rounded-xl border p-3"
                value={patient.last_name_encrypted}
                onChange={(e) =>
                  updateField("last_name_encrypted", e.target.value)
                }
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Date of Birth
              </label>
              <input
                className="w-full rounded-xl border p-3"
                type="date"
                value={patient.date_of_birth_encrypted || ""}
                onChange={(e) =>
                  updateField("date_of_birth_encrypted", e.target.value)
                }
              />
            </div>

            <input
              className="w-full rounded-xl border p-3"
              value={patient.mrn}
              onChange={(e) => updateField("mrn", e.target.value)}
              placeholder="MRN / Case number"
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Injury Date
              </label>
              <input
                className="w-full rounded-xl border p-3"
                type="date"
                value={patient.injury_date || ""}
                onChange={(e) => updateField("injury_date", e.target.value)}
              />
            </div>

            <select
              className="w-full rounded-xl border p-3"
              value={patient.case_status}
              onChange={(e) => updateField("case_status", e.target.value)}
            >
              <option value="intake">Intake</option>
              <option value="processing">Processing</option>
              <option value="review">Review</option>
              <option value="finalized">Finalized</option>
              <option value="archived">Archived</option>
            </select>

            <select
              className="w-full rounded-xl border p-3"
              value={patient.priority}
              onChange={(e) => updateField("priority", e.target.value)}
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">Stat</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Case Notes</h2>

          <textarea
            className="mt-4 min-h-64 w-full rounded-xl border p-4"
            placeholder="Add physician notes, case updates, review comments, or internal notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {savingNotes ? "Saving Notes..." : "Save Notes"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Patient Documents
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Real backend documents linked to this patient.
            </p>
          </div>

          <Link
            href="/dashboard/documents"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Upload Documents
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="p-4">File</th>
                <th className="p-4">Type</th>
                <th className="p-4">Size</th>
                <th className="p-4">Status</th>
                <th className="p-4">Uploaded</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No documents linked yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="border-t align-top">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">
                        {doc.filename}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Document ID: {doc.id}
                      </p>
                    </td>

                    <td className="p-4 capitalize">{doc.file_type}</td>

                    <td className="p-4">
                      {doc.file_size_bytes
                        ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB`
                        : "-"}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                        {doc.doc_status}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-slate-500">
                      {new Date(doc.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <a
                        href={getDocumentDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View / Download
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