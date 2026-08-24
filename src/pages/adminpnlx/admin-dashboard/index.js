"use client";

import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import TopBar from "./topbar";
import DashboardCards from "../pages/dashboard";
import ManagePlan from "../pages/manage-plan";
import ManageProduct from "../pages/manage-product";
import ManageUser from "../pages/manage-user";
import ManageVendor from "../pages/manage-vendor";
import ManagePolicy from "../pages/manage-policy";
import RecycleBin from "../pages/recycle-bin";
import EditFooter from "../edit-footer";
import { DashboardLoader } from "@/components/loader";
import { useRouter } from "next/router";
import { CallApi } from "@/api";
import constant from "@/env";
 const publicRoutes = ["/adminpnlx"];
 import { showSuccess, showError } from "@/layouts/toaster";

export default function DashboardPage({ usersData }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [admindata, setAdminData] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  
  const { pathname } = router;
 
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []); 

  useEffect(() => {
    if (!token) return;
    const fetchUserData = async () => {
      try {
        const response = await CallApi(constant.API.ADMIN.ADMINLOGINDATA, "GET");
        if (response.status && response.data) {
          setAdminData(response.data); 
        }
      } catch (error) {
        console.error("❌ API Error:", error);
      }
    };

    fetchUserData();
  }, [token]);

  useEffect(() => {
    if (router.isReady && router.query.tab) {
      setActivePage(router.query.tab);
    }
  }, [router.isReady, router.query.tab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second loader
    return () => clearTimeout(timer);
  }, [activePage]);



  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardCards admindata={admindata} token={token} />;
      case "manageplan":
        return <ManagePlan token={token} />;
      case "manageproduct":
        return <ManageProduct token={token} />;
      case "manageuser":
        return <ManageUser token={token} />;
      case "managevendor":
        return <ManageVendor token={token} />;
      case "managepolicy":
        return <ManagePolicy token={token} />;
      case "recyclebin":
        return <RecycleBin token={token} />;
      case "editfooter":
        return <EditFooter token={token} />;
      default:
        return <p>Page Not Found</p>;
    }
  };

useEffect(() => {
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const loginType = localStorage.getItem("logintype");
    const path = router.pathname; 
    const isPublic = publicRoutes.some(publicRoute => path.startsWith(publicRoute));
    
    if (!token || loginType !== "admin") {
      router.push("/adminpnlx");
      showError("Access denied. Admin login required.");
      return;
    }

    setLoading(false);
  };

  checkAuth();
}, [pathname, router]);



  return (
    <>
      {loading ? (
        <DashboardLoader />
      ) : (
        <div className="flex h-screen bg-sky-100">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            openMenus={openMenus}
            setOpenMenus={setOpenMenus}
            setActivePage={setActivePage}
            activePage={activePage}
            isMobileMenuOpen={isMobileMenuOpen}          
            setIsMobileMenuOpen={setIsMobileMenuOpen}    
          />
          <main className="flex-1 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white shadow">
              <TopBar 
                collapsed={collapsed}
                setActivePage={setActivePage} 
                admindata={admindata} 
                token={token}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                 isMobileMenuOpen={isMobileMenuOpen}
              />
            </div>
            <div className="p-6 mt-4">{renderPage()}</div>
          </main>
        </div>
      )}
    </>
  );
}
