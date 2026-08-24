"use client";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import toast from "react-hot-toast";  

const FilterForm = ({
  filterData,
  register,
  handleSubmit,
  onSubmit,
  filters,
  onFilterChange,
  loadingPlans,
  setFilterChanged
}) => {
  const [changed, setChanged] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!changed) {
      toast.error("Please update one or more filters to refresh your plans");
      return;
    }
    handleSubmit(onSubmit)(e);
    setChanged(false);
    setFilterChanged(false);
  };

  const handleChange = useCallback(
    (e) => {
      onFilterChange(e);
      setChanged(true);
      setFilterChanged(true); 
    },
    [onFilterChange, setFilterChanged]
  );

  return (
    <form
      onSubmit={handleFormSubmit}
      className="relative grid grid-cols-12 items-start gap-3 mb-5 w-full"
    >
      <div className="col-span-12 md:col-span-11 flex flex-wrap gap-3 w-full">
        {filterData.map((item, i) => {
          const isDisabled = ["insurers", "features"].includes(item.name) || loadingPlans;

          return (
            <div
              key={i}
              className={`flex items-center rounded-full bg-white px-3 py-1.4 border ${
                isDisabled
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-75"
                  : "border-gray-400"
              } shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto`}
            >
              <span className={`text-xs pr-2 whitespace-nowrap ${isDisabled ? "text-gray-400" : "text-indigo-600"}`}>
                {item.label}
              </span>
              
              <select
                {...register(item.name, {
                  onChange: handleChange
                })}
                disabled={isDisabled} // HTML select disabled handler
                name={item.name}
                value={filters[item.name] || ""} 
                className={`bg-white text-gray-800 font-medium text-xs px-2 py-1 rounded-md focus:outline-none transition w-full sm:w-auto ${
                  isDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {item.options.map((opt, idx) => {
                  const isObj = typeof opt === "object" && opt !== null;
                  const displayText = isObj ? opt.label : opt;

                  let optionValue;
                  if (isObj) {
                    optionValue = opt.value;
                  } else if (item.name === "plantype") {
                    if (opt === "Base") optionValue = "1";
                    else if (opt === "Port") optionValue = "2";
                    else optionValue = "";
                  } else if (item.name === "tenure") {
                    optionValue = opt.replace(/\s*Years?$/, "");
                  } else {
                    optionValue =
                      opt === "1 Cr" ? "100" : opt.replace(" Lac", "");
                  }

                  return (
                    <option
                      key={idx}
                      value={optionValue}
                      disabled={
                        displayText === "Select" &&
                        !(item.name === "insurers" || item.name === "coverage")
                      }
                    >
                      {displayText}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>

      <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center mt-3 md:mt-0 md:ml-3 w-full">
        <button
          type="submit"
          className="px-6 py-1 thmbtn flex items-center justify-center gap-2 w-full sm:w-auto rounded-full text-sm font-medium"
          disabled={loadingPlans}
        >
          {loadingPlans ? (
            <>
              Applying
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </>
          ) : (
            "Apply"
          )}
        </button>
      </div>
    </form>
  );
};

export default FilterForm;