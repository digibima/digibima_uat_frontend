"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { FaHeartbeat } from "react-icons/fa";
import constant from "@/env";

const HealthSection = () => {
  const router = useRouter();

  return (
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
        <FaHeartbeat className="text-2xl" />
        <h3 className="text-xl font-bold">Best Health Plans</h3>
      </div>

      <p className="mt-2 text-sm opacity-90">
        Protect yourself & your family with top health insurance plans.
      </p>

      <button
        onClick={() => router.push(constant.ROUTES.HEALTH.INSURE)}
        className="mt-4 flex items-center gap-2 bg-white text-pink-600 font-semibold px-5 py-2 rounded-full shadow-md hover:bg-gray-100 transition"
      >
        Get Health Insurance <FiArrowRight />
      </button>
    </motion.div>
  );
};

export default HealthSection;
