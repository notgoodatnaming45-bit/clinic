"use client";

import { useEffect, useState } from "react";

type ReviewItem = {
  id: string;
  patientId: string;
  patientName: string;
  analysisType: string;
  summary: string;
  findings: string[];
  missingInformation: string[];
  recommendations: string[];
  status: string;
  createdAt: string;
  physicianNotes?: string;
  approvedAt?: string;
};

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("reviewQueue") || "[]");
    setItems(saved);

    if (saved.length > 0) {
      setSelectedId(saved[0].id);
      setNotes(saved[0].physicianNotes || "");
    }
  }, []);

  const selected = items.find((item) => item.id === selectedId);

  function saveQueue(updated: ReviewItem[]) {
    setItems(updated);
    localStorage.setItem("reviewQueue", JSON.stringify(updated));
  }

  function addAuditLog(action: string) {
    const existing = JSON.parse(localStorage.getItem("auditLogs") || "[]");

    const log = {
      id: Date.now().toString(),
      time: new Date().toLocaleString(),
      user: "Physician User",
      action,
      route: "/dashboard/review",
      status: "Success",
    };

    localStorage.setItem("auditLogs", JSON.stringify([log, ...existing]));
  }

  function approveItem() {
    if (!selected) return;

    const approvedItem: ReviewItem = {
      ...selected,
      status: "Approved",
      physicianNotes: notes,
      approvedAt: new Date().toLocaleString(),
    };

    const updated = items.map((item) =>
      item.id === selected.id ? approvedItem : item
    );

    saveQueue(updated);

    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    localStorage.setItem(
      "reports",
      JSON.stringify([
        {
          id: Date.now().toString(),
          patientId: approvedItem.patientId,
          patientName: approvedItem.patientName,
          reportType: approvedItem.analysisType,
          summary: approvedItem.summary,
          findings: approvedItem.findings,
          missingInformation: approvedItem.missingInformation,
          recommendations: approvedItem.recommendations,
          physicianNotes: approvedItem.physicianNotes,
          approvedAt: approvedItem.approvedAt,
          status: "Finalized",
        },
        ...reports,
      ])
    );

    addAuditLog(`Approved AI review for ${approvedItem.patientName}`);
    alert("Approved and saved to Reports.");
  }

  function rejectItem() {
    if (!selected) return;

    const updated = items.map((item) =>
      item.id === selected.id
        ? { ...item, status: "Rejected", physicianNotes: notes }
        : item
    );

    saveQueue(updated);
    addAuditLog(`Rejected AI review for ${selected.patientName}`);
    alert("Review rejected.");
  }

  function saveNotes() {
    if (!selected) return;

    const updated = items.map((item) =>
      item.id === selected.id ? { ...item, physicianNotes: notes } : item
    );

    saveQueue(updated);
    addAuditLog(`Saved physician notes for ${selected.patientName}`);
    alert("Notes saved.");
  }

  function selectItem(id: string) {
    const item = items.find((x) => x.id === id);
    setSelectedId(id);
    setNotes(item?.physicianNotes || "");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Physician Review
        </h1>
        <p className="mt-2 text-slate-500">
          Review AI-generated analysis, add physician notes, approve or reject before final reporting.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Review Queue</h2>

          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-slate-500">
                No items pending review. Run AI Engine and click “Send to Review”.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectItem(item.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedId === item.id
                      ? "border-blue-500 bg-blue-50"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-900">
                    {item.patientName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.analysisType}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {item.createdAt}
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {!selected ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-slate-500 shadow-sm">
            Select a review item.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selected.patientName}
                  </h2>
                  <p className="mt-1 text-slate-500">
                    {selected.analysisType} • {selected.createdAt}
                  </p>
                </div>

                <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
                  {selected.status}
                </span>
              </div>

              <div className="mt-6 rounded-xl bg-blue-50 p-5">
                <h3 className="font-bold text-blue-900">AI Summary</h3>
                <p className="mt-2 leading-7 text-blue-800">
                  {selected.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900">Findings</h3>
                <div className="mt-3 space-y-2">
                  {selected.findings.length === 0 ? (
                    <p className="text-sm text-slate-500">No findings detected.</p>
                  ) : (
                    selected.findings.map((item) => (
                      <p
                        key={item}
                        className="rounded-lg bg-green-50 p-2 text-sm text-green-700"
                      >
                        {item}
                      </p>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900">Missing Information</h3>
                <div className="mt-3 space-y-2">
                  {selected.missingInformation.length === 0 ? (
                    <p className="text-sm text-slate-500">None listed.</p>
                  ) : (
                    selected.missingInformation.map((item) => (
                      <p
                        key={item}
                        className="rounded-lg bg-orange-50 p-2 text-sm text-orange-700"
                      >
                        {item}
                      </p>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900">Recommendations</h3>
                <div className="mt-3 space-y-2">
                  {selected.recommendations.map((item) => (
                    <p
                      key={item}
                      className="rounded-lg bg-slate-50 p-2 text-sm text-slate-700"
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">
                Physician Notes
              </h3>

              <textarea
                className="mt-4 min-h-44 w-full rounded-xl border p-4"
                placeholder="Add physician verification notes, corrections, limitations, or approval comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={saveNotes}
                  className="rounded-xl border bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Save Notes
                </button>

                <button
                  onClick={rejectItem}
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                >
                  Reject
                </button>

                <button
                  onClick={approveItem}
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Approve & Finalize Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}