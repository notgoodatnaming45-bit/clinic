"use client";

import { useState } from "react";

export default function ReviewPage() {
  const [approved, setApproved] = useState(false);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Physician Review</h1>
        <p className="text-gray-500">Verify AI-generated text against source snippets.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Source Snippet</h2>
          <p className="mt-4 rounded-xl bg-gray-50 p-4 leading-7 text-gray-700">
            Patient reports headache, dizziness, memory difficulty, and sleep disturbance following traumatic injury. Outside records note continued symptoms.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">AI Draft</h2>
          <textarea className="mt-4 min-h-56 w-full rounded-xl border p-4" defaultValue="The patient presents with post-traumatic symptoms consistent with possible TBI-related impairment. Physician review is required before finalization." />
        </div>
      </div>

      <button onClick={() => setApproved(true)} className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">
        Approve & Timestamp
      </button>

      {approved && <div className="rounded-xl bg-green-50 p-4 font-semibold text-green-700">Approved at {new Date().toLocaleString()}</div>}
    </div>
  );
}