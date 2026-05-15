"use client";

import { useEffect, useState } from "react";

type Log = {
  id: string;
  time: string;
  user: string;
  action: string;
  route: string;
  status: string;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("auditLogs");
    const starter = [
      { id: "1", time: new Date().toLocaleString(), user: "Admin User", action: "Viewed dashboard", route: "/dashboard", status: "Success" },
      { id: "2", time: new Date().toLocaleString(), user: "Physician User", action: "Opened review panel", route: "/dashboard/review", status: "Success" },
      { id: "3", time: new Date().toLocaleString(), user: "System", action: "AI draft generated", route: "/dashboard/ai-engine", status: "Success" },
    ];
    setLogs(saved ? JSON.parse(saved) : starter);
    if (!saved) localStorage.setItem("auditLogs", JSON.stringify(starter));
  }, []);

  function addLog() {
    const newLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleString(),
      user: "Admin User",
      action: "Manual audit event",
      route: "/dashboard/audit-logs",
      status: "Success",
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem("auditLogs", JSON.stringify(updated));
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Track views, edits, exports, approvals, and security events.</p>
        </div>
        <button onClick={addLog} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Add Test Log</button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr><th className="p-4">Time</th><th className="p-4">User</th><th className="p-4">Action</th><th className="p-4">Route</th><th className="p-4">Status</th></tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-4 text-sm">{log.time}</td>
                <td className="p-4 font-semibold">{log.user}</td>
                <td className="p-4">{log.action}</td>
                <td className="p-4 text-gray-500">{log.route}</td>
                <td className="p-4"><span className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">{log.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}