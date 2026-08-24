// pages/_app.js

// Import necessary modules and styles
import "@/styles/globals.css";
import "@/styles/css/digibima.css";
import Header from "./partial/header";
import Footer from "./partial/footer";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import HealthInsuranceLoader from "./health/loader";
import { useRouter } from "next/router";
import { VerifyToken, getUserinfo } from "../api";
import constant from "../env";
import { PrimeReactProvider } from 'primereact/api';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

export default function App({ Component, pageProps }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [kycData, setKycData] = useState({ status: null, kyctype: null });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const route = router.pathname;
  const splitRoute = route.trim().split("/").filter(segment => segment !== "")[0];

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setToken(null);
        setLoading(false);
        if ('/' + splitRoute === constant.ROUTES.HEALTH.INDEX) {
          router.push(constant.ROUTES.HEALTH.INDEX);
        }
        if ('/' + splitRoute === constant.ROUTES.MOTOR.INDEX) {
          router.push(constant.ROUTES.MOTOR.INDEX);
        }
        return;
      }

      try {
        const res = await VerifyToken(storedToken);
        const data = await res.json();
        if (data.status) {
          setToken(storedToken);
        } else {
          // localStorage.removeItem("token");
          setToken(null);
          if ('/' + splitRoute === constant.ROUTES.HEALTH.INDEX) {
            router.push(constant.ROUTES.HEALTH.INDEX);
          }
          if ('/' + splitRoute === constant.ROUTES.MOTOR.INDEX) {
            router.push(constant.ROUTES.MOTOR.INDEX);
          }
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        // localStorage.removeItem("token");
        setToken(null);
        if ('/' + splitRoute === constant.ROUTES.HEALTH.INDEX) {
          router.push(constant.ROUTES.HEALTH.INDEX);
        }
        if ('/' + splitRoute === constant.ROUTES.MOTOR.INDEX) {
          router.push(constant.ROUTES.MOTOR.INDEX);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();

    const handleAuthChange = () => {
      const updatedToken = localStorage.getItem("token");
      setToken(updatedToken);
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [router, splitRoute]); // Include router and splitRoute in the dependency array

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await getUserinfo(token);
          const data = await response.json();
          setKycData({ status: data.status, kyctype: data.kyctype });
          if (data.status && data.user?.name) {
            setUserData(data.user);
          } else {
            setUserData(null);
            setKycData({ status: false, kyctype: null });
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          setUserData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [token]);

  return (
    <div className={poppins.className}>
      <Header token={token} username={userData?.name} setUsername={setUserData} />
      {loading ? (
        <HealthInsuranceLoader />
      ) : (
        <>
          <PrimeReactProvider>
            <Toaster />
            <Component {...pageProps} usersData={userData} kycData={kycData} token={token} />
          </PrimeReactProvider>
          <Footer />
        </>
      )}
    </div>
  );
}
