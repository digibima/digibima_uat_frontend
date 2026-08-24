"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, useContext } from "react";
import Modal from "@/components/modal";
import {
  FaEnvelope,
  FaSignOutAlt,
  FaUser,
  FaPhoneAlt,
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
  FaBell,
} from "react-icons/fa";
import { CallApi, clearDBData } from "../../api";
import constant from "../../env";
import { useRouter } from "next/router";
import { showSuccess } from "@/layouts/toaster";
import Link from "next/link";
import { logo } from "@/images/Image";
import { UserContext } from "@/context/UserContext";

export default function Header() {
  const router = useRouter();
  const { userData, setUserData, token, setToken } = useContext(UserContext);

  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState(userData?.name || "Guest");
  const [loading, setLoading] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await CallApi(constant.API.USER.NOTIFICATION, "GET");

      if (res?.status) {
        const formatted = (res.notification || []).map((n) => ({
          id: n.notificationId ?? n.id,
          message: n.message ?? "",
          time: n.time ?? "",
          vendor: n.vendor,
          type: n.type,
          read: Boolean(n.read ?? n.isRead ?? false),
        }));

        setNotifications(formatted);

        if (res?.user?.name) {
          setUserName(res.user.name);
          setUserData(res.user); 
        }
      }
    } catch (err) {
      console.error("Notification fetch error →", err);
    }
    setLoading(false);
  }, [token, setUserData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markNotificationsRead = async (id = null) => {
    try {
      setNotifications((prev) =>
        prev.map((n) =>
          id === null || n.id === id ? { ...n, read: true } : n
        )
      );

      const payload = id ? { notificationId: id } : { notificationId: false };
      await CallApi(constant.API.USER.MARKNOTIFICATION, "POST", payload);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const logout = async () => {
    try {
      await clearDBData();
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch {}

    document.cookie = "token=; Max-Age=0; path=/; samesite=lax; secure";

    setToken(null);
    setUserData(null);
    setUserName("Guest");
    setIsDropdownOpen(false);

    window.dispatchEvent(new Event("auth-change"));
    window.dispatchEvent(new Event("user-logout"));

    router.push("/");

    try {
      const res = await CallApi("/api/logout", "POST", "");
      if (res?.message) {
        showSuccess(res.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    if (userData?.name) setUserName(userData.name);
  }, [userData]);

  return (
    <header className="w-full bg-[#C8EDFE]">

      <div className="w-full bg-gradient-to-r from-[#28A7E4] to-[#4C609A] text-white text-sm px-6 py-2 flex justify-between">
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-xs" />
          <span>info@digibima.com</span>
        </div>
        <div className="flex items-center gap-2">
          <FaPhoneAlt className="text-xs" />
          <span>+91 9119 173 733</span>
        </div>
      </div>

      <div className="bg-white px-6 py-4 mx-4 flex justify-between items-center rounded-bl-[40px] rounded-br-[40px] shadow border-b">
        
        <Link href="/">
          <Image src={logo} alt="DigiBima Logo" className="h-[35px] w-auto" />
        </Link>

        <div className="flex items-center gap-4">

          {token && (
            <button
              onClick={() => setShowNotificationModal(true)}
              className="w-10 h-10 rounded-full bg-[#C2EBFE] flex items-center justify-center shadow relative"
            >
              <FaBell className="text-purple-600 text-lg" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>
          )}

          <div className="relative">
             <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-[#CF5DCD] px-4 py-2 rounded-full text-white"
            >
              <FaUserCircle className="text-lg" />
              <span>Hi, {userName}</span>
              {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border z-50">
                <ul className="text-sm divide-y">

                  {!token ? (
                    <li
                      onClick={() => router.push("/login/mainlogin")}
                      className="px-5 py-3 hover:bg-blue-50 cursor-pointer rounded-xl flex items-center gap-2"
                    >
                      <FaUser className="text-blue-500" />
                      Login
                    </li>
                  ) : (
                    <>
                      <li
                        onClick={() => router.push(constant.ROUTES.USER.PROFILE)}
                        className="px-5 py-3 hover:bg-blue-50 cursor-pointer rounded-xl flex items-center gap-2"
                      >
                        <FaUser className="text-blue-500" />
                        Profile
                      </li>

                      <li
                        onClick={logout}
                        className="px-5 py-3 hover:bg-red-50 cursor-pointer flex items-center gap-2"
                      >
                        <FaSignOutAlt className="text-red-500" />
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

      <Modal
        isOpen={showNotificationModal}
        onClose={async () => {
          await markNotificationsRead(null);
          setShowNotificationModal(false);
        }}
        title="Notifications"
        width="max-w-md"
        height="max-h-[70vh]"
      >
        {loading ? (
          <p>Loading…</p>
        ) : notifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          <ul className="space-y-2 max-h-[50vh] overflow-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => markNotificationsRead(n.id)}
                className={`p-2 rounded bg-gray-50 flex justify-between cursor-pointer ${
                  !n.read ? "hover:bg-gray-100" : "opacity-70"
                }`}
              >
                <div className="text-sm">
                  {n.message}
                  {(n.vendor || n.type) && (
                    <div className="text-xs text-gray-400">
                      {[n.vendor, n.type].filter(Boolean).join(" • ")}
                    </div>
                  )}
                </div>

                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-green-500 mt-2"></span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </header>
  );
}