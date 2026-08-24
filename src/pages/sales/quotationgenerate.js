"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Loader2,
  X,
} from "lucide-react";
import { showSuccess, showError } from "@/layouts/toaster";

export default function QuotationGeneratePage() {
  const [employeeDetails, setEmployeeDetails] = useState(null);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // API Response PDF
  const [responsePdf, setResponsePdf] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("quotation.pdf");

  // Check Session
  useEffect(() => {
    const employeeData = sessionStorage.getItem("employeeDetails");

    if (!employeeData) {
      window.location.href = "/";
      return;
    }

    setEmployeeDetails(JSON.parse(employeeData));
  }, []);

  // Handle File Upload
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const pdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" || "application/html",
    );


    if (pdfFiles.length + files.length > 5) {
      showError("Maximum 5 PDF files allowed");
      return;
    }

    setFiles([...files, ...pdfFiles]);
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      showError("Please upload at least one PDF");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "employeeDetails[employeeId]",
        employeeDetails.employeeId,
      );

      formData.append(
        "employeeDetails[employeeName]",
        employeeDetails.employeeName,
      );

      formData.append("employeeDetails[email]", employeeDetails.email);

      formData.append("employeeDetails[mobile]", employeeDetails.mobile);

      // Files
      files.forEach((file) => {
        formData.append("files[]", file);
      });

      const response = await fetch("/api/compare-quotes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate quotation");
      }

      // PDF Blob Response
      const blob = await response.blob();

      const disposition = response.headers.get("Content-Disposition");

      let filename = "quotation.pdf";

      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "");
      }

      setPdfFileName(filename);

      const pdfUrl = URL.createObjectURL(blob);

      setResponsePdf(pdfUrl);
    } catch (error) {
      console.error(error);
      showError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-[28px] border border-[#DCE6F5] shadow-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E2A4A]">
              Quotation Generator
            </h1>

            <p className="text-[#6E7B96] mt-2">
              Upload customer PDF documents and generate quotations instantly.
            </p>
          </div>

          <div className="bg-[#F8FAFF] border border-[#DCE6F5] rounded-2xl px-5 py-4 min-w-[280px]">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={18} className="text-[#2B9AD6]" />

              <p className="text-sm font-semibold text-[#1E2A4A]">
                Verified Employee
              </p>
            </div>

            <p className="text-[#5F6C87] text-sm">
              Name:{" "}
              <span className="font-semibold">
                {employeeDetails?.employeeName}
              </span>
            </p>

            <p className="text-[#5F6C87] text-sm mt-1">
              Employee ID:{" "}
              <span className="font-semibold">
                {employeeDetails?.employeeId}
              </span>
            </p>
            <p className="text-[#5F6C87] text-sm mt-1">
              Mobile:{" "}
              <span className="font-semibold">{employeeDetails?.mobile}</span>
            </p>
            <p className="text-[#5F6C87] text-sm mt-1">
              Email:{" "}
              <span className="font-semibold">{employeeDetails?.email}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[30px] border border-[#DCE6F5] shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#2B9AD6] to-[#C95AE8] text-white flex items-center justify-center shadow-lg">
              <Upload size={26} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1E2A4A]">
                Upload PDF Files
              </h2>

              <p className="text-[#6E7B96] text-sm">
                Upload maximum 5 PDF files
              </p>
            </div>
          </div>

          <label className="border-2 border-dashed border-[#BFD5F3] bg-[#F8FAFF] rounded-[26px] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#2B9AD6] transition-all">
            <div className="w-20 h-20 rounded-full bg-[#E8F4FF] flex items-center justify-center mb-5">
              <Upload size={34} className="text-[#2B9AD6]" />
            </div>

            <h3 className="text-xl font-semibold text-[#1E2A4A]">
              Drag & Drop PDF Files
            </h3>

            <p className="text-[#7B879D] mt-2">or click to browse files</p>

            <input
              type="file"
              multiple
              accept=".pdf,.html"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {files.length > 0 && (
            <div className="mt-8 space-y-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#F8FAFF] border border-[#DCE6F5] rounded-2xl px-5 py-4"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
                      <FileText size={22} />
                    </div>

                    <div className="overflow-hidden">
                      <p className="font-semibold text-[#1E2A4A] truncate">
                        {file.name}
                      </p>

                      <p className="text-sm text-[#7B879D]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-[#2B9AD6] via-[#4B7BC9] to-[#C95AE8] text-white font-semibold text-lg shadow-lg hover:scale-[1.01] transition-all disabled:opacity-70"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" size={22} />
                Processing PDFs...
              </div>
            ) : (
              "Generate Quotation"
            )}
          </button>
        </div>

        <div className="bg-white rounded-[30px] border border-[#DCE6F5] shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#2B9AD6] to-[#344B87] text-white flex items-center justify-center shadow-lg">
              <FileText size={26} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1E2A4A]">
                Generated Response
              </h2>

              <p className="text-[#6E7B96] text-sm">
                API generated quotation PDF
              </p>
            </div>
          </div>

          {loading ? (
            <div className="h-[500px] rounded-[26px] border border-[#DCE6F5] bg-[#F8FAFF] flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#EEF5FF] flex items-center justify-center mb-6">
                <Loader2 size={50} className="text-[#2B9AD6] animate-spin" />
              </div>

              <h3 className="text-2xl font-semibold text-[#1E2A4A]">
                Generating Quotation...
              </h3>

              <p className="text-[#7B879D] mt-3">
                Please wait while API processes your PDF files.
              </p>
            </div>
          ) : !responsePdf ? (
            <div className="h-[500px] rounded-[26px] border-2 border-dashed border-[#DCE6F5] bg-[#F8FAFF] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#EEF5FF] flex items-center justify-center mb-5">
                <FileText size={42} className="text-[#2B9AD6]" />
              </div>

              <h3 className="text-2xl font-semibold text-[#1E2A4A]">
                No PDF Generated Yet
              </h3>

              <p className="text-[#7B879D] mt-3 max-w-md">
                Upload PDF files and generate quotation response from API.
              </p>
            </div>
          ) : (
            <div>
              <div className="w-full h-[400px] rounded-[24px] border border-[#DCE6F5] overflow-hidden bg-[#F8FAFF] flex items-center justify-center">
                <iframe
                  src={`${responsePdf}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
                  className="w-[420px] h-[540px] scale-[0.9] pointer-events-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <a
                  href={responsePdf}
                  target="_blank"
                  rel="noreferrer"
                  className="h-14 rounded-2xl border border-[#DCE6F5] bg-[#F8FAFF] hover:bg-[#EEF5FF] transition-all flex items-center justify-center gap-3 text-[#1E2A4A] font-semibold"
                >
                  <Eye size={20} />
                  View PDF
                </a>

                <a
                  href={responsePdf}
                  download={pdfFileName}
                  className="h-14 rounded-2xl bg-gradient-to-r from-[#2B9AD6] via-[#4B7BC9] to-[#C95AE8] text-white flex items-center justify-center gap-3 font-semibold shadow-lg"
                >
                  <Download size={20} />
                  Download PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
