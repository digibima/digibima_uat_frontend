"use client";

import { useEffect, useState } from "react";
import { X, Upload, HelpCircle, Loader2 } from "lucide-react";
import { UploadDocument } from "@/api";

export default function UploadPlanPopup() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const shown = sessionStorage.getItem("uploadPopupShown");
    if (shown) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("uploadPopupShown", "true");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["application/pdf"];
    const maxSize = 10 * 1024 * 1024; 

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF files are allowed");
      return;
    }

    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a policy file first");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("policy", file);

      await UploadDocument(
        "/api/upload-policy",
        "POST",
        formData
      );

      setOpen(false);
      setFile(null);
      alert("Policy uploaded successfully!");

    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
  <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">

    {/* Header */}
    <div className="relative bg-gradient-to-r from-[#1E5A96] to-[#2E7BCF] p-5">
      <h3 className="text-lg font-semibold text-white">
        Already have a policy?
      </h3>
      <p className="text-sm text-blue-100 mt-1">
        Upload your policy & get better options instantly
      </p>

      <button
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
      >
        <X />
      </button>
    </div>

    <div className="p-6">

      <label className="group cursor-pointer block border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-[#1E5A96] transition">
        <Upload className="mx-auto w-8 h-8 text-slate-400 group-hover:text-[#1E5A96]" />

        <p className="mt-3 font-medium text-slate-700">
          Click to upload your policy
        </p>
        <p className="text-xs text-slate-500 mt-1">
          PDF (max 10MB)
        </p>

        <input
          type="file"
          accept=".pdf/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {file && (
        <div className="mt-3 text-sm text-green-600 text-center">
          ✔ {file.name}
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-red-500 text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-[#1E5A96] text-white py-3 rounded-xl font-semibold hover:bg-[#174a7c] disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload Existing Policy"}
      </button>

      <button
        className="mt-3 w-full flex items-center justify-center gap-2 border border-slate-300 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
      >
        <HelpCircle className="w-5 h-5" />
        Ask a Question
      </button>

      <button
        onClick={() => setOpen(false)}
        className="mt-4 text-sm text-slate-500 hover:underline block mx-auto"
      >
        Maybe later
      </button>
    </div>
  </div>
</div>

  );
}
