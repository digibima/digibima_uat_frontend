import StepTracker from "@/components/steptracker";

export default function JourneyLayout({ currentStep, children }) {
  return (
    <>
      <div className="sticky top-0 z-50 bg-white">
        <StepTracker currentStep={currentStep} />
      </div>

      <div className="pt-4">
        {children}
      </div>
    </>
  );
}
