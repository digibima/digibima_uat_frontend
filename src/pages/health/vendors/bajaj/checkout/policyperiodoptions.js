"use client";

import React, { useState, useEffect, useRef } from "react";

export default function PolicyPeriodOptions({
  tenureOptions = [],
  tenure,
  setTenure,
  tenurePrices = {},
  onTenureChange,
  isSkeletonLoading = false, 
}) {
  const [priceLoading, setPriceLoading] = useState(false);
  const prevPricesRef = useRef({});

  const formatPrice = (price) =>
    price ? `- ₹${Number(price).toLocaleString()}` : null;

  useEffect(() => {
    if (Object.keys(prevPricesRef.current).length === 0) {
      prevPricesRef.current = tenurePrices;
      return;
    }

    if (
      JSON.stringify(prevPricesRef.current) !== JSON.stringify(tenurePrices)
    ) {
      setPriceLoading(true);
      prevPricesRef.current = tenurePrices;

      const timeout = setTimeout(() => setPriceLoading(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [tenurePrices]);


  if (isSkeletonLoading) {
    return (
      <div className="bg-white rounded-xl p-4 sm:px-8 mb-6 w-full">
        <div className="mb-2 h-4 w-32 bg-gray-300 rounded animate-pulse" />
        <div className="mb-4 h-3 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="flex flex-wrap gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 border rounded-xl px-4 py-3 min-w-[150px] sm:w-[200px] h-[56px] bg-gray-100 animate-pulse"
            >
              <div className="h-4 w-4 rounded-full bg-gray-300" />
              <div className="h-4 w-24 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }


  if (tenureOptions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 sm:px-8 mb-6 w-full">
        <div className="mb-2 h-4 w-32 bg-gray-300 rounded animate-pulse" />
        <div className="mb-4 h-3 w-64 bg-gray-200 rounded animate-pulse" />

        <div className="flex flex-wrap gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 border rounded-xl px-4 py-3 min-w-[150px] sm:w-[200px] h-[56px] bg-gray-100 animate-pulse"
            >
              <div className="h-4 w-4 rounded-full bg-gray-300" />
              <div className="h-4 w-24 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleTenureChange = (event) => {
    const selectedTenure = event.target.value;
    setTenure(selectedTenure);
    if (onTenureChange) {
      onTenureChange(selectedTenure);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 px-5 mb-6">
      <div className="font-semibold text-base mb-2">Policy Period</div>
      <div className="text-sm text-gray-600 mb-4">
        Choosing a multi-year plan saves your money and the trouble of
        remembering yearly renewals.
      </div>

      <div className="flex flex-wrap gap-4 mb-2">
        {tenureOptions.map((year) => (
          <label
            key={year}
            className={`relative flex items-center gap-2 px-6 py-3 border rounded-xl cursor-pointer transition-all duration-200 flex-1 min-w-[160px] max-w-full ${
              tenure == year ? "border-pink-500" : "border-gray-400"
            }`}
          >
            {tenure == year && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-70" />
            )}

            <input
              type="radio"
              name="policyPeriod"
              value={year}
              checked={tenure == year}
              onChange={handleTenureChange}
              className="form-checkbox accent-pink-500 h-4 w-4 cursor-pointer"
            />

            <span className="text-sm text-black font-medium flex">
              {year} {year === 1 ? "Year" : "Years"}
              {tenurePrices[year] ? (
                <span className="ml-2 font-semibold text-black">
                  {`@ ₹${tenurePrices[year].toLocaleString()}`}
                </span>
              ) : (
                <span className="flex justify-center items-center space-x-1 ml-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
