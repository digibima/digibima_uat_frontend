"use client";

export default function HealthInsuranceLoader() {
  return (
     <div id="loader">
      <div className="loader-container">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
        <div className="dot dot-4"></div>
      </div>
    </div>
  )
}
export function HealthPlanCardSkeleton() {
  return (
    <div className="bg-white rounded-[30px] border border-blue-100 shadow-md p-6 flex flex-col sm:flex-row justify-between items-center gap-6 animate-pulse">
      <div className="flex items-center gap-6 w-full sm:w-3/4 flex-wrap sm:flex-nowrap">
        <div className="w-20 h-14 bg-blue-100 rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="w-40 h-4 bg-blue-100 rounded" />
          <div className="w-32 h-3 bg-blue-50 rounded" />
        </div>
        <div className="w-20 h-6 bg-blue-100 rounded-full mt-4 sm:ml-auto" />
      </div>
      <div className="w-32 h-8 bg-blue-100 rounded-full" />
    </div>
  );
}



