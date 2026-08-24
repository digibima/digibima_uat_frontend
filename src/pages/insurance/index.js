"use client";

import { useState, useEffect } from "react";
import {
  FiShield,
  FiUpload,
  FiFileText,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi";
import { showSuccess, showError } from "@/layouts/toaster";
import constant from "@/env";

export default function UnifiedInsurancePage() {
  // 1. Auth & Verification States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    mobile: "",
    pincode: "",
    policynumber: "",
    policyname: "",
    policytype: "",
    issuedate: "",
    fromdate: "",
    todate: "",
    pdf: null,
  });

  const [loading, setLoading] = useState(false);
  const [policyOptions, setPolicyOptions] = useState([]);
  const [fetchingPolicies, setFetchingPolicies] = useState(false);

  const regexPatterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    mobile: /^[6-9]\d{9}$/,
    pincode: /^[1-9][0-9]{5}$/,
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginType = sessionStorage.getItem("userlogintype");
      const token = localStorage.getItem("token");
      
      // Token aur userlogintype dono valid hain toh authorized set karein
      if (loginType === "employee" && token) {
        setIsAuthorized(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthorized || !formData.policytype) {
      setPolicyOptions([]);
      return;
    }

    const fetchPolicyNames = async () => {
      setFetchingPolicies(true);
      try {
        let token = localStorage.getItem("token");
        const response = await fetch(`${constant.API.EMPLOYEE.EMPLOYEELOGINVENDORS}`, {
          method: "POST",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: formData.policytype }),
        });

        const res = await response.json();
        if (res?.success || res?.status) {
          setPolicyOptions(res.vendors || []);
        } else {
          setPolicyOptions([]);
        }
      } catch (error) {
        console.error("Error fetching policy names:", error);
        setPolicyOptions([]);
      } finally {
        setFetchingPolicies(false);
      }
    };

    fetchPolicyNames();
  }, [formData.policytype, isAuthorized]);

  const handleLoginVerification = async (e) => {
    e.preventDefault();
    if (!regexPatterns.mobile.test(mobileNumber)) {
      showError("Please enter a valid 10-digit mobile number");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch(
        `${constant.API.EMPLOYEE.EMPLOYEELOGIN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: mobileNumber }),
        }
      );

      const res = await response.json();

      if (res?.status) {
        // 1. Token aur User details save karein
        if (res?.token) {
          localStorage.setItem("token", res.token);
        }
        sessionStorage.setItem("userlogintype", "employee");
        if (res?.user) {
          localStorage.setItem("user_info", JSON.stringify(res.user));
        }

        showSuccess(res?.message || "Employee Verified Successfully!");
        setIsAuthorized(true);

        setFormData((prev) => ({ ...prev, mobile: mobileNumber }));
      } else {
        showError(
          res?.message || "Access Denied: Not registered as an employee."
        );
      }
    } catch (error) {
      showError("Connection failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // 2. Logout Handler API Integration
const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch(`${constant.API.EMPLOYEE.EMPLOYEELOGOUT}`, {
          method: "POST",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token, // Body mein JSON string format me token bhej diya hai
          }),
        });
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Storage Clear karein aur Reset karein
      localStorage.removeItem("token");
      localStorage.removeItem("user_info");
      sessionStorage.removeItem("userlogintype");

      setIsAuthorized(false);
      setMobileNumber("");
      setLoggingOut(false);
      showSuccess("Logged out successfully");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "pdf") {
      setFormData((prev) => ({ ...prev, pdf: files?.[0] || null }));
      return;
    }
    if (
      (name === "mobile" || name === "pincode") &&
      value !== "" &&
      !/^\d+$/.test(value)
    ) {
      return;
    }
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "policytype") updated.policyname = "";
      return updated;
    });
  };

  const validateForm = () => {
    if (!formData.gender)
      return showError("Please select your Gender"), false;
    if (!formData.name)
      return showError("Please select a Proposer Name"), false;
    if (!formData.policytype)
      return showError("Please select a Policy Type"), false;
    if (!formData.policyname.trim())
      return showError("Please select a Policy Name"), false;
    if (!formData.policynumber.trim())
      return showError("Policy Number cannot be blank"), false;
    if (!formData.issuedate)
      return showError("Please select an Issue Date"), false;
    if (!formData.fromdate)
      return showError("Please select a From Date"), false;
    if (!formData.todate) return showError("Please select a To Date"), false;
    if (
      !formData.email.trim() ||
      !regexPatterns.email.test(formData.email.trim())
    )
      return showError("Please enter a valid Email"), false;
    if (!formData.mobile.trim() || !regexPatterns.mobile.test(formData.mobile))
      return showError("Please enter a valid Mobile Number"), false;
    if (
      !formData.pincode.trim() ||
      !regexPatterns.pincode.test(formData.pincode)
    )
      return showError("Please enter a valid Pincode"), false;
    if (!formData.pdf)
      return showError("Please upload your PDF Document"), false;
    return true;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "pdf") {
          if (value) payload.append("document", value);
        } else {
          payload.append(key, typeof value === "string" ? value.trim() : value);
        }
      });

      let token = localStorage.getItem("token");
      const response = await fetch(
        `${constant.API.EMPLOYEE.POLICYUPLOAD}`,
        {
          method: "POST",
          headers: { Authorization: `${token}` },
          body: payload,
        }
      );

      const res = await response.json();
      if (res?.status || res?.success) {
        showSuccess(res?.message || "Lead Submitted Successfully!");
        setFormData({
          name: "",
          gender: "",
          email: "",
          mobile: mobileNumber,
          pincode: "",
          policynumber: "",
          policyname: "",
          policytype: "",
          issuedate: "",
          fromdate: "",
          todate: "",
          pdf: null,
        });
      } else {
        showError(res?.message || "Submission failed.");
      }
    } catch (error) {
      showError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bgcolor py-6 lg:py-10 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-xl shadow-blue-900/5 border border-slate-100 grid md:grid-cols-12 overflow-hidden min-h-[600px]">
          <div className="md:col-span-4 bg-slate-50/60 p-6 lg:p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs tracking-wider uppercase">
                <FiShield size={14} />
                <span>Verification Gate</span>
              </div>

              {!isAuthorized ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#0E2F56]">
                    Employee Login
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Verify your identity via registered mobile number to unlock
                    the policy registry desk.
                  </p>

                  <form
                    onSubmit={handleLoginVerification}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Registered Mobile
                      </label>
                      <div className="relative">
                        <FiPhone
                          className="absolute left-3.5 top-3.5 text-slate-400"
                          size={15}
                        />
                        <input
                          type="tel"
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "" || /^\d+$/.test(v)) setMobileNumber(v);
                          }}
                          placeholder="Enter 10-digit number"
                          className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#00B4D8]/10 focus:border-[#00B4D8]"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={verifying}
                      className="w-full bg-[#7998F4] hover:bg-[#6384ED] text-white py-3 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      {verifying ? "Verifying..." : "Unlock Dashboard"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <FiCheckCircle size={18} />
                    <span>Access Granted</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium">
                    Logged in as Employee:{" "}
                    <span className="font-bold">{mobileNumber}</span>
                  </p>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="text-[10px] text-red-500 underline font-semibold hover:text-red-600 bg-transparent border-none cursor-pointer disabled:opacity-50"
                  >
                    {loggingOut ? "Logging out..." : "Logout / Change Account"}
                  </button>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed font-light">
              Authorized tunnel active. Content access logs are protected under
              internal compliance protocols.
            </div>
          </div>

          <div className="md:col-span-8 p-6 lg:p-10 relative">
            {!isAuthorized && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[6px] z-20 flex flex-col items-center justify-center text-center p-6 select-none">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3 border border-slate-200 shadow-sm animate-pulse">
                  <FiLock size={24} />
                </div>
                <h3 className="text-base font-bold text-[#0E2F56]">
                  Registry Locked
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Please verify your employee mobile number on the left panel to
                  open this form.
                </p>
              </div>
            )}

            {loading ? (
              <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="loader-container">
                  <div className="dot dot-1"></div>
                  <div className="dot dot-2"></div>
                  <p className="text-[#0E2F56] font-bold text-xs mt-12">
                    Uploading Records...
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitForm}
                className="space-y-8"
                noValidate
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs tracking-wider uppercase">
                    <FiUser size={14} />
                    <span>Personal Registry</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="labelcls">Gender</label>
                      <div className="flex gap-2">
                        {["Male", "Female"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, gender: g }))
                            }
                            className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-300 border-none cursor-pointer ${
                              formData.gender === g
                                ? "bg-[#7998F4] text-white shadow-md"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="labelcls">Proposer Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter proposer name"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00B4D8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs tracking-wider uppercase">
                    <FiBriefcase size={14} />
                    <span>Policy Framework</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="labelcls">Policy Type</label>
                      <select
                        name="policytype"
                        value={formData.policytype}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                      >
                        <option value="">Select Category</option>
                        <option value="health">Health</option>
                        <option value="life">Life</option>
                        <option value="bike">Two Wheeler</option>
                        <option value="car">Four Wheeler</option>
                      </select>
                    </div>
                    <div>
                      <label className="labelcls">Policy Name</label>
                      <select
                        name="policyname"
                        value={formData.policyname}
                        onChange={handleChange}
                        disabled={fetchingPolicies || !formData.policytype}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white disabled:opacity-50"
                      >
                        {fetchingPolicies ? (
                          <option value="">Loading...</option>
                        ) : (
                          <>
                            <option value="">Select Policy Name</option>
                            {policyOptions.map((p, idx) => (
                              <option key={idx} value={p.vid}>
                                {typeof p === "object" ? p.vendorname : p}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="labelcls">Policy Number</label>
                    <input
                      type="text"
                      name="policynumber"
                      value={formData.policynumber}
                      onChange={handleChange}
                      placeholder="Enter policy number"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00B4D8] md:w-1/2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs tracking-wider uppercase">
                    <FiCalendar size={14} />
                    <span>Validity Timelines</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="labelcls">Issue Date</label>
                      <input
                        type="date"
                        name="issuedate"
                        value={formData.issuedate}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="labelcls">From Date</label>
                      <input
                        type="date"
                        name="fromdate"
                        value={formData.fromdate}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="labelcls">To Date</label>
                      <input
                        type="date"
                        name="todate"
                        value={formData.todate}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs tracking-wider uppercase">
                    <FiPhone size={14} />
                    <span>Contact Configuration</span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="labelcls">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@domain.com"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="labelcls">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile"
                        maxLength={10}
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="10-digit contact"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="labelcls">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit zone"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="labelcls">Policy PDF Document</label>
                  <label className="block border border-dashed border-slate-300 bg-[#FAFBFD]/60 rounded-xl p-6 text-center cursor-pointer hover:border-[#00B4D8] transition-all duration-300">
                    <FiUpload size={20} className="mx-auto text-slate-400" />
                    <p className="font-bold text-xs text-[#0E2F56] mt-1.5">
                      Click to upload contract PDF
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      name="pdf"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                  {formData.pdf && (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 max-w-xs">
                      <FiFileText
                        className="text-emerald-600 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-xs text-emerald-900 truncate font-semibold">
                        {formData.pdf.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    className="w-full sm:w-64 bg-[#7998F4] hover:bg-[#6384ED] text-white py-3 rounded-xl border-none font-bold text-xs tracking-widest uppercase cursor-pointer transition-all duration-300 shadow-md"
                  >
                    Submit Records
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}