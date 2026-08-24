"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/layouts/toaster";
import { CallApi } from "@/api";
import constant from "@/env";
import { FaUserShield } from "react-icons/fa";
import Image from 'next/image';
import { adminlogin } from "@/images/Image";

const AdminLogin  = ({ usersData }) => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(20);
  const [canResend, setCanResend] = useState(false);
  const [stoken, setToken] = useState();
  const router = useRouter();

  useEffect(() => {
    let interval;
    if (showOtp && timer > 1) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 1) {
      clearInterval(interval);
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  const isValidMobile = (number) => /^[0-9]{10}$/.test(number);

  const sendOTP = async () => {
    try {
      if (!isValidMobile(mobile)) {
        showError("Enter only Admin number");
        return;
      }

      const payload = { mobile };
      const response = await CallApi(
        constant.API.ADMIN.ADMINLOGIN,
        "POST",
        payload
      );
      if (response.status === false) {
        showError(response.message);
        return;
      }

      if (response.status === true) {
           localStorage.setItem("token", response.token);
           localStorage.setItem("logintype", "admin");
          //  console.log("token", response.token)
          setToken(response.token);
          window.dispatchEvent(new Event("auth-change"));
        const data = { mobile };
        const res = await CallApi(
          constant.API.ADMIN.SENDOTP,
          "POST",
          data
        );
        if (res.status === true) showSuccess(res.message);
       
         
        setShowOtp(true);
        setTimer(20);
        setCanResend(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isValidOtp = (code) => /^[0-9]{6}$/.test(code);

  const verifyOTP = async () => {
    try {
      if (!isValidOtp(otp)) {
        showError("Please enter a valid OTP");
        return;
      }

      const data = { mobile, otp };
      const response = await CallApi(
        constant.API.HEALTH.VERIFYOTP,
        "POST",
        data
      );
      if (response.status === false) {
        showError(response.message);
      }

      if (response.status === true) {
      
        showSuccess("Welcome to admin dashboard");
        // router.push(constant.ROUTES.ADMIN.ADMINDASHBOARD);
        router.push(`adminpnlx/admin-dashboard`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!showOtp) sendOTP();
  };

  const handleResend = () => {
    sendOTP();
    setOtp("");
    setTimer(20);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#C2EBFF] px-4 mt-10">
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden w-full max-w-4xl grid md:grid-cols-[46%_54%] transition-all">
        {/* Left Side */}
        <div className="px-10 py-8 flex flex-col justify-center items-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text flex items-center gap-3">
            <FaUserShield className="text-4xl text-indigo-600 drop-shadow-md" />
            Admin Login
          </h2>
          <p className="text-gray-500 text-center text-sm">
            Enter your registered mobile number to receive an OTP.
          </p>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {!showOtp ? (
              <>
                <input
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) setMobile(input);
                  }}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all outline-none"
                  required
                />
                <div className="text-center">
                  <button type="submit" className="px-6 py-3 thmbtn">
                    Send OTP
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,6}$/.test(input)) setOtp(input);
                  }}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-400 transition-all outline-none"
                  required
                />

                {!canResend ? (
                  <p className="text-sm text-red-500 text-center">
                    Resend OTP in <b>{timer}s</b>
                  </p>
                ) : (
                  <p
                    className="text-sm text-blue-500 text-center cursor-pointer hover:underline"
                    onClick={handleResend}
                  >
                    Didn&apos;t receive OTP?{" "}
                    <span className="font-semibold">Resend</span>
                  </p>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={verifyOTP}
                    className="px-6 py-3 thmbtn"
                  >
                    Verify OTP
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Right Side Image - hidden on small screens */}
        <div className="hidden md:block relative h-[512px] overflow-hidden">
          <Image
            src={adminlogin}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative h-full flex flex-col justify-center items-center text-white px-6 text-center">
            <h2 className="absolute top-[20%] w-full text-center text-3xl font-bold leading-snug">
              Welcome
              <br />
              To Digibima
            </h2>
            <p className="absolute bottom-6 w-full text-center text-sm px-6">
              Please enter your registered mobile number
              <br />
              to access the admin dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin ;
