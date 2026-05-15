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

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const existing = localStorage.getItem("auditLogs");

    if (existing) {
      setLogs(JSON.parse(existing));
    } else {
      const starterLogs: Log[] = [
        {
          id: "1",
          time: new Date().toLocaleString(),
          user: "Dr. Smith",
          action: "Viewed Dashboard",
          route: "/dashboard",
          status: "Success",
        },
        {
          id: "2",
          time: new Date().toLocaleString(),
          user: "Admin User",
          action: "Generated AI Draft",
          route: "/dashboard/ai-engine",
          status: "Success",
        },
      ];

      localStorage.setItem("auditLogs", JSON.stringify(starterLogs));
      setLogs(starterLogs);
    }
  }, []);

  function addLog() {
    const newLog: Log = {
      id: Date.now().toString(),
      time: new Date().toLocaleString(),
      user: "Admin User",
      action: "Manual Audit Event",
      route: "/dashboard/audit",
      status: "Success",
    };

    const updatedLogs = [newLog, ...logs];

    setLogs(updatedLogs);
    localStorage.setItem("auditLogs", JSON.stringify(updatedLogs));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Audit Log
          </h1>

          <p className="mt-2 text-slate-500">
            Immutable tracking of platform actions and user activity.
          </p>
        </div>

        <button
          onClick={addLog}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Add Test Log
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">User</th>
              <th className="p-4">Action</th>
              <th className="p-4">Route</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-4 text-sm">{log.time}</td>

                <td className="p-4 font-medium">
                  {log.user}
                </td>

                <td className="p-4">{log.action}</td>

                <td className="p-4 text-slate-500">
                  {log.route}
                </td>

                <td className="p-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}