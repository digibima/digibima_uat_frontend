"use client";
import React from "react";
import { FiLoader, FiUploadCloud, FiCheckCircle } from "react-icons/fi";
import { useDocumentOcr } from "@/hooks/useDocumentOcr";

export default function DocumentOcrUpload({
  onExtracted,
  id = "doc-quick-upload",
}) {
  const { docLoading, docUploaded, handleDocumentUpload } = useDocumentOcr({
    onExtracted,
  });

  return (
    <div className="flex flex-row items-center justify-between p-2 px-3 border border-dashed border-cyan-400 rounded-md bg-cyan-50/40 gap-2 h-[40px]">
      <div className="flex items-center gap-2 overflow-hidden">
        <FiUploadCloud className="text-cyan-600 text-base flex-shrink-0" />
        <span className="text-xs font-medium text-gray-700 truncate">
          Quick Auto-Fill via Document OCR
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {docUploaded && (
          <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
            <FiCheckCircle /> Filled
          </span>
        )}
        <input
          type="file"
          id={id}
          className="hidden"
          accept="image/*,application/pdf"
          onChange={handleDocumentUpload}
          disabled={docLoading}
        />
        <label
          htmlFor={id}
          className={`px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded cursor-pointer flex items-center gap-1 transition-all whitespace-nowrap ${
            docLoading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {docLoading ? (
            <>
              <FiLoader className="animate-spin" /> Uploading...
            </>
          ) : (
            "Upload Doc"
          )}
        </label>
      </div>
    </div>
  );
}