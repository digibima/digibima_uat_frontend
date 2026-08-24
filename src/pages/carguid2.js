import React from "react";
import {
  Car,
  ShieldCheck,
  Sliders,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Enter Car Details",
    icon: Car,
    what: "Select your car brand, model, fuel type and registration city.",
    why: "Insurance pricing and coverage depend on exact vehicle details. Incorrect details can lead to claim issues.",
    benefit: "Only valid plans shown for your car",
    time: "20 sec",
  },
  {
    id: 2,
    title: "Previous Insurance Status",
    icon: ShieldCheck,
    what: "Tell us whether this is a new policy or a renewal and your previous insurer.",
    why: "This helps us apply the correct No Claim Bonus (NCB) and calculate the right premium.",
    benefit: "Correct price & NCB applied",
    time: "15 sec",
  },
  {
    id: 3,
    title: "Compare Insurance Plans",
    icon: Sliders,
    what: "Compare plans from top insurance companies in one place.",
    why: "Every insurer differs in price, coverage and claim settlement ratio.",
    benefit: "Best value plan without agent pressure",
    time: "30 sec",
  },
  {
    id: 4,
    title: "Choose Add-ons (Optional)",
    icon: FileText,
    what: "Select recommended add-ons like Zero Depreciation and Engine Protection.",
    why: "Add-ons reduce repair costs and protect you from major expenses later.",
    benefit: "Lower future out-of-pocket cost",
    time: "20 sec",
  },
  {
    id: 5,
    title: "Secure Payment & Policy Issuance",
    icon: CreditCard,
    what: "Complete payment using secure online options.",
    why: "Payment activates your insurance instantly with no paperwork.",
    benefit: "Instant policy on WhatsApp & Email",
    time: "10 sec",
  },
];

export default function InsuranceFlowUI() {
  return (
    <section className="bg-slate-50 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900">
            How Insurance Works on Our Platform
          </h1>
          <p className="text-slate-600 mt-4">
            A simple, transparent and fully online insurance journey.
            Here’s exactly what happens from start to finish.
          </p>
        </div>

        <div className="relative mt-20">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step) => (
              <div
                key={step.id}
                className="relative md:pl-16"
              >
                <div className="hidden md:flex absolute left-0 top-6 w-12 h-12 rounded-xl bg-indigo-600 text-white items-center justify-center shadow-md">
                  <step.icon className="w-6 h-6" />
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-semibold text-slate-900">
                      Step {step.id}: {step.title}
                    </h3>

                    <p className="text-slate-700">
                      <span className="font-semibold">What happens:</span>{" "}
                      {step.what}
                    </p>

                    <p className="text-slate-700">
                      <span className="font-semibold">Why we ask:</span>{" "}
                      {step.why}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <span className="inline-flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        {step.benefit}
                      </span>

                      <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {step.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 bg-indigo-600 rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-2xl font-bold">
            Get insured in just 2–3 minutes
          </h2>
          <p className="mt-3 text-indigo-100 max-w-2xl mx-auto">
            No paperwork. No agent calls. Just clear steps, transparent pricing
            and instant coverage.
          </p>

          <button className="mt-8 px-12 py-4 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:bg-indigo-50 transition">
            Start Buying Insurance
          </button>

          <p className="mt-4 text-sm text-indigo-100">
            🔒 Secure payments • 🏛 IRDAI compliant • ⭐ Trusted by users across India
          </p>
        </div>
      </div>
    </section>
  );
}
