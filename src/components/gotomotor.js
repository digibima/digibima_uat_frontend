"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { FaCar } from "react-icons/fa"; 
import constant from "@/env";

const RightSection = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl shadow-lg text-white p-6 relative overflow-hidden"
      >

        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="flex items-center gap-2">
          <FaCar className="text-2xl" />
          <h3 className="text-xl font-bold">Best Motor Plans</h3>
        </div>

        <p className="mt-2 text-sm opacity-90">
          Choose from top motor insurance plans with maximum coverage & savings.
        </p>

<motion.button
  onClick={() => router.push(constant.ROUTES.MOTOR.SELECTVEHICLE)}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="mt-4 relative flex items-center gap-2 bg-white text-indigo-600 font-semibold px-5 py-2 rounded-full shadow-md overflow-hidden"
>
  {/* moving shine layer */}
  <motion.span
    className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200/40 to-transparent"
    animate={{ x: ["-100%", "100%"] }}
    transition={{
      duration: 1.8,
      repeat: Infinity,
      ease: "linear",
    }}
  />

  {/* content */}
  <span className="relative z-10 flex items-center gap-2">
    <span>Get Motor Insurance</span>

    {/* animated icon */}
    <motion.span
      animate={{ x: [-4, 4, -4] }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <FiArrowRight />
    </motion.span>
  </span>
</motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition"
      >
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          Why Choose Our Motor Insurance?
        </h3>
        <ul className="mt-3 text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>Cashless repair network</li>
          <li>24/7 roadside assistance</li>
          <li>Instant claim settlement</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default RightSection;
