"use client";
import { useUser } from "@/context/UserContext";
import { useState, useEffect, useCallback } from "react";
import {
  FaBell,
  FaBars,
  FaSignOutAlt,
  FaUser,
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { CallApi, clearDBData } from "@/api";
import constant from "@/env";
import { useRouter } from "next/navigation";
import { showSuccess } from "@/layouts/toaster";
import Modal from "@/components/modal";

export default function TopBar({ setActivePage, setIsMobileMenuOpen }) {
  const { userData } = useUser();
  const router = useRouter();

  const [data, setData] = useState({ notifications: [], userName: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [token, setToken] = useState("");
  const displayName = userData?.name || "Guest";

  const BASE = "/userpnlx/user-dashboard";

  // Fetch notifications + username
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await CallApi(constant.API.USER.NOTIFICATION, "GET");
      if (res?.status) {
        const notifications = Array.isArray(res?.notification)
          ? res.notification
          .filter((n) => n.message && String(n.message).trim() !== "") 
          .map((n) => ({
              id: n.notificationId ?? n.id,
              message: n.message ?? "",
              time: n.time ?? "",
              vendor: n.vendor,
              type: n.type,
              read: Boolean(n.read ?? n.isRead ?? false),
              isRead: Boolean(n.isRead ?? n.read ?? false),
            }))
          : [];

        setData({
          notifications,
          userName: res?.user?.name ?? (typeof res?.user === "string" ? res.user : null),

        });
      } else {
        setError("Failed to load notifications");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token") || "");
    }
    fetchData();
  }, [fetchData]);

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
    router.push("/");

    try {
      const response = await CallApi("/api/logout", "POST", "");
      if (response?.message) {
        showSuccess(response.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const markNotificationsRead = async (notificationId = null) => {
    try {
      // Optimistic UI
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          notificationId === null || n.id === notificationId
            ? { ...n, read: true, isRead: true }
            : n
        ),
      }));

      const payload =
        notificationId === null ? { notificationId: false } : { notificationId };
      const res = await CallApi(
        constant.API.USER.MARKNOTIFICATION,
        "POST",
        payload
      );

      if (!res?.status) {
        await fetchData(); // revert if backend failed
        throw new Error(res?.message || "Failed to mark read");
      }
    } catch (err) {
      console.error("Error marking notifications:", err);
    }
  };

const unreadCount = (data?.notifications || []).filter(
  (n) => !n?.isRead && !n?.read
).length;

  return (
    <>
      <Modal
        isOpen={showNotificationModal}
        onClose={async () => {
          await markNotificationsRead(null);
          setShowNotificationModal(false);
        }}
        width="max-w-md"
        height="max-h-[70vh]"
        title="Notifications"
        confirmText="Mark all read"
        onConfirm={async () => {
          await markNotificationsRead(null);
          setShowNotificationModal(false);
        }}
      >
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : data.notifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          <ul className="space-y-2 max-h-[50vh] overflow-auto pr-1">
            {data.notifications.map((n, idx) => {
              const isUnread = !n?.read && !n?.isRead;
              return (
                <li
                  key={n.id ?? idx}
                  onClick={() => markNotificationsRead(n.id)}
                  className={`p-2 rounded bg-gray-50 flex justify-between items-center cursor-pointer ${
                    isUnread ? "hover:bg-gray-100" : "opacity-80"
                  }`}
                  title={isUnread ? "Mark as read" : "Already read"}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      markNotificationsRead(n.id);
                  }}
                >
                  <div className="text-sm font-medium">
                    {n.message}
                    {(n.vendor || n.type) && (
                      <div className="text-xs text-gray-400">
                        {[n.vendor, n.type].filter(Boolean).join(" • ")}
                      </div>
                    )}
                  </div>

                  <div className="relative flex items-center gap-6">
                    {isUnread && (
                      <span className="absolute -left-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>

      {/* Top bar */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-sky-100 gap-y-4">
        <button
          onClick={() => setIsMobileMenuOpen?.((prev) => !prev)}
          className="md:hidden p-2 text-gray-800"
          aria-label="Toggle menu"
        >
          <FaBars />
        </button>

        <div className="relative w-full max-w-xs">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 rounded-full w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowNotificationModal(true)}
            className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow"
            aria-label="Open notifications"
          >
            <FaBell className="text-purple-600 text-lg" />
            {!loading && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((o) => !o)}
              className="flex items-center gap-2 bg-[#CF5DCD] px-4 py-2 rounded-full text-white"
            >
              <FaUserCircle className="text-lg" />
              <span>Hi, {displayName}</span>
              {isDropdownOpen ? (
                <FaChevronUp className="text-sm" />
              ) : (
                <FaChevronDown className="text-sm" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                <ul className="divide-y divide-gray-100 text-sm text-gray-700">
                  {!data.userName && !token ? (
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
                          setActivePage?.("profile");
                          router.push(`${BASE}/profile`);
                        }}
                        className="px-5 py-3 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 cursor-pointer font-medium flex items-center gap-2"
                      >
                        <FaUser className="text-blue-400 w-4 h-4" />
                        Profile
                      </li>

                      <li
                        onClick={logout}
                        className="px-5 py-3 hover:bg-red-50 hover:text-red-600 transition-all duration-150 cursor-pointer font-medium flex items-center gap-2"
                      >
                        <FaSignOutAlt className="text-red-400 w-4 h-4" />
                        Logout
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}