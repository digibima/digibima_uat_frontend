// pages/_app.js
"use client";
import "@/styles/globals.css";
import "@/styles/css/digibima.css";
import Header from "./partial/header";
import Footer from "./partial/footer";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import CarInsuranceLoader, {
  BikeInsuranceLoader,
  HealthLoaderOne,
  DashboardLoader,
} from "@/components/loader";
import { useRouter } from "next/router";
import { VerifyToken, getUserinfo } from "../api";
import constant from "../env";
import { PrimeReactProvider } from "primereact/api";
import { UserContext } from "@/context/UserContext";
import { showError } from "@/layouts/toaster";
import ErrorBoundary from "@/components/errorboundary";
// react-query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: true,
    },
  },
});

// Explicit Public Routes array
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/login/mainlogin",
  "/adminpnlx",
  "/insurance",
];

export default function App({ Component, pageProps }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [kycData, setKycData] = useState({ status: null, kyctype: null });

  const router = useRouter();
  const currentPath = router.pathname;
  const isDashboard =
    currentPath.startsWith("/userpnlx") ||
    currentPath.startsWith("/adminpnlx") ||
    currentPath.startsWith("/dashboard");

  // Custom User Logout Event Listener
  useEffect(() => {
    const handleUserLogout = () => {
      setToken(null);
      setUserData(null);
      setKycData({ status: null, kyctype: null });
      localStorage.removeItem("token");
    };
    window.addEventListener("user-logout", handleUserLogout);
    return () => window.removeEventListener("user-logout", handleUserLogout);
  }, []);

  // Centralized Auth Verification & Route Protection
  useEffect(() => {
    if (!router.isReady) return;

    const verifyAuthAndCheckRoute = async () => {
      setLoading(true);
      const storedToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const pathWithQuery = router.asPath;
      const isPublic = PUBLIC_ROUTES.some(
        (route) => pathWithQuery.startsWith(route) || currentPath === route
      );

      if (!storedToken) {
        setToken(null);
        setUserData(null);
        setKycData({ status: null, kyctype: null });

        if (!isPublic) {
          showError("You must be logged in to access this page.");
          router.push(constant?.WEBSITEURL || "/");
        }
        setLoading(false);
        return;
      }

      try {
        const res = await VerifyToken(storedToken);
        const data = await res.json();

        if (data.status) {
          setToken(storedToken);
          window.dispatchEvent(
            new CustomEvent("auth-change", {
              detail: { token: storedToken },
            })
          );
        } else {
          localStorage.removeItem("token");
          setToken(null);
          if (!isPublic) {
            showError("Session expired. Please log in again.");
            router.push(constant?.WEBSITEURL || "/");
          }
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        setToken(null);
        if (!isPublic) {
          router.push(constant?.WEBSITEURL || "/");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuthAndCheckRoute();

    const handleAuthChange = () => {
      const updatedToken = localStorage.getItem("token");
      setToken(updatedToken);
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [router.isReady, currentPath, router.asPath]);

  // Fetch User Details
  useEffect(() => {
    if (!token) {
      setUserData(null);
      setKycData({ status: null, kyctype: null });
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await getUserinfo(token);
        const data = await response.json();

        if (data.status) {
          setUserData(data.user);
          setKycData({
            status: data.status,
            kyctype: data.kyctype,
          });
        }
      } catch (err) {
        console.error("Fetch user failed:", err);
      }
    };

    fetchUser();
    router.events.on("routeChangeComplete", fetchUser);

    return () => {
      router.events.off("routeChangeComplete", fetchUser);
    };
  }, [token, router]);

  // Global Navigation Loading Indicators
  useEffect(() => {
    const handleStart = () => setPageLoading(true);
    const handleComplete = () => setPageLoading(false);
    const handleError = () => setPageLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleError);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleError);
    };
  }, [router]);

  const renderLoader = () => {
    if (currentPath.startsWith("/health")) return <HealthLoaderOne />;
    if (currentPath.startsWith("/compare") && router.query.type === "health")
      return <HealthLoaderOne />;
    if (currentPath.startsWith("/motor/bike")) return <BikeInsuranceLoader />;
    if (currentPath.startsWith("/motor")) return <CarInsuranceLoader />;
    if (currentPath.startsWith("/compare") && router.query.type === "motor")
      return <CarInsuranceLoader />;
    return <DashboardLoader />;
  };

  return (
    <div className={poppins.className}>
      {loading || pageLoading ? (
        renderLoader()
      ) : (
        <QueryClientProvider client={queryClient}>
          <PrimeReactProvider>
            <Toaster />

            <UserContext.Provider
              value={{
                userData,
                setUserData,
                kycData,
                setKycData,
                token,
                setToken,
              }}
            >
              {!isDashboard && <Header />}

              <ErrorBoundary>
                <Component
                  {...pageProps}
                  usersData={userData}
                  kycData={kycData}
                  token={token}
                />
              </ErrorBoundary>

              {!isDashboard && <Footer />}
            </UserContext.Provider>

            <ReactQueryDevtools initialIsOpen={false} />
          </PrimeReactProvider>
        </QueryClientProvider>
      )}
    </div>
  );
}