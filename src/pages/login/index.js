"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showSuccess, showError } from "../../layouts/toaster";
import { CallApi, getUserinfo } from "../../api";
import constant from "../../env";
import { isNumber } from "../../styles/js/validation";
import Image from "next/image";
import { healthTwo } from "@/images/Image";
import Modal from "@/components/modal"; 

export default function FormPage({ usersData }) {
  // ==================== 1. MAIN FORM INSTANCE ====================
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      gender: "male",
    }
  });

  // ==================== 2. MODAL FORM INSTANCE ====================
  const {
    register: registerModal,
    handleSubmit: handleModalSubmit,
    setValue: setModalValue,
    watch: watchModal,
    formState: { errors: modalErrors },
    reset: resetModal,
  } = useForm({
    defaultValues: {
      gender: "male",
    }
  });

  const [selectedGender, setSelectedGender] = useState("male");
  const [otpVisible, setOtpVisible] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const otpInputRef = useRef(null);

  const mobile = watch("mobile");
  const name = watch("name");
  const pincode = watch("pincode");
  const email = watch("email");

  const selectedModalGender = watchModal("gender");
  const modalPincode = watchModal("pincode");

  const [cities, setCities] = useState({});
  const [error, setError] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [displayedPincode, setDisplayedPincode] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [stoken, setToken] = useState();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentPayload, setCurrentPayload] = useState(null);
  const [authResolver, setAuthResolver] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "health"; 

  useEffect(() => {
    const handleAuthChange = (event) => {
      const detail = event?.detail ?? null;
      setToken(detail?.token ?? null);

      if (!detail?.token) {
        reset({
          name: "",
          mobile: "",
          pincode: "",
          gender: "male",
          email: "",
        });
        resetModal({
          name: "",
          pincode: "",
          gender: "male",
          email: "",
        });
        setOtp("");
        setOtpVisible(false);
        setIsOtpVerified(false);
        setIsReadOnly(false);
        setCities({});
        setError("");
        setDisplayedPincode("");
        setTimer(0);
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [reset, resetModal]);

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    if (type === "health" && getToken) {
      router.push(constant.ROUTES.HEALTH.INSURE);
    }
    if (type === "motor" && getToken) {
      router.push(constant.ROUTES.MOTOR.SELECTVEHICLE);
    }
    if (getToken) {
      setToken(getToken);
      setIsOtpVerified(true);
      const fetchData = async () => {
        try {
          const data =
            typeof usersData?.json === "function"
              ? await usersData.json()
              : usersData;
          if (data) {
            const defaultVals = {
              name: data.name || "",
              mobile: data.mobile || "",
              pincode: data.pincode || data.pin || "",
              gender: data.gender || "male",
              email: data.email || "",
            };
            reset(defaultVals);
            resetModal(defaultVals);

            if (data.pincode || data.pin) {
              const pin = data.pincode || data.pin;
              setValue("pincode", pin);
              setModalValue("pincode", pin);
              setDisplayedPincode(pin);
            }

            setIsReadOnly(!!data.email);
          }
        } catch (err) {
          console.error("Error fetching user info:", err);
          setIsReadOnly(false);
        }
      };
      fetchData();
    } else {
      setIsReadOnly(false);
    }
  }, [usersData, router, type, reset, resetModal, setValue, setModalValue]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (otpVisible && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [otpVisible]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".city-suggestions") && !e.target.closest(".built-suggestions")) {
        setCities({});
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchCities = async (cleaned) => {
    if (/^\d{5,6}$/.test(cleaned)) {
      let pincodeData = { pincode: cleaned };
      await CallApi(constant.API.HEALTH.PINCODE, "POST", pincodeData)
        .then((pindata) => {
          setCities(pindata);
          setError("");
        })
        .catch(() => {
          setCities({});
          setError("Error fetching city list. Try again.");
          setIsButtonEnabled(false);
        });
    } else {
      setCities({});
    }
  };

  const handleCityClick = (pin, city) => {
    const full = `${pin}${city ? ` (${city})` : ""}`;
    setDisplayedPincode(full);
    setValue("pincode", pin);
    setCities({});
    setIsButtonEnabled(true);
  };

  const sendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      showError("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    try {
      const sendotpdata = { mobile };
      const res = await CallApi(
        constant.API.HEALTH.SENDOTP,
        "POST",
        sendotpdata
      );
      if (res.status) {
        setOtpVisible(true);
        setTimer(30);
        showSuccess("OTP sent to your mobile");
      } else {
        showError("OTP not sent to your mobile");
      }
    } catch (error) {
      showError(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== DEDICATED CONTINUE CLICK FLOW (UNIFIED) ====================
  const handleFormSubmitFlow = async (e) => {
    e.preventDefault();

    if (stoken || isOtpVerified) {
      onSubmit({ mobile });
      return;
    }

    if (!otpVisible) {
      await sendOtp();
      return;
    }

    if (!otp || otp.length !== 6) {
      showError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const verifyotpdata = { mobile, otp };
      const res = await CallApi(constant.API.HEALTH.VERIFYOTP, "POST", verifyotpdata);
      
      if (res.status) {
        setIsOtpVerified(true);
        setOtpVisible(false);
        showSuccess("OTP Verified Successfully");
        
        await executeInsureView(mobile);
      } else {
        setIsOtpVerified(false);
        setOtpVisible(true);
        showError("OTP is not Verified ");
      }
    } catch (error) {
      showError(error.message || "Something went wrong during OTP verification");
    } finally {
      setIsLoading(false);
    }
  };

  // Unified action for both health & motor API integration profile check
  const executeInsureView = async (currentMobile) => {
    try {
      const payload = {
        mobile: currentMobile,
        logintype: type 
      };

      // Uses target endpoints based on flow type
      const targetApi = type === "motor" ? constant.API.MOTOR.LOGIN : constant.API.HEALTH.INSUREVIEW;

      let res = await CallApi(targetApi, "POST", payload);
      
      if (res && (res.isUser === false || res.isUser === "false" || res.isuser === false || res.isuser === "false")) {
        setCurrentPayload(payload);
        
        const updatedResponse = await new Promise((resolve) => {
          setAuthResolver(() => resolve); 
          setShowProfileModal(true);      
        });

        if (!updatedResponse) return; 
        res = updatedResponse; 
      }

      if (res && res.status) {
        const isUserExist = res.hasOwnProperty('isuser') ? res.isuser : res.isUser;
        
        localStorage.setItem("logintype", "user");
        localStorage.setItem("isuser", String(isUserExist)); 
        localStorage.setItem("username", res.name || res.username || "User");
        
        if (res.token) {
          localStorage.setItem("token", res.token);
          setToken(res.token);
          
          window.dispatchEvent(
            new CustomEvent("auth-change", {
              detail: { username: res.name || "User", token: res.token },
            })
          );
        }

        showSuccess(res.message || "Login successful");
        
        if (type === "motor") {
          router.push(constant.ROUTES.MOTOR.SELECTVEHICLE);
        } else {
          router.push(constant.ROUTES.HEALTH.INSURE);
        }
      } else {
        showError(res?.message || "Login failed");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      showError("Submission failed. Please try again later.");
    }
  };

  const onSubmit = async (data) => {
    await executeInsureView(data.mobile);
  };

  const onModalSubmit = async (modalData) => {
    setModalLoading(true);
    try {
      const { logintype, ...restPayload } = currentPayload;

      const finalPayload = {
        ...restPayload,        
        name: modalData.name,
        gender: modalData.gender,
        email: modalData.email,
        pincode: modalData.pincode,
        logintype: type
      };

      const targetApi = type === "motor" ? constant.API.MOTOR.LOGIN : constant.API.HEALTH.INSUREVIEW;
      const finalRes = await CallApi(targetApi, "POST", finalPayload);
      
      if (finalRes && finalRes.token) {
        setShowProfileModal(false); 
        if (authResolver) authResolver(finalRes); 
      } else {
        showError(finalRes?.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during final registration:", error);
      showError("Registration failed. Please try again later.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCloseAction = () => {
    setShowProfileModal(false);
    if (authResolver) {
      authResolver(null); 
    }
  };

  return (
    <>
      <form
        onSubmit={handleFormSubmitFlow}
        className="bgcolor py-10 flex justify-center items-center min-h-screen"
      >
        <div className="w-full max-w-6xl rounded-[64px] bg-white shadow-lg px-10 py-8 gap-6 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-3/5 p-2 md:p-6">
            <h2 className="text-[#2F4A7E] text-2xl md:text-3xl font-semibold mb-2 capitalize">
              Find Top Plans For You {type}
            </h2>

            {/* ==================== UNIFIED MOBILE / OTP STEP VIEW ==================== */}
            <div className="flex flex-col gap-4 mt-6">
              <div>
                <label className="block text-[#2F4A7E] text-sm font-semibold mb-1">
                  Mobile Number
                </label>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <input
                      {...register("mobile", {
                        pattern: /^[0-9]{10}$/,
                      })}
                      type="tel"
                      maxLength={10}
                      readOnly={isOtpVerified}
                      placeholder="Enter Mobile Number"
                      onInput={isNumber}
                      className={`w-full border border-gray-400 px-4 py-2 prefix-input rounded-md text-sm ${
                        isOtpVerified
                          ? "bg-white text-gray-700"
                          : "border-gray-300 bg-white focus:ring-blue-100"
                      }`}
                    />
                  </div>
                  {!isOtpVerified && timer > 0 && (
                    <p className="text-sm text-red-600">
                      You can resend OTP in 00:{timer.toString().padStart(2, "0")}
                    </p>
                  )}
                </div>
              </div>

              {otpVisible && (
                <div>
                  <label className="text-sm font-semibold text-blue-900 mb-1 block">
                    Enter OTP
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      className="w-full px-4 py-2 text-sm border border-gray-400 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:items-start gap-1 mt-6">
              <button
                type="button"
                onClick={handleFormSubmitFlow}
                disabled={mobile?.length !== 10 || isLoading}
                className={`px-10 py-2 thmbtn text-base ${
                  mobile?.length === 10 && !isLoading ? "" : "opacity-50 cursor-not-allowed"
                }`}
              >
                {isLoading 
                  ? "Processing..." 
                  : !otpVisible 
                    ? "Send OTP & Continue" 
                    : "Verify OTP & Continue"
                }
              </button>

              <p className="text-base text-black mt-1">
                Already bought a policy from DigiBima?{" "}
                <a href="#" className="text-green-600 font-bold underline">
                  Renew Now
                </a>
              </p>
            </div>
          </div>

          <div className="w-full md:w-2/5 p-2 md:p-6">
            <Image
              src={healthTwo}
              alt="Home with Umbrella"
              className="max-w-xs w-full"
            />
          </div>
        </div>
      </form>

      <Modal
        isOpen={showProfileModal}
        onClose={handleModalCloseAction} 
        title="Complete Your Profile"
        width="max-w-md"
        showCancelButton={true} 
        confirmText={modalLoading ? "Saving..." : "Save Profile"}
        onConfirm={handleModalSubmit(onModalSubmit)} 
      >
        <div className="space-y-4 pt-1">
          {/* Gender Radio Pill */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Gender</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl self-start">
              {["male", "female"].map((g) => (
                <label key={g} className="cursor-pointer">
                  <input
                    {...registerModal("gender", { required: true })}
                    type="radio"
                    value={g}
                    checked={selectedModalGender === g}
                    onChange={() => setModalValue("gender", g)}
                    className="hidden"
                  />
                  <div
                    className={`px-6 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                      selectedModalGender === g
                        ? "bg-[#7998F4] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {g}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-700 text-sm font-semibold">Full Name</label>
            <input
              {...registerModal("name", { required: "Full name is required" })}
              type="text"
              placeholder="Enter your name"
              onInput={(e) => { e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, ""); }}
              className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500"
            />
            {modalErrors.name && <p className="text-red-500 text-xs mt-0.5">{modalErrors.name.message}</p>}
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-700 text-sm font-semibold">Email Address</label>
            <input
              {...registerModal("email", { 
                required: "Email is required",
                pattern: { value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Enter a valid email address" }
              })}
              type="email"
              placeholder="name@example.com"
              className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500"
            />
            {modalErrors.email && <p className="text-red-500 text-xs mt-0.5">{modalErrors.email.message}</p>}
          </div>

          {/* Pincode Field */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-slate-700 text-sm font-semibold">Residential Pincode</label>
            <input
              type="text"
              value={modalPincode || ""}
              {...registerModal("pincode", { required: "Pincode is required", pattern: /^[0-9]{5,6}$/ })}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                setModalValue("pincode", cleaned);
                fetchCities(cleaned); 
              }}
              placeholder="Enter 6 digit pincode"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-blue-500"
            />
            {Object.keys(cities).length > 0 && (
              <ul className="absolute left-0 top-[102%] w-full border border-slate-200 rounded-xl shadow-xl bg-white z-50 max-h-[120px] overflow-y-auto divide-y divide-slate-100 built-suggestions">
                {Object.entries(cities).map(([code, city]) => (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => {
                        setModalValue("pincode", code);
                        setCities({});
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-location-dot text-blue-500"></i>
                      {code} {city ? `(${city})` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {modalErrors.pincode && <p className="text-red-500 text-xs mt-0.5">{modalErrors.pincode.message}</p>}
          </div>
        </div>
      </Modal>
    </>
  );
}