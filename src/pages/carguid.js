import React from "react";
import { motion } from "framer-motion";
import {
  Car,
  ShieldCheck,
  UserRound,
  Sliders,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Car Details",
    subtitle: "We start with your car",
    desc: "Select your car brand, model, fuel type and registration city. This helps us show accurate plans.",
    time: "20 sec",
    icon: Car,
  },
  {
    id: 2,
    title: "Insurance Status",
    subtitle: "Your previous policy",
    desc: "Tell us if this is a new policy or renewal. We calculate No Claim Bonus correctly.",
    time: "15 sec",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Owner Details",
    subtitle: "Basic personal info",
    desc: "Enter owner name, mobile number and email for policy communication.",
    time: "20 sec",
    icon: UserRound,
  },
  {
    id: 4,
    title: "Compare Plans",
    subtitle: "Choose the best option",
    desc: "Compare plans from top insurers based on price, coverage and claim ratio.",
    time: "30 sec",
    icon: Sliders,
  },
  {
    id: 5,
    title: "Add-ons",
    subtitle: "Extra protection",
    desc: "Select add-ons like Zero Dep, Engine Protect and Roadside Assistance.",
    time: "20 sec",
    icon: FileText,
  },
  {
    id: 6,
    title: "Payment & Policy",
    subtitle: "You are covered",
    desc: "Make secure payment and instantly receive your policy on WhatsApp & email.",
    time: "10 sec",
    icon: CreditCard,
  },
];

export default function InsuranceFlowTimeline() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-center text-slate-900"
        >
          How Insurance Works on Our Platform
        </motion.h1>
        <p className="text-center text-slate-600 mt-4 max-w-2xl mx-auto">
          A fully guided, transparent and hassle-free insurance journey. No paperwork. No confusion.
        </p>

        <div className="mt-20 space-y-10 relative">
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-indigo-100 rounded-full" />

          {steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative flex gap-8 items-start"
            >
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                <step.icon className="w-7 h-7" />
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-8 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-indigo-600 font-semibold">
                      Step {step.id} • {step.subtitle}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {step.title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    ⏱ {step.time}
                  </span>
                </div>

                <p className="text-slate-600 mt-4 max-w-xl">
                  {step.desc}
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Fully guided by our platform
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition">
            Start Buying Insurance
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-slate-500 mt-4">
            Total time: 2–3 minutes • 100% online
          </p>
        </div>
      </div>
    </div>
  );
}
