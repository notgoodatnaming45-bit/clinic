// "use client";

// import { useState } from "react";

// export default function SettingsPage() {
//   const [settings, setSettings] = useState({
//     mfa: true,
//     audit: true,
//     encryption: true,
//     aiReview: true,
//     notifications: false,
//   });

//   function toggleSetting(key: keyof typeof settings) {
//     setSettings({
//       ...settings,
//       [key]: !settings[key],
//     });
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-4xl font-bold text-slate-900">
//           Settings
//         </h1>

//         <p className="mt-2 text-slate-500">
//           Configure platform security, AI review rules, and compliance settings.
//         </p>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         {/* MFA */}
//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900">
//                 Multi-Factor Authentication
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Require MFA for all physician and admin accounts.
//               </p>
//             </div>

//             <button
//               onClick={() => toggleSetting("mfa")}
//               className={`h-7 w-14 rounded-full transition ${
//                 settings.mfa ? "bg-green-500" : "bg-slate-300"
//               }`}
//             >
//               <div
//                 className={`h-6 w-6 rounded-full bg-white transition ${
//                   settings.mfa ? "translate-x-7" : "translate-x-1"
//                 }`}
//               />
//             </button>
//           </div>
//         </div>

//         {/* Audit */}
//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900">
//                 Immutable Audit Logs
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Track all user activity and report generation events.
//               </p>
//             </div>

//             <button
//               onClick={() => toggleSetting("audit")}
//               className={`h-7 w-14 rounded-full transition ${
//                 settings.audit ? "bg-green-500" : "bg-slate-300"
//               }`}
//             >
//               <div
//                 className={`h-6 w-6 rounded-full bg-white transition ${
//                   settings.audit ? "translate-x-7" : "translate-x-1"
//                 }`}
//               />
//             </button>
//           </div>
//         </div>

//         {/* Encryption */}
//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900">
//                 End-to-End Encryption
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Encrypt uploaded medical records and AI drafts.
//               </p>
//             </div>

//             <button
//               onClick={() => toggleSetting("encryption")}
//               className={`h-7 w-14 rounded-full transition ${
//                 settings.encryption ? "bg-green-500" : "bg-slate-300"
//               }`}
//             >
//               <div
//                 className={`h-6 w-6 rounded-full bg-white transition ${
//                   settings.encryption ? "translate-x-7" : "translate-x-1"
//                 }`}
//               />
//             </button>
//           </div>
//         </div>

//         {/* AI Review */}
//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900">
//                 Mandatory Physician Review
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 AI-generated drafts require physician approval before export.
//               </p>
//             </div>

//             <button
//               onClick={() => toggleSetting("aiReview")}
//               className={`h-7 w-14 rounded-full transition ${
//                 settings.aiReview ? "bg-green-500" : "bg-slate-300"
//               }`}
//             >
//               <div
//                 className={`h-6 w-6 rounded-full bg-white transition ${
//                   settings.aiReview ? "translate-x-7" : "translate-x-1"
//                 }`}
//               />
//             </button>
//           </div>
//         </div>

//         {/* Notifications */}
//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900">
//                 Email Notifications
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Send alerts for approvals, uploads, and flagged cases.
//               </p>
//             </div>

//             <button
//               onClick={() => toggleSetting("notifications")}
//               className={`h-7 w-14 rounded-full transition ${
//                 settings.notifications ? "bg-green-500" : "bg-slate-300"
//               }`}
//             >
//               <div
//                 className={`h-6 w-6 rounded-full bg-white transition ${
//                   settings.notifications ? "translate-x-7" : "translate-x-1"
//                 }`}
//               />
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <h2 className="text-xl font-semibold text-slate-900">
//           Compliance Status
//         </h2>

//         <div className="mt-4 grid gap-4 md:grid-cols-3">
//           <div className="rounded-xl bg-green-50 p-4">
//             <p className="text-sm text-slate-500">HIPAA</p>
//             <p className="mt-2 text-lg font-bold text-green-700">
//               Compliant
//             </p>
//           </div>

//           <div className="rounded-xl bg-blue-50 p-4">
//             <p className="text-sm text-slate-500">AI Review Policy</p>
//             <p className="mt-2 text-lg font-bold text-blue-700">
//               Enabled
//             </p>
//           </div>

//           <div className="rounded-xl bg-orange-50 p-4">
//             <p className="text-sm text-slate-500">Risk Monitoring</p>
//             <p className="mt-2 text-lg font-bold text-orange-700">
//               Active
//             </p>
//           </div>
//         </div>
//       </div>

//       <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
//         Save Settings
//       </button>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Bell,
  Brain,
  Database,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    mfa: true,
    audit: true,
    encryption: true,
    aiReview: true,
    notifications: false,
  });

  function toggleSetting(key: keyof typeof settings) {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  const settingCards = [
    {
      key: "mfa",
      title: "Multi-Factor Authentication",
      description: "Require MFA for physician and admin accounts.",
      icon: Lock,
    },
    {
      key: "audit",
      title: "Audit Logging",
      description: "Track all actions and report activity.",
      icon: Shield,
    },
    {
      key: "encryption",
      title: "Document Encryption",
      description: "Encrypt uploaded files and stored reports.",
      icon: Database,
    },
    {
      key: "aiReview",
      title: "Mandatory Physician Review",
      description: "AI drafts require physician approval.",
      icon: Brain,
    },
    {
      key: "notifications",
      title: "Email Notifications",
      description: "Receive alerts for uploads and approvals.",
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Platform Settings
        </h1>

        <p className="mt-2 text-slate-500">
          Configure security, compliance, AI review, and system behavior.
        </p>
      </div>

      {/* Security Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">HIPAA Compliance</p>

          <div className="mt-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <p className="font-semibold text-green-700">
              Operational
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">AI Review Policy</p>

          <div className="mt-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <p className="font-semibold text-blue-700">
              Enforced
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Database Security</p>

          <div className="mt-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <p className="font-semibold text-orange-700">
              Encrypted
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-3xl border bg-white shadow-sm">
        <div className="border-b px-8 py-6">
          <h2 className="text-2xl font-bold text-slate-900">
            System Controls
          </h2>
        </div>

        <div className="divide-y">
          {settingCards.map((setting) => {
            const Icon = setting.icon;
            const enabled =
              settings[setting.key as keyof typeof settings];

            return (
              <div
                key={setting.key}
                className="flex items-center justify-between px-8 py-6"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {setting.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {setting.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    toggleSetting(
                      setting.key as keyof typeof settings
                    )
                  }
                  className={`relative h-7 w-14 rounded-full transition ${
                    enabled
                      ? "bg-blue-600"
                      : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
                      enabled
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}