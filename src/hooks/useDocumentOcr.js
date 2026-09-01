"use client";
import { useState } from "react";
import { showSuccess, showError } from "@/layouts/toaster";

export const useDocumentOcr = ({ onExtracted }) => {
  const [docLoading, setDocLoading] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setDocLoading(true);
    try {
      const response = await fetch(
        "https://api.digibima.in/python/document/gettext",
        {
          method: "POST",
          body: formData,
        }
      );

      const resData = await response.json();

      if (resData?.status && resData?.data) {
        showSuccess("Document details extracted successfully!");
        setDocUploaded(true);

        // Pura extracted data direct callback ke through bhej do
        if (onExtracted) {
          onExtracted(resData.data);
        }
      } else {
        showError("Unable to extract details from the uploaded file.");
      }
    } catch (err) {
      console.error("Document upload API error:", err);
      showError("Failed to upload and parse document.");
    } finally {
      setDocLoading(false);
    }
  };

  return {
    docLoading,
    docUploaded,
    handleDocumentUpload,
  };
};