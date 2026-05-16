"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    mfa: true,
    audit: true,
    encryption: true,
    aiReview: true,
    notifications: false,
  });

  function toggleSetting(key: keyof typeof settings) {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-2 text-slate-500">
          Configure platform security, AI review rules, and compliance settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* MFA */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Multi-Factor Authentication
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Require MFA for all physician and admin accounts.
              </p>
            </div>

            <button
              onClick={() => toggleSetting("mfa")}
              className={`h-7 w-14 rounded-full transition ${
                settings.mfa ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full bg-white transition ${
                  settings.mfa ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Audit */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Immutable Audit Logs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track all user activity and report generation events.
              </p>
            </div>

            <button
              onClick={() => toggleSetting("audit")}
              className={`h-7 w-14 rounded-full transition ${
                settings.audit ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full bg-white transition ${
                  settings.audit ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Encryption */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                End-to-End Encryption
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Encrypt uploaded medical records and AI drafts.
              </p>
            </div>

            <button
              onClick={() => toggleSetting("encryption")}
              className={`h-7 w-14 rounded-full transition ${
                settings.encryption ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full bg-white transition ${
                  settings.encryption ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* AI Review */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Mandatory Physician Review
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                AI-generated drafts require physician approval before export.
              </p>
            </div>

            <button
              onClick={() => toggleSetting("aiReview")}
              className={`h-7 w-14 rounded-full transition ${
                settings.aiReview ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full bg-white transition ${
                  settings.aiReview ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Email Notifications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Send alerts for approvals, uploads, and flagged cases.
              </p>
            </div>

            <button
              onClick={() => toggleSetting("notifications")}
              className={`h-7 w-14 rounded-full transition ${
                settings.notifications ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full bg-white transition ${
                  settings.notifications ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Compliance Status
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm text-slate-500">HIPAA</p>
            <p className="mt-2 text-lg font-bold text-green-700">
              Compliant
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-slate-500">AI Review Policy</p>
            <p className="mt-2 text-lg font-bold text-blue-700">
              Enabled
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-sm text-slate-500">Risk Monitoring</p>
            <p className="mt-2 text-lg font-bold text-orange-700">
              Active
            </p>
          </div>
        </div>
      </div>

      <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
        Save Settings
      </button>
    </div>
  );
}