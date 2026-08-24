"use client";
import Image from "next/image";
import { useState } from "react";
import { logoicon, logoTwo } from "@/images/Image";
import { FaHome, FaUsers, FaChevronRight } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoChevronBack } from "react-icons/io5";

export default function Sidebar({
  collapsed,
  setCollapsed,
  openMenus,
  setOpenMenus,
  setActivePage,
  activePage,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const toggleSubmenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const menuItems = [
    { title: "Dashboard", icon: <FaHome />, key: "dashboard" },
    { title: "Manage", icon: <FaUsers />, submenu: [
        { label: "Manage Plan", key: "manageplan" },
        { label: "Manage Vendor", key: "managevendor" },
        { label: "Manage Product", key: "manageproduct" },
        { label: "Manage User", key: "manageuser" },
        { label: "Manage Policy", key: "managepolicy" },
        { label: "Recycle Bin", key: "recyclebin" },
      ] },
    {
      title: "Edit Footer",
      icon: <FaUsers />,
      submenu: [
       { label: "Edit Footer", key: "editfooter" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-50 top-0 left-0 h-full bg-white shadow-lg p-4 transition-all duration-300 ease-in-out
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

            {/* Collapsed sidebar button */}
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
              <div key={item.key || item.title}>
                <MenuItem
                  icon={item.icon}
                  label={item.title}
                  dropdown={!!item.submenu}
                  collapsed={collapsed}
                  isOpen={openMenus[item.title]}
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.title);
                    } else {
                      setActivePage(item.key);
                      setIsMobileMenuOpen(false); // Close menu on page change in mobile view
                    }
                  }}
                  active={activePage === item.key || (item.submenu && item.submenu.some((sub) => sub.key === activePage))}
                />

                {/* Submenu */}
                {item.submenu && (
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden origin-top
                      ${collapsed ? "max-h-0 opacity-0 pointer-events-none" : openMenus[item.title] ? "max-h-60 opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"}
                    `}
                  >
                    {item.submenu.map((subItem) => (
                      <SubMenuItem
                        key={subItem.key}
                        label={subItem.label}
                        onClick={() => {
                          setActivePage(subItem.key);
                          setIsMobileMenuOpen(false); // Close menu on sub-menu click in mobile view
                        }}
                        active={activePage === subItem.key}
                      />
                    ))}
                  </div>
                )}
              </div>
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

// Menu Item Component
function MenuItem({ icon, label, collapsed, isOpen, onClick, active, dropdown = false }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-all duration-300 group
        ${active ? "bg-[#7998F4] text-white" : "hover:bg-[#7998F4] hover:text-white"}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className={`whitespace-nowrap transition-all duration-500 ease-in-out ${collapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-[200px]"}`}>
          {label}
        </span>
      </div>
      {!collapsed && dropdown && (
        <IoMdArrowDropdown
          size={18}
          className={`transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "group-hover:rotate-180"}`}
        />
      )}
    </div>
  );
}

// Submenu Item Component
function SubMenuItem({ label, onClick, active }) {
  return (
    <div
      className={`flex items-center gap-2 ml-8 mt-1 px-3 py-1 rounded-md cursor-pointer
        transition-colors duration-300 shadow-sm hover:shadow-md
        ${active ? "bg-[#7998F4] text-white" : "text-gray-600 hover:bg-[#7998F4] hover:text-white"}`}
      role="menuitem"
      tabIndex={0}
      onClick={onClick}
    >
      <FaChevronRight className="text-sm" />
      <span className="select-none">{label}</span>
    </div>
  );
}
