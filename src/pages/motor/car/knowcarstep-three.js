"use client";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import constant from "@/env";
import { CallApi } from "@/api";
import { format } from "date-fns";
import { showError } from "@/layouts/toaster";
import { carTwo } from "@/images/Image";

export default function KnowCarSlideThree() {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      ownershiptoggle: "0",
      policyclaim: "0",
    },
  });

  const [ownershipToggle, setOwnershipToggle] = useState(false);
  const [policyToggle, setPolicyToggle] = useState(false);
  const [apiData, setApiData] = useState({});
  const router = useRouter();

  const prePolicyType = watch("prepolitype");

  const calculateToDate = (fromDateStr, isThreeYear) => {
    if (!fromDateStr) return "";
    const [dd, mm, yyyy] = fromDateStr.split("-").map(Number);
    const fromDate = new Date(yyyy, mm - 1, dd);
    if (isNaN(fromDate)) return "";
    const toDate = new Date(fromDate);
    toDate.setFullYear(toDate.getFullYear() + (isThreeYear ? 3 : 1));
    toDate.setDate(toDate.getDate() - 1);
    return format(toDate, "dd-MM-yyyy");
  };

  const bdfromdate = watch("bdfromdate");
  const bdtpfromdate = watch("bdtpfromdate");
  const compfromdate = watch("compfromdate");
  const odfromdate = watch("odfromdate");
  const odtpfromdate = watch("odtpfromdate");
  const tpfromdate = watch("tpfromdate");

  useEffect(() => {
    async function getDetails() {
      try {
        const res = await CallApi(
          constant.API.MOTOR.CAR.KNOWCARDETAILSTHREE,
          "GET"
        );
        const data = res?.data;
        if (data) {
          setApiData(data);

          Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              setValue(key, value);
            }
          });

          setOwnershipToggle(data.ownershiptoggle === "1");
          setPolicyToggle(data.policyclaim === "1");
        }
      } catch (error) {
        console.error("Error loading saved step three data:", error);
      }
    }

    getDetails();
  }, [setValue]);


  useEffect(() => {
    if (bdfromdate) setValue("bdtodate", calculateToDate(bdfromdate, false));
  }, [bdfromdate, setValue]);

  useEffect(() => {
    if (bdtpfromdate) setValue("bdtptodate", calculateToDate(bdtpfromdate, true));
  }, [bdtpfromdate, setValue]);

  useEffect(() => {
    if (compfromdate) setValue("comptodate", calculateToDate(compfromdate, false));
  }, [compfromdate, setValue]);

  useEffect(() => {
    if (odfromdate) setValue("odtodate", calculateToDate(odfromdate, false));
  }, [odfromdate, setValue]);

  useEffect(() => {
    if (odtpfromdate) setValue("odtptodate", calculateToDate(odtpfromdate, true));
  }, [odtpfromdate, setValue]);

  useEffect(() => {
    if (tpfromdate) setValue("tptodate", calculateToDate(tpfromdate, false));
  }, [tpfromdate, setValue]);

  const requiredDates = {
    bundled: ["bdfromdate", "bdtodate", "bdtpfromdate", "bdtptodate"],
    comprehensive: ["compfromdate", "comptodate"],
    odonly: ["odfromdate", "odtodate", "odtpfromdate", "odtptodate"],
    tponly: ["tpfromdate", "tptodate"],
  };

  const onSubmit = async (data) => {
    if (!data.prepolitype) {
      showError("Please select a previous policy type.");
      return;
    }

    const fieldsToCheck = requiredDates[data.prepolitype] || [];
    for (let field of fieldsToCheck) {
      if (!data[field]) {
        showError("Please fill all required date fields before continuing.");
        return;
      }
    }
    try {
      const res = await CallApi(
        constant.API.MOTOR.CAR.KNOWCARDETAILSTHREE,
        "POST",
        data
      );
      if (res) {
        router.push(constant.ROUTES.MOTOR.CAR.PLANS);
      }
    } catch (error) {
      console.error(error);
    }
  };


  const renderDateInput = (name, label) => {
    const isReadOnly = Boolean(apiData[name]);

    return (
      <div>
        <label className="labelcls">{label}</label>
        <input
          type="text"
          placeholder="DD-MM-YYYY"
          readOnly={isReadOnly}
          {...register(name)}
          className={`inputcls ${isReadOnly ? "cursor-not-allowed" : ""}`}
        />
      </div>
    );
  };

  return (
    <div className="bgcolor py-6 sm:py-10 min-h-screen flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto rounded-[64px] bg-white shadow-lg px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#426D98] text-center">
          Motor insurance provides essential coverage against accidents.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="hidden md:col-span-2 md:flex justify-center items-center p-4">
            <div className="w-full max-w-[220px] sm:max-w-xs">
              <Image
                src={carTwo}
                alt="Home with Umbrella"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Policy Type Dropdown */}
              <div>
                <label className="labelcls">
                  Select previous policy type
                </label>
                <select
                  {...register("prepolitype")}
                  className={`inputcls ${apiData.prepolitype ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={Boolean(apiData.prepolitype)}
                >
                  <option value="">Select Policy</option>
                  <option value="bundled">Bundled (1Y OD + 3Y TP)</option>
                  <option value="comprehensive">
                    Comprehensive (1Y OD + 1Y TP)
                  </option>
                  <option value="odonly">OD Only</option>
                  <option value="tponly">TP Only</option>
                </select>
              </div>

              {/* Bundled */}
              {prePolicyType === "bundled" && (
                <div className="space-y-1">
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    {renderDateInput("bdfromdate", "OD From Date")}
                    {renderDateInput("bdtodate", "OD To Date")}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    {renderDateInput("bdtpfromdate", "TP From Date")}
                    {renderDateInput("bdtptodate", "TP To Date")}
                  </div>
                </div>
              )}

              {/* Comprehensive */}
              {prePolicyType === "comprehensive" && (
                <div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {renderDateInput("compfromdate", "From Date")}
                    {renderDateInput("comptodate", "To Date")}
                  </div>
                </div>
              )}

              {/* OD Only */}
              {prePolicyType === "odonly" && (
                <div>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    {renderDateInput("odfromdate", "OD From Date")}
                    {renderDateInput("odtodate", "OD To Date")}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    {renderDateInput("odtpfromdate", "TP From Date")}
                    {renderDateInput("odtptodate", "TP To Date")}
                  </div>
                </div>
              )}

              {/* TP Only */}
              {prePolicyType === "tponly" && (
                <div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {renderDateInput("tpfromdate", "TP From Date")}
                    {renderDateInput("tptodate", "TP To Date")}
                  </div>
                </div>
              )}

              {/* Ownership & Claim */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Ownership Transfer */}
                <div>
                  <label className="labelcls">
                    Was there any ownership transfer in the previous year?
                  </label>

                  <input type="hidden" {...register("ownershiptoggle")} />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={ownershipToggle}
                      onChange={() => {
                        const value = !ownershipToggle ? "1" : "0";
                        setOwnershipToggle(!ownershipToggle);
                        setValue("ownershiptoggle", value);
                      }}
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors" />
                    <div
                      className={`absolute left-0 top-0 w-6 h-6 bg-white border border-gray-200 rounded-full shadow transform transition-transform ${
                        ownershipToggle ? "translate-x-6" : ""
                      }`}
                    />
                  </label>
                </div>

                {/* Policy Claim */}
                <div>
                  <label className="labelcls">
                    Did you make a claim in your previous policy period?
                  </label>

                  <input type="hidden" {...register("policyclaim")} />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={policyToggle}
                      onChange={() => {
                        const value = !policyToggle ? "1" : "0";
                        setPolicyToggle(!policyToggle);
                        setValue("policyclaim", value);
                      }}
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-indigo-500 transition-colors" />
                    <div
                      className={`absolute left-0 top-0 w-6 h-6 bg-white border border-gray-200 rounded-full shadow transform transition-transform ${
                        policyToggle ? "translate-x-6" : ""
                      }`}
                    />
                  </label>
                </div>
              </div>

              {/* Bonus */}
              {!policyToggle && (
                <div>
                  <p className="labelcls">
                    How much was the No Claim Bonus in the previous policy?
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {["0", "20", "25", "35", "45", "50"].map((val) => (
                      <label key={val} className="cursor-pointer">
                        <input
                          type="radio"
                          value={val}
                          {...register("bonus-button")}
                          className="hidden peer"
                        />
                        <div
                          className="
                            bonus-box
                            px-4 py-2 rounded-full border text-sm font-semibold text-center transition-all duration-200
                            peer-checked:border-blue-100
                            peer-checked:bg-blue-100
                            peer-checked:text-blue-800
                            peer-checked:ring-2 peer-checked:ring-blue-400
                          "
                        >
                          {val}%
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() =>
                    router.push(constant.ROUTES.MOTOR.CAR.KNOWCARSTEPTWO)
                  }
                  className="px-6 py-2 thmbtn"
                >
                  Back
                </button>
                <button type="submit" className="px-6 py-2 thmbtn">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}