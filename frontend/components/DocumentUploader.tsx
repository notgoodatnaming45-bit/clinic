"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";


interface UploadFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface DocumentUploaderProps {
  patientId: string;
  onUploadComplete?: () => void;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/tiff": [".tiff"],
  "application/dicom": [".dcm", ".dicom"],
};

export function DocumentUploader({ patientId, onUploadComplete }: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map((f) => ({ file: f, status: "pending" as const }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024,  // 50MB
  });

  const uploadAll = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f)
      );

      const formData = new FormData();
      formData.append("file", files[i].file);

      try {
        await api.post(`/api/v1/documents/upload/${patientId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setFiles((prev) =>
          prev.map((f, idx) => idx === i ? { ...f, status: "success" } : f)
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: err?.response?.data?.detail || "Upload failed" } : f
          )
        );
      }
    }

    toast.success("Documents uploaded successfully");
    onUploadComplete?.();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={clsx(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-brand-500 bg-brand-50 scale-[1.01]"
            : "border-slate-300 hover:border-brand-400 hover:bg-slate-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 text-slate-400" size={32} />
        <p className="font-medium text-slate-700">
          {isDragActive ? "Drop files here..." : "Drag & drop documents or click to browse"}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          PDF, DICOM, PNG, JPEG, TIFF — up to 50MB each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3"
            >
              <File size={16} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{f.file.name}</p>
                <p className="text-xs text-slate-500">
                  {(f.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex-shrink-0">
                {f.status === "pending" && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Ready</span>
                )}
                {f.status === "uploading" && (
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                )}
                {f.status === "success" && <CheckCircle size={16} className="text-green-500" />}
                {f.status === "error" && (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={16} />
                    <span className="text-xs">{f.error}</span>
                  </div>
                )}
              </div>
              {f.status === "pending" && (
                <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          {pendingCount > 0 && (
            <button
              onClick={uploadAll}
              className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-medium hover:bg-brand-600 transition-colors"
            >
              Upload {pendingCount} Document{pendingCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
    </div>
  );
}