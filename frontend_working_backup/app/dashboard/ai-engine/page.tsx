"use client";

import { useState } from "react";

export default function AIEnginePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  function analyze() {
    setOutput(`AI Extraction Preview

Key markers:
• GCS / neurological findings check
• Symptom progression
• Imaging and outside-provider records
• Neuropsychological test references

Clinical synthesis:
The record suggests post-traumatic symptoms requiring physician verification.

Legal-medical note:
Causality and impairment wording must be reviewed before finalization.

Source:
${input || "No source text entered."}`);
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Engine</h1>
        <p className="text-gray-500">Extract clinical details and prepare physician-review drafts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Source Text</h2>
          <textarea className="mt-4 min-h-80 w-full rounded-xl border p-4" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste clinical note or document text..." />
          <button onClick={analyze} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Run Analysis</button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">AI Output</h2>
          <pre className="mt-4 min-h-80 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-700">{output || "AI output will appear here."}</pre>
        </div>
      </div>
    </div>
  );
}