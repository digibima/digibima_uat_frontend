"use client";

import { useState } from "react";
import { FaBell, FaUserCircle, FaSignOutAlt, FaUser, FaChevronDown, FaChevronUp, FaBars } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/router";
import { CallApi, clearDBData } from "@/api";
import { showSuccess } from "@/layouts/toaster";
import constant from "@/env";

export default function TopBar({ setActivePage, admindata, token, setIsMobileMenuOpen, isMobileMenuOpen }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const logout = async () => {
    try {
      await clearDBData();
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch {}

    document.cookie = "token=; Max-Age=0; path=/; samesite=lax; secure";

    setIsDropdownOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/dashboard/admin/login");
    try {
      const response = await CallApi("/api/logout", "POST", "");
      if (response?.message) {
        showSuccess(response.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="flex flex-wrap justify-between items-center p-4 bg-sky-100 gap-y-4">
      <button
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        className="md:hidden p-2 text-gray-800"
      >
        <FaBars />
      </button>

      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-xs lg:max-w-sm">
        <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search"
          className="pl-10 pr-4 py-2 rounded-full w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
          <FaBell className="text-purple-600 text-lg" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center">
              2
            </span>
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-[#CF5DCD] px-4 py-2 rounded-full text-white"
          >
            <FaUserCircle className="text-lg" />
            <span>Hi, {admindata?.admin || "Guest"}</span>
            {isDropdownOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
              <ul className="divide-y divide-gray-100 text-sm text-gray-700">
                {!admindata?.admin && !token ? (
                  <li
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push(constant.ROUTES.INDEX);
                    }}
                    className="px-5 py-3 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 cursor-pointer font-medium flex items-center gap-2"
                  >
                    <FaUser className="text-blue-400 w-4 h-4" />
                    Login
                  </li>
                ) : (
                  <>
                    <li
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setActivePage("dashboard");
                      }}
                      className="px-5 py-3 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 cursor-pointer font-medium flex items-center gap-2"
                    >
                      <FaUser className="text-blue-400 w-4 h-4" />
                      Profile
                    </li>

                    <li
                      onClick={() => {
                        logout();
                      }}
                      className="px-5 py-3 hover:bg-red-50 hover:text-red-600 transition-all duration-150 cursor-pointer font-medium flex items-center gap-2"
                    >
                      <button className="flex items-center gap-2">
                        <FaSignOutAlt className="text-red-400 w-4 h-4" />
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}