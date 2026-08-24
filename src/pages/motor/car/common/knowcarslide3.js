import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import constant from "../../../../env";
import UniversalDatePicker from "../../../datepicker/index";
import { format, parse } from "date-fns";
import { showSuccess, showError } from "@/layouts/toaster";

export default function KnowCarSlideThree() {
  const { control, register, handleSubmit, watch, setValue } = useForm();

  const [ownershipToggle, setOwnershipToggle] = useState(false);
  const [policyToggle, setPolicyToggle] = useState(false);
  const router = useRouter();

  const prePolicyType = watch("prepolitype");
  const bonusValue = watch("bonus");

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
  if (bdfromdate) setValue("bdtodate", calculateToDate(bdfromdate, false));
}, [bdfromdate, setValue]);

useEffect(() => {
  if (bdtpfromdate)
    setValue("bdtptodate", calculateToDate(bdtpfromdate, true));
}, [bdtpfromdate, setValue]);

useEffect(() => {
  if (compfromdate)
    setValue("comptodate", calculateToDate(compfromdate, false));
}, [compfromdate, setValue]);

useEffect(() => {
  if (odfromdate) setValue("odtodate", calculateToDate(odfromdate, false));
}, [odfromdate, setValue]);

useEffect(() => {
  if (odtpfromdate)
    setValue("odtptodate", calculateToDate(odtpfromdate, true));
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

  const onSubmit = (data) => {
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

    if (!data.bonus) {
      showError("Please select a No Claim Bonus (NCB) percentage.");
      return;
    }
    router.push(constant.ROUTES.MOTOR.PLANS);
  };

  const renderDatePicker = (name, label) => (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <UniversalDatePicker
            id={name}
            name={name}
            onChange={(date) => {
              if (date instanceof Date && !isNaN(date)) {
                const formatted = format(date, "dd-MM-yyyy");
                field.onChange(formatted);
              }
            }}
            placeholder="Pick a date"
            value={
              field.value ? parse(field.value, "dd-MM-yyyy", new Date()) : null
            }
          />
        )}
      />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center text-lg font-semibold mb-6">
        Motor insurance provides essential coverage against accidents.
      </div>

      <div className="flex items-center justify-center">
        <Image
          src=""
          alt="Car"
          width={400}
          height={300}
          className="rounded shadow"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Policy Type Dropdown */}
        <div>
          <label className="block font-medium mb-2">
            Select previous policy type
          </label>
          <select
            {...register("prepolitype")}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Policy</option>
            <option value="bundled">Bundled (1Y OD + 3Y TP)</option>
            <option value="comprehensive">Comprehensive (1Y OD + 1Y TP)</option>
            <option value="odonly">OD Only</option>
            <option value="tponly">TP Only</option>
          </select>
        </div>

        {/* Bundled */}
        {prePolicyType === "bundled" && (
          <div className="bg-gray-50 border p-4 rounded space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {renderDatePicker("bdfromdate", "OD From Date")}
              {renderDatePicker("bdtodate", "OD To Date")}
            </div>
            <div className="text-sm font-semibold">TP Dates</div>
            <div className="grid md:grid-cols-2 gap-4">
              {renderDatePicker("bdtpfromdate", "TP From Date")}
              {renderDatePicker("bdtptodate", "TP To Date")}
            </div>
          </div>
        )}

        {/* Comprehensive */}
        {prePolicyType === "comprehensive" && (
          <div className="bg-gray-50 border p-4 rounded space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {renderDatePicker("compfromdate", "From Date")}
              {renderDatePicker("comptodate", "To Date")}
            </div>
          </div>
        )}

        {/* OD Only */}
        {prePolicyType === "odonly" && (
          <div className="bg-gray-50 border p-4 rounded space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {renderDatePicker("odfromdate", "OD From Date")}
              {renderDatePicker("odtodate", "OD To Date")}
            </div>
            <div className="text-sm font-semibold">TP Dates</div>
            <div className="grid md:grid-cols-2 gap-4">
              {renderDatePicker("odtpfromdate", "TP From Date")}
              {renderDatePicker("odtptodate", "TP To Date")}
            </div>
          </div>
        )}

        {/* TP Only */}
        {prePolicyType === "tponly" && (
          <div className="bg-gray-50 border p-4 rounded space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {renderDatePicker("tpfromdate", "TP From Date")}
              {renderDatePicker("tptodate", "TP To Date")}
            </div>
          </div>
        )}

        {/* Ownership & Claim */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">
              Was there any ownership transfer in the previous year?
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={ownershipToggle}
                onChange={() => {
                  setOwnershipToggle(!ownershipToggle);
                  setValue("ownershiptransfer", !ownershipToggle ? "1" : "0");
                }}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
            <input type="hidden" {...register("ownershiptransfer")} />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Did you make a claim in your previous policy period?
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={policyToggle}
                onChange={() => {
                  setPolicyToggle(!policyToggle);
                  setValue("policyclaim", !policyToggle ? "1" : "0");
                }}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
            <input type="hidden" {...register("policyclaim")} />
          </div>
        </div>

        {/* NCB Bonus */}
        <div>
          <p className="text-base font-medium mb-2">
            How much was the No Claim Bonus in the previous policy?
          </p>
          <div className="flex flex-wrap gap-3">
            {["0", "20", "25", "35", "45", "50"].map((val) => (
              <label key={val} className="cursor-pointer">
                <input
                  type="radio"
                  value={val}
                  {...register("bonus")}
                  className="hidden peer"
                />
                <div className="bonus-box peer-checked:ring-2 peer-checked:ring-blue-600 px-4 py-2 rounded border text-sm font-semibold text-center">
                  {val}%
                </div>
              </label>
            ))}
          </div>
          {bonusValue && (
            <p className="mt-2 text-sm text-gray-600">
              Selected Bonus: {bonusValue}%
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.push(constant.ROUTES.MOTOR.KnowCarSlide2)}
            className="px-6 py-2 rounded-full font-semibold bg-gray-200 hover:bg-gray-300"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:scale-105 transition"
            style={{
              background: "linear-gradient(to bottom, #426D98, #28A7E4)",
            }}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
