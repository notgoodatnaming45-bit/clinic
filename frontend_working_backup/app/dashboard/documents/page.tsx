"use client";

import { useState } from "react";

export default function DocumentsPage() {
  const [files, setFiles] = useState<string[]>([]);

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles([...Array.from(e.target.files || []).map((f) => f.name), ...files]);
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500">Upload PDFs, scans, handwritten notes, and DICOM files.</p>
      </div>

      <label className="block cursor-pointer rounded-2xl border-2 border-dashed bg-white p-10 text-center shadow-sm hover:bg-gray-50">
        <input type="file" multiple className="hidden" onChange={upload} />
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">↑</div>
        <p className="text-lg font-bold">Upload documents</p>
        <p className="text-sm text-gray-500">PDF, JPG, PNG, DICOM</p>
      </label>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Uploaded Files</h2>
        <div className="mt-4 space-y-3">
          {files.length === 0 ? <p className="text-gray-500">No files uploaded yet.</p> :
            files.map((f, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <span className="font-medium">{f}</span>
                <span className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">Ready</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}