import { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  IndianRupee,
  Hospital,
  Clock,
  Plus,
  FileText,
  Phone,
  CheckCircle,
  ChevronDown,
  BadgeCheck,
  Sparkles,
  Lock,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InsurancePlanPremiumUI() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-[#C2EBFF] to-[#EAF7FF]">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">

        {/* LEFT CONTENT */}
        <div className="col-span-12 lg:col-span-8 space-y-7">

          {/* PLAN IDENTITY */}
          <section className="bg-[#F8FBFF] rounded-2xl border border-[#D6ECFA] shadow-[0_12px_32px_rgba(59,130,246,0.14)] p-6">
            <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border border-blue-100 shadow-sm grid place-items-center">
            <Image
              src="/care.png"
              alt="Health Care Icon"
              width={36}
              height={36}
              className="h-9 w-auto"
            />
          </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Ultimate Care (Direct)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Care Health Insurance
                    </p>
                  </div>

                  <div className="hidden sm:flex gap-2">
                    <Badge text="IRDAI Approved" tone="green" />
                    <Badge text="Cashless Claims" tone="blue" />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 sm:hidden">
                  <Badge text="IRDAI Approved" tone="green" />
                  <Badge text="Cashless Claims" tone="blue" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <Metric icon={<Hospital size={18} />} label="Cover Amount" value="₹10 Lakh" />
                  <Metric icon={<IndianRupee size={18} />} label="Annual Premium" value="₹10,511" />
                  <Metric icon={<ShieldCheck size={18} />} label="Claim Type" value="Cashless" />
                </div>
              </div>
            </div>
          </section>

          {/* WHY THIS PLAN */}
          <section className="bg-[#F8FBFF] rounded-2xl border border-[#D6ECFA] shadow-[0_10px_28px_rgba(59,130,246,0.12)] p-6">
            <SectionTitle icon={<Sparkles size={18} />} title="Why choose this plan?" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Highlight text="2 hour hospitalization covered" />
              <Highlight text="No room rent limits" />
              <Highlight text="Unlimited restoration benefit" />
            </div>
          </section>

          <Accordion title="Coverage Details" icon={<Hospital size={18} />} open>
            <Row label="Room Rent" value="No limit" />
            <Row label="ICU Charges" value="Covered" />
            <Row label="Day Care Procedures" value="Covered" />
            <Row label="AYUSH Treatment" value="Covered" />
          </Accordion>

          <Accordion title="Waiting Periods" icon={<Clock size={18} />}>
            <Timeline label="Initial waiting period" value="30 days" />
            <Timeline label="Pre-existing diseases" value="2 years" />
            <Timeline label="Specific illnesses" value="24 months" />
          </Accordion>

          <Accordion title="Sub-limits & Restrictions" icon={<ShieldCheck size={18} />}>
            <p className="text-sm text-gray-600">
              No disease-wise or room category sub-limits apply under this plan.
            </p>
          </Accordion>

          <Accordion title="Value Added Services" icon={<Plus size={18} />}>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Free annual health check-up</li>
              <li>Tele-consultation</li>
              <li>Second medical opinion</li>
            </ul>
          </Accordion>

          <Accordion title="Policy Documents" icon={<FileText size={18} />}>
            <DocLink text="Policy Wordings (PDF)" />
            <DocLink text="Brochure" />
            <DocLink text="Network Hospitals" />
          </Accordion>

          <section className="bg-[#F8FBFF] border border-dashed border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:justify-between gap-4 shadow-[0_10px_28px_rgba(59,130,246,0.1)]">
            <div>
              <p className="font-semibold text-gray-900">Need help deciding?</p>
              <p className="text-sm text-gray-500">Speak to a health insurance expert</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
              <Phone size={16} /> Get a Call
            </button>
          </section>
        </div>

        {/* RIGHT BUY CARD */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-8 bg-[#F8FBFF] rounded-2xl border border-[#D6ECFA] shadow-[0_20px_50px_rgba(59,130,246,0.2)] p-6 space-y-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Annual Premium</p>
                <p className="text-3xl font-semibold text-gray-900">₹10,511</p>
              </div>
              <span className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-blue-700">
                <Lock size={14} /> Secure checkout
              </span>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="flex justify-between text-sm">
                <span>Cover Amount</span>
                <span className="font-semibold">₹10 Lakh</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Tax Benefit</span>
                <span className="font-semibold">80D</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            >
              Proceed to Buy
            </motion.button>

            <div className="space-y-2 text-xs text-gray-600">
              <TrustLine icon={<Receipt size={14} />} text="Instant policy issuance" />
              <TrustLine icon={<ShieldCheck size={14} />} text="Cashless hospital support" />
              <TrustLine icon={<BadgeCheck size={14} />} text="Tax benefits under 80D" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* COMPONENTS */

function SectionTitle({ icon, title }) {
  return (
    <h2 className="flex items-center gap-2 font-semibold text-gray-900">
      <span className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center text-blue-700">
        {icon}
      </span>
      {title}
    </h2>
  );
}

function Badge({ text, tone }) {
  const cls =
    tone === "blue"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span className={`text-xs border px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${cls}`}>
      <BadgeCheck size={12} /> {text}
    </span>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
      <div className="h-10 w-10 rounded-xl bg-white border border-blue-100 grid place-items-center text-blue-700">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Highlight({ text }) {
  return (
    <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
      <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center text-emerald-700">
        <CheckCircle size={16} />
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-blue-100 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Timeline({ label, value }) {
  return (
    <div className="flex gap-4 text-sm">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5" />
        <div className="w-px flex-1 bg-blue-100 mt-2" />
      </div>
      <div>
        <p className="text-gray-700">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function DocLink({ text }) {
  return (
    <a className="flex items-center gap-2 text-blue-700 hover:underline text-sm">
      <FileText size={16} /> {text}
    </a>
  );
}

function TrustLine({ icon, text }) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-blue-700">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Accordion({ title, icon, children, open = false }) {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <div className="bg-[#F8FBFF] border border-[#D6ECFA] rounded-2xl shadow-[0_10px_28px_rgba(59,130,246,0.12)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between px-6 py-4 hover:bg-blue-50"
      >
        <div className="flex gap-3 items-center">
          <span className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center text-blue-700">
            {icon}
          </span>
          <span className="font-semibold">{title}</span>
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-6 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
