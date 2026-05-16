"use client";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle, XCircle, AlertTriangle, Eye, Edit3,
  Bold, Italic, UnderlineIcon, List
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import clsx from "clsx";

interface ReviewPanelProps {
  report: {
    id: string;
    ai_draft: string;
    physician_edited_content?: string;
    report_type: string;
    report_status: string;
  };
  sourceExcerpts?: string[];
}

export function PhysicianReviewPanel({ report, sourceExcerpts = [] }: ReviewPanelProps) {
  const [viewMode, setViewMode] = useState<"split" | "ai" | "editor">("split");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: report.physician_edited_content || report.ai_draft,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/api/v1/reports/${report.id}/edit`, {
        physician_edited_content: editor?.getHTML(),
      });
    },
    onSuccess: () => toast.success("Changes saved"),
    onError: () => toast.error("Failed to save"),
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/v1/reports/${report.id}/approve`, { approved: true });
    },
    onSuccess: () => {
      toast.success("Report approved and digitally signed");
      setShowApprovalModal(false);
      queryClient.invalidateQueries({ queryKey: ["report", report.id] });
    },
    onError: () => toast.error("Approval failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/v1/reports/${report.id}/approve`, {
        approved: false,
        rejection_reason: rejectionReason,
      });
    },
    onSuccess: () => {
      toast.success("Report sent back for revision");
      setShowRejectionModal(false);
    },
  });

  const isFinalized = report.report_status === "finalized";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit3 size={18} className="text-brand-500" />
          <h2 className="font-semibold text-slate-800">
            {report.report_type === "clinical_summary" ? "Clinical Summary" : "Legal Report"} — Physician Review
          </h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(["split", "ai", "editor"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                viewMode === mode ? "bg-white shadow text-slate-900" : "text-slate-600 hover:text-slate-800"
              )}
            >
              {mode === "ai" ? "AI Draft" : mode === "split" ? "Side by Side" : "Editor"}
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer banner */}
      {!isFinalized && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>AI Copilot:</strong> Review all AI-generated content carefully before approval. 
            You are the final authority. Verify against source documents shown below.
          </p>
        </div>
      )}

      {/* Content Area */}
      <div className={clsx("grid gap-0", viewMode === "split" ? "grid-cols-2" : "grid-cols-1")}>
        {/* AI Draft Panel */}
        {(viewMode === "split" || viewMode === "ai") && (
          <div className={clsx("border-r border-slate-100", viewMode === "ai" && "border-0")}>
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Eye size={14} className="text-slate-500" />
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">AI Generated Draft</span>
            </div>
            <div className="p-6 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {report.ai_draft || "No AI draft available."}
            </div>

            {/* Source Excerpts */}
            {sourceExcerpts.length > 0 && (
              <div className="border-t border-slate-100 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Source Document Excerpts</p>
                <div className="space-y-2">
                  {sourceExcerpts.map((excerpt, i) => (
                    <div key={i} className="bg-blue-50 border-l-2 border-blue-400 px-3 py-2 text-xs text-blue-800">
                      {excerpt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Panel */}
        {(viewMode === "split" || viewMode === "editor") && !isFinalized && (
          <div>
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={14} className="text-brand-500" />
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Physician Edit</span>
              </div>
              {/* Toolbar */}
              <div className="flex gap-1">
                {[
                  { action: () => editor?.chain().focus().toggleBold().run(), icon: Bold },
                  { action: () => editor?.chain().focus().toggleItalic().run(), icon: Italic },
                  { action: () => editor?.chain().focus().toggleUnderline().run(), icon: UnderlineIcon },
                  { action: () => editor?.chain().focus().toggleBulletList().run(), icon: List },
                ].map(({ action, icon: Icon }, i) => (
                  <button key={i} onClick={action} className="p-1.5 rounded hover:bg-white text-slate-600 hover:text-slate-900">
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-slate-200 m-4 rounded-lg min-h-[400px] max-h-[500px] overflow-y-auto">
              <EditorContent editor={editor} className="text-sm" />
            </div>
          </div>
        )}

        {/* Finalized view */}
        {isFinalized && (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 mb-4">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Report Finalized & Digitally Signed</p>
                <p className="text-sm text-green-700">This report is locked. No further edits permitted.</p>
              </div>
            </div>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.physician_edited_content || report.ai_draft}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {!isFinalized && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="text-sm text-slate-600 hover:text-slate-900 border border-slate-300 px-4 py-2 rounded-lg hover:bg-white transition-all"
          >
            {saveMutation.isPending ? "Saving..." : "Save Draft"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setShowRejectionModal(true)}
              className="flex items-center gap-2 text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
            >
              <XCircle size={16} />
              Request Revision
            </button>
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-medium"
            >
              <CheckCircle size={16} />
              Approve & Sign
            </button>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Approval</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              By approving, you digitally sign this report and confirm it is clinically accurate. 
              This action creates an immutable record and <strong>cannot be undone</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
              >
                {approveMutation.isPending ? "Signing..." : "Confirm & Sign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Request Revision</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Reason for revision request..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowRejectionModal(false)} className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Request Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}