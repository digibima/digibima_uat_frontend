import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { showSuccess, showError } from "@/layouts/toaster";
import { CallApi } from "@/api";
import constant from "@/env";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function EditFooter() {
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState("");
  const [addressInfo, setAddressInfo] = useState("");
  const [disclaimerInfo, setDisclaimerInfo] = useState("");

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await CallApi(constant.API.ADMIN.GET_FOOTER, "GET");
        if (response?.status && response?.data) {
          setCompanyInfo(response.data.company_info || "");
          setAddressInfo(response.data.address_info || "");
          setDisclaimerInfo(response.data.disclaimer_info || "");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };
    fetchFooterSettings();
  }, []);


  const handleSaveFooter = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      company_info: companyInfo,
      address_info: addressInfo,
      disclaimer_info: disclaimerInfo,
    };

    try {
      const response = await CallApi(constant.API.ADMIN.UPDATE_FOOTER, "POST", payload);
      if (response?.status) {
        showSuccess(response?.message || "Footer updated successfully!");
      } else {
        showError(response?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("API Error:", error);
      showError("Failed to update footer.");
    } finally {
      setLoading(false);
    }
  };

  const config = {
    readonly: false,
    placeholder: "Start typing here...",
    height: 250,
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200 mt-5">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Manage Website Footer</h2>
      
      <form onSubmit={handleSaveFooter} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company Info (Column 2)</label>
          <JoditEditor
            value={companyInfo}
            config={config}
            onBlur={(newContent) => setCompanyInfo(newContent)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Registered Office & Email (Column 3)</label>
          <JoditEditor
            value={addressInfo}
            config={config}
            onBlur={(newContent) => setAddressInfo(newContent)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Disclaimer Content (Column 4)</label>
          <JoditEditor
            value={disclaimerInfo}
            config={config}
            onBlur={(newContent) => setDisclaimerInfo(newContent)}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? "Saving Changes..." : "Save Footer Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}