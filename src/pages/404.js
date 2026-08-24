// pages/404.jsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ErrorPageImg } from "@/images/Image";

export default function Custom404() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bgcolor px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 flex flex-col items-center text-center max-w-lg"
      >
        <motion.img
          src={ErrorPageImg.src}
          alt="404 Illustration"
          animate={{ y: [0, -8, 0], opacity: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-64 md:w-80 drop-shadow-lg"
        />

        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-5 text-sm md:text-base">
          Oops! The page you’re looking for doesn’t exist or has been moved.
          Let’s get you back on track.
        </p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/"
            className="px-6 py-2 rounded-full bg-[#7998F4] text-white font-medium shadow-md hover:shadow-blue-400/50 hover:bg-blue-600 transition duration-300"
          >
            Go Back Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
