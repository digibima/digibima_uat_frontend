// user-dashboard/DashboardLayout.jsx
import { useEffect, useState } from "react";
import { showError } from "@/layouts/toaster";
import Sidebar from "./sidbar";
import TopBar from "./topbar";
import { DashboardLoader } from "@/components/loader";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const { userData, token } = useUser() || {};

  useEffect(() => {
    const loginType =
      typeof window !== "undefined" && localStorage.getItem("logintype");
    if (loginType !== "user") {
      showError("Please log in to access your account dashboard.");
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [router.asPath]);

  // URL -> activePage (sidebar highlight)
  useEffect(() => {
    const p = router.asPath || "";
    if (/^\/user-dashboard(\/)?$/.test(p)) setActivePage("dashboard");
    else if (p.includes("/user-dashboard/policies")) setActivePage("policies");
    else if (p.includes("/user-dashboard/claims")) setActivePage("claims");
    else if (p.includes("/user-dashboard/profile")) setActivePage("profile");
  }, [router.asPath]);

  if (loading) return <DashboardLoader />;

  return (
    <div className="flex h-screen bg-sky-100">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        openMenus={openMenus}
        setOpenMenus={setOpenMenus}
        setActivePage={setActivePage}
        activePage={activePage}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white shadow">
          <TopBar
            collapsed={collapsed}
            setActivePage={setActivePage}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            userData={userData}
          />
        </div>
        <div className="p-6 mt-4">{children}</div>
      </main>
    </div>
  );
}
