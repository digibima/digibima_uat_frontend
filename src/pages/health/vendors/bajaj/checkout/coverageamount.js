"use client";
export default function CoverageAmount({
  coverAmount,
  setCoverAmount,
  coverageOptions = [],
  onCoverageChange,
}) {

   const formatAmount = (amt) =>
    amt === 100 ? "1 Cr" : `${amt.toLocaleString()} Lac`;

  const handleChange = (e) => {
    const selected = e.target.value;
    if (onCoverageChange) {
      onCoverageChange(selected);
    } else {
      setCoverAmount(selected); 
    }
  };

  return (
   <div className="bg-white rounded-xl p-4 flex items-center justify-between mb-6 shadow-sm">
  {coverageOptions.length > 0 ? (
    <>
      <div>
        <div className="font-semibold text-base mb-2">Cover Amount</div>
        <div className="text-sm">Is this cover amount sufficient?</div>
      </div>
      <select
        className="bg-white text-sm text-black border border-gray-400 px-4 py-1 rounded-md shadow"
        value={coverAmount}
        onChange={handleChange}
      >
        {coverageOptions.map((amt) => (
          <option key={amt} value={amt}>
            {formatAmount(amt)}
          </option>
        ))}
      </select>
    </>
  ) : (
    <>
      <div className="flex flex-col space-y-2">
        <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
        <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 w-32 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse shadow-inner" />
    </>
  )}
</div>

  );
}