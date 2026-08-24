"use client";
import { FaCar } from "react-icons/fa";
import { motion } from "framer-motion";
import { FaMotorcycle } from "react-icons/fa";
import Lottie from "lottie-react";
import dashboardLoader from "@/animation/dashboardloader.json";
import HealthLoader from "@/animation/Healthloader.json";




export default function CarInsuranceLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Spinner with Icon */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-[#28A7E4] animate-spin" />
          <FaCar className="text-[#28A7E4] text-4xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Loader Text */}
        <p className="text-[#2F4A7E] font-semibold text-sm text-center">
          Fetching the best motor insurance deals...
        </p>
      </motion.div>
    </div>
  );
}

export function MotorCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-3xl shadow-md p-5 animate-pulse">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-5">

        {/* Logo / Image */}
        <div className="w-24 h-24 bg-blue-100 rounded-2xl shrink-0" />
hello
        {/* Content */}
        <div className="flex-1 w-full space-y-4">

          {/* Title */}
          <div className="h-5 w-52 bg-blue-200 rounded" />

          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-blue-100 rounded" />
            <div className="h-3 w-5/6 bg-blue-100 rounded" />
            <div className="h-3 w-2/3 bg-blue-100 rounded" />
          </div>

          {/* Bottom Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3">

            <div className="flex gap-4">
              <div className="w-24 h-8 bg-blue-100 rounded-xl" />
              <div className="w-28 h-8 bg-blue-100 rounded-xl" />
            </div>

            {/* Price/Button */}
            <div className="w-36 h-10 bg-blue-200 rounded-xl" />
          </div>

        </div>
      </div>
    </div>
  );
}


export  function BikeInsuranceLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center z-[9999]">
      {/* Animated Bike SVG */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-4"
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-pulse"
        >
          <circle
            cx="16"
            cy="48"
            r="10"
            stroke="#2563EB"
            strokeWidth="4"
            className="animate-spin-slow origin-center"
          />
          <circle
            cx="48"
            cy="48"
            r="10"
            stroke="#2563EB"
            strokeWidth="4"
            className="animate-spin-slower origin-center"
          />
          <path
            d="M16 48L28 20L36 34L48 20"
            stroke="#1D4ED8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Text or Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-blue-800 text-lg font-medium mt-2"
      >
        Fetching the best bike insurance plans for you...
      </motion.p>
    </div>
  );
}

export function HealthLoaderOne() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm">
      <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72">
        <Lottie animationData={HealthLoader} loop={true} />
      </div>
    </div>
  );
}



export function DashboardLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="w-32 h-32">
        <Lottie animationData={dashboardLoader} loop={true} />
      </div>
    </div>
  );
}


