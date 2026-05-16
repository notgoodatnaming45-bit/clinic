"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Patient = {
  id: string;
  name: string;
  mrn: string;
  injuryDate: string;
  status: string;
  priority: string;
};

export default function NewPatientPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    mrn: "",
    injuryDate: "",
    status: "Intake",
    priority: "Normal",
  });

  function savePatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const existingRaw = localStorage.getItem("patients");
    const existing: Patient[] = existingRaw ? JSON.parse(existingRaw) : [];

    const newPatient: Patient = {
      id: Date.now().toString(),
      name: form.name,
      mrn: form.mrn,
      injuryDate: form.injuryDate,
      status: form.status,
      priority: form.priority,
    };

    localStorage.setItem("patients", JSON.stringify([newPatient, ...existing]));

    router.push("/dashboard/patients");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Add Patient</h1>
        <p className="mt-2 text-slate-500">Create a new patient intake case.</p>
      </div>

      <form
        onSubmit={savePatient}
        className="max-w-3xl space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <input
          className="w-full rounded-xl border p-3"
          placeholder="Patient full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          className="w-full rounded-xl border p-3"
          placeholder="MRN / Case number"
          value={form.mrn}
          onChange={(e) => setForm({ ...form, mrn: e.target.value })}
          required
        />

        <input
          className="w-full rounded-xl border p-3"
          type="date"
          value={form.injuryDate}
          onChange={(e) => setForm({ ...form, injuryDate: e.target.value })}
          required
        />

        <select
          className="w-full rounded-xl border p-3"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="Intake">Intake</option>
          <option value="Processing">Processing</option>
          <option value="Review">Review</option>
          <option value="Finalized">Finalized</option>
        </select>

        <select
          className="w-full rounded-xl border p-3"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="Normal">Normal</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Save Patient
        </button>
      </form>
    </div>
  );
}