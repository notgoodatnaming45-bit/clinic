"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Patient = {
  id: string;
  name: string;
  mrn: string;
  injuryDate: string;
  status: string;
  priority: string;
};

type DocumentItem = {
  id: string;
  fileName: string;
  patientId: string;
  patientName: string;
  category: string;
  status: string;
  uploadedBy: string;
  uploadedAt: string;
  aiSummary: string;
};

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const patients: Patient[] = JSON.parse(localStorage.getItem("patients") || "[]");
    const docs: DocumentItem[] = JSON.parse(localStorage.getItem("documents") || "[]");

    const found = patients.find((p) => p.id === patientId) || null;

    setPatient(found);
    setDocuments(docs.filter((d) => d.patientId === patientId));
    setNotes(localStorage.getItem(`patient-notes-${patientId}`) || "");
  }, [patientId]);

  function updatePatient(field: keyof Patient, value: string) {
    if (!patient) return;

    const updatedPatient = { ...patient, [field]: value };
    const patients: Patient[] = JSON.parse(localStorage.getItem("patients") || "[]");

    const updatedPatients = patients.map((p) =>
      p.id === patientId ? updatedPatient : p
    );

    localStorage.setItem("patients", JSON.stringify(updatedPatients));
    setPatient(updatedPatient);
  }

  function saveNotes() {
    localStorage.setItem(`patient-notes-${patientId}`, notes);
    alert("Notes saved.");
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Patient not found</h1>
        <Link href="/dashboard/patients" className="text-blue-600">
          Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/patients" className="text-sm font-semibold text-blue-600">
          ← Back to Patients
        </Link>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{patient.name}</h1>
            <p className="mt-2 text-slate-500">
              MRN: {patient.mrn} • Injury Date: {patient.injuryDate}
            </p>
          </div>

          <div className="flex gap-3">
            <select
              className="rounded-xl border bg-white p-3"
              value={patient.status}
              onChange={(e) => updatePatient("status", e.target.value)}
            >
              <option>Intake</option>
              <option>Processing</option>
              <option>Review</option>
              <option>Finalized</option>
            </select>

            <select
              className="rounded-xl border bg-white p-3"
              value={patient.priority}
              onChange={(e) => updatePatient("priority", e.target.value)}
            >
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-2 text-2xl font-bold">{patient.status}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Priority</p>
          <p className="mt-2 text-2xl font-bold">{patient.priority}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Documents</p>
          <p className="mt-2 text-2xl font-bold">{documents.length}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">AI Processed</p>
          <p className="mt-2 text-2xl font-bold">
            {documents.filter((d) => d.status === "AI Processed").length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Patient Details</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold">{patient.name}</span>
            </div>

            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-slate-500">MRN</span>
              <span className="font-semibold">{patient.mrn}</span>
            </div>

            <div className="flex justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-slate-500">Injury Date</span>
              <span className="font-semibold">{patient.injuryDate}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Clinical Notes</h2>

          <textarea
            className="mt-4 min-h-48 w-full rounded-xl border p-4"
            placeholder="Add physician notes, case updates, or review comments..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            onClick={saveNotes}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Save Notes
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Patient Documents</h2>
            <p className="mt-1 text-sm text-slate-500">
              Documents linked to this patient from the Documents page.
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
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Uploaded</th>
              </tr>
            </thead>

            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No documents linked to this patient yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="border-t align-top">
                    <td className="p-4">
                      <p className="font-semibold">{doc.fileName}</p>
                      {doc.aiSummary && (
                        <p className="mt-2 text-sm text-slate-500">
                          {doc.aiSummary}
                        </p>
                      )}
                    </td>

                    <td className="p-4">{doc.category}</td>
                    <td className="p-4">{doc.status}</td>
                    <td className="p-4 text-sm text-slate-500">
                      {doc.uploadedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => router.push("/dashboard/patients")}
        className="rounded-xl border bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
      >
        Back to Patient List
      </button>
    </div>
  );
}