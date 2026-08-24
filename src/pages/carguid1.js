import React from "react";
import { motion } from "framer-motion";
import {
  Car,
  ShieldCheck,
  FileText,
  Sliders,
  CreditCard,
  CheckCircle,
  Timer,
  Building2,
  Users,
} from "lucide-react";

const BRAND_BLUE = "#1E5A96";

const iconVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  hover: {
    scale: 1.12,
    rotate: 4,
    transition: { duration: 0.3 },
  },
};

/* ---------------- DATA ---------------- */
const flow = [
  {
    id: 1,
    title: "Enter Car Details",
    desc: "Select your car brand, model, fuel type and registration city.",
    icon: Car,
  },
  {
    id: 2,
    title: "Previous Insurance Status",
    desc: "Tell us whether this is a new policy or a renewal and your previous insurer.",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Compare Insurance Plans",
    desc: "Compare plans from top insurance companies in one place.",
    icon: Sliders,
  },
  {
    id: 4,
    title: "Choose Add-ons (Optional)",
    desc: "Select recommended add-ons like Zero Depreciation and Engine Protection.",
    icon: FileText,
  },
  {
    id: 5,
    title: "Secure Payment & Policy Issuance",
    desc: " Complete payment using secure online options.",
    icon: CreditCard,
  },
];

export default function InsuranceFlowGuide() {
  return (
    <div className="min-h-screen bg-[#C3ECFE] py-24 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="mb-32">
          <div className="bg-white/70 backdrop-blur-xl border border-white/70 rounded-[32px] px-10 py-14 shadow-[0_25px_60px_-30px_rgba(30,90,150,0.5)]">
            
            <p className="text-center text-sm text-slate-500">
              Complete protection for your car — simple & transparent
            </p>

            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-center text-slate-900">
              Find the{" "}
              <span style={{ color: BRAND_BLUE }}>
                Right Car Insurance
              </span>{" "}
              for Your Vehicle
            </h1>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" style={{ color: BRAND_BLUE }} />
                Policy renewal in minutes
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: BRAND_BLUE }} />
                Multiple insurers to compare
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: BRAND_BLUE }} />
                Trusted by thousands of car owners
              </div>
            </div>

            <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
              <input
                type="text"
                placeholder="Enter your car number (e.g. DL01AB1234)"
                className="w-full md:w-[420px] px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2"
                style={{ outlineColor: BRAND_BLUE }}
              />
              <button
                className="px-8 py-4 rounded-xl text-white font-semibold shadow-lg transition hover:opacity-90"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                View Insurance Options
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              Buying insurance for a brand new car?{" "}
              <span
                className="font-semibold cursor-pointer"
                style={{ color: BRAND_BLUE }}
              >
                Click here
              </span>
            </p>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-center text-slate-900"
        >
          Steps to Buy Your Car Insurance Plan from DigiBima
        </motion.h1>

        <p className="text-center text-slate-600 max-w-2xl mx-auto mt-4">
          A simple, transparent and fully online insurance journey.
          Here’s exactly what happens from start to finish.
        </p>

        <div className="relative mt-32 hidden md:block">
          <svg
            className="absolute top-16 left-0 w-full h-56"
            viewBox="0 0 1200 220"
            fill="none"
          >
            <path
              d="M0 130 C 220 40, 380 220, 600 130 C 820 40, 980 220, 1200 130"
              stroke={BRAND_BLUE}
              strokeOpacity="0.18"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <motion.path
              d="M0 130 C 220 40, 380 220, 600 130 C 820 40, 980 220, 1200 130"
              stroke={BRAND_BLUE}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="80 420"
              animate={{ strokeDashoffset: [0, -500] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          <div className="grid grid-cols-5 gap-14 relative z-10">
            {flow.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group rounded-[28px] p-7 text-center
                bg-white/90 backdrop-blur-xl border border-white/70
                shadow-[0_20px_40px_-20px_rgba(30,90,150,0.45)]
                hover:shadow-[0_30px_60px_-20px_rgba(30,90,150,0.6)] transition"
              >
                <div
                  className="mx-auto -mt-14 w-12 h-12 rounded-full
                  bg-white/80 border flex items-center justify-center
                  font-semibold shadow-md"
                  style={{ borderColor: BRAND_BLUE, color: BRAND_BLUE }}
                >
                  {step.id}
                </div>

                <motion.div
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className="w-16 h-16 mx-auto mt-6 rounded-2xl
                  flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: "rgba(30,90,150,0.15)" }}
                >
                  <step.icon className="w-8 h-8" style={{ color: BRAND_BLUE }} />
                </motion.div>

                <h3 className="mt-6 font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 md:hidden space-y-6">
          {flow.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 bg-white/65 backdrop-blur-lg border border-white/70 shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full bg-white/80 border flex items-center justify-center font-semibold"
                  style={{ borderColor: BRAND_BLUE, color: BRAND_BLUE }}
                >
                  {step.id}
                </div>
                <motion.div
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <step.icon className="w-6 h-6" style={{ color: BRAND_BLUE }} />
                </motion.div>
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 text-center">
          <button
            className="px-12 py-4 rounded-xl text-white font-semibold shadow-xl hover:opacity-90 transition"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            Start Buying Insurance
          </button>

          <p className="text-sm text-slate-500 mt-3 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Takes only 2–3 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
