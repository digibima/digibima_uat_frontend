"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/layouts/toaster";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  BadgeCheck,
  FileText,
} from "lucide-react";

export default function EmployeeLoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullname: "",
    employeeId: "",
    email: "",
    mobile: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = (e) => {
  e.preventDefault();

  const isValid = Object.values(formData).every(
    (value) => value.trim() !== ""
  );

  if (!isValid) {
    showError("Please fill all fields");
    return;
  }

const employeeDetails = {
  employeeId: formData.employeeId,
  employeeName: formData.fullname,
  email: formData.email,
  mobile: formData.mobile,
};

sessionStorage.setItem(
  "employeeDetails",
  JSON.stringify(employeeDetails)
);

  router.push("/sales/quotationgenerate");
};
  return (
    <div className="min-h-screen  flex items-center justify-center px-4 py-10 overflow-hidden relative">

      <div className="absolute top-0 left-0 w-96 h-96 bg-[#2B9AD6]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C95AE8]/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-[34px] overflow-hidden bg-white shadow-[0_20px_80px_rgba(43,154,214,0.12)] border border-[#DCE6F5] relative z-10">

        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#2B9AD6] via-[#3D82C7] to-[#344B87] p-14 text-white relative overflow-hidden">

          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#C95AE8]/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">

            <div className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl mb-10">
              <ShieldCheck size={46} />
            </div>

            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Employee <br /> Verification Portal
            </h1>

            <p className="text-lg leading-relaxed text-blue-100 max-w-lg">
              Securely verify employee credentials and continue to the
              quotation management system with a trusted and professional
              workflow experience.
            </p>

            <div className="mt-14 space-y-6">

              <FeatureItem
                icon={<BadgeCheck size={22} />}
                text="Professional Company Verification"
              />

              <FeatureItem
                icon={<ShieldCheck size={22} />}
                text="Secure Employee Access System"
              />

              <FeatureItem
                icon={<FileText size={22} />}
                text="Instant Quotation Workflow"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-14 flex items-center">
          <div className="w-full max-w-md mx-auto">

            <div className="text-center mb-10">

              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-r from-[#2B9AD6] via-[#4B7BC9] to-[#C95AE8] flex items-center justify-center shadow-xl text-white">
                <ShieldCheck size={42} />
              </div>

              <h2 className="text-4xl font-bold text-[#1E2A4A] mt-6">
                Employee Login
              </h2>

              <p className="text-[#6E7B96] mt-3 text-base">
                Enter your official company information to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <InputField
                icon={<User size={18} />}
                placeholder="Full Name"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
              />

              <InputField
                icon={<Briefcase size={18} />}
                placeholder="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
              />

              <InputField
                icon={<Mail size={18} />}
                placeholder="Company Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              <InputField
                icon={<Phone size={18} />}
                placeholder="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />


              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2B9AD6] via-[#4B7BC9] to-[#C95AE8] text-white font-semibold text-lg shadow-lg hover:scale-[1.01] hover:shadow-xl transition-all duration-300"
              >
                Verify & Continue
              </button>
            </form>

            <p className="text-center text-sm text-[#8A94A6] mt-8">
              Secure employee verification powered by Digibima
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/10 backdrop-blur-xl flex items-center justify-center">
        {icon}
      </div>

      <p className="text-lg font-medium text-white">
        {text}
      </p>
    </div>
  );
}

function InputField({
  icon,
  placeholder,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="flex items-center gap-3 bg-[#F8FAFF] border border-[#DCE6F5] rounded-2xl px-4 py-4 transition-all focus-within:border-[#2B9AD6] focus-within:shadow-[0_0_0_4px_rgba(43,154,214,0.10)]">

      <div className="text-[#6E7B96]">
        {icon}
      </div>

      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent outline-none text-[#1E2A4A] placeholder:text-[#8A94A6]"
      />
    </div>
  );
}