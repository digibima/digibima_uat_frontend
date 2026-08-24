"use client";
import { useState } from "react";
import { FaBars, FaHome } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from "next/router";
import Image from "next/image";
import { logoicon, logoTwo } from "@/images/Image";
import {
  FaSignOutAlt,
  FaUser,
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineClipboardCheck } from "react-icons/hi";

export default function Sidebar({
  collapsed,
  setCollapsed,
  setActivePage,
  activePage,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const router = useRouter(); 
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const BASE = "/userpnlx/user-dashboard";


  const pathByKey = {
    dashboard: BASE,
    policies: `${BASE}/policies`,
    claims: `${BASE}/claims`,
    profile: `${BASE}/profile`,
  };

  const menuItems = [
    { title: "Dashboard", icon: <FaHome className="text-xl" />, key: "dashboard" },
    { title: "Policies", icon: <HiOutlineDocumentText className="text-xl" />, key: "policies" },
    { title: "Claims", icon: <HiOutlineClipboardCheck className="text-xl" />, key: "claims" },
    { title: "Profile", icon: <FaUserCircle className="text-xl" />, key: "profile" },
  ];


  const handleItemClick = (key) => {
    setActivePage(key);
    router.push(pathByKey[key]);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-10 top-0 left-0 h-full bg-white shadow-lg p-4 transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-[80vw] sm:w-[60vw] md:w-60"} 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static
          rounded-tr-3xl rounded-br-3xl flex flex-col justify-between overflow-y-auto`}
      >
        {/* Header */}
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 px-2">
            <Image
              src={collapsed ? logoicon : logoTwo}
              onClick={collapsed ? toggleCollapse : undefined}
              className={`object-contain transition-all duration-300 ease-in-out ${collapsed ? "h-8 w-10 cursor-pointer" : "h-8 w-32"}`}
              alt="Logo"
            />
            {!collapsed && (
              <button
                onClick={toggleCollapse}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Collapse sidebar"
              >
                <IoChevronBack />
              </button>
            )}
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-1 text-sm select-none">
            {menuItems.map((item) => (
              <MenuItem
                key={item.key}
                icon={item.icon}
                title={item.title}
                collapsed={collapsed}
                active={activePage === item.key}
                onClick={() => handleItemClick(item.key)}   
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400 text-center mt-4 select-none transition-all duration-300">
          {collapsed ? "©" : "© 2025 DIGIBIMA"}
        </div>
      </div>
    </>
  );
}

function MenuItem({ icon, title, collapsed, active, onClick }) {
  return (
    <div
      className={`flex items-center rounded-lg px-3 py-2 cursor-pointer transition-all duration-300 group
        ${active ? "bg-[#7998F4] text-white" : "hover:bg-[#7998F4] hover:text-white"}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 overflow-hidden transition-all duration-500 ease-in-out">
        <span className="text-lg">{icon}</span>
        <span
          className={`whitespace-nowrap transition-all duration-500 ease-in-out ${
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto ml-1"
          }`}
        >
          {title}
        </span>
      </div>
    </div>
  );
}
