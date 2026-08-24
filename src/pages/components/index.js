"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/layouts/toaster";
import { CallApi } from "@/api";
// import { CallNextApi } from "@/pages/utils/helper";
import constant from "@/env";
import { isNumber } from "@/styles/js/validation";
import Image from "next/image";
import { healthOne } from "@/images/Image";

export default function FormPage({ usersData, token }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const [selectedGender, setSelectedGender] = useState("male");
  const [otpVisible, setOtpVisible] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const otpInputRef = useRef(null);
  const mobile = watch("mobile");

  const [cities, setCities] = useState({});
  const [error, setError] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [displayedPincode, setDisplayedPincode] = useState("");
  const router = useRouter();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [stoken, setToken] = useState();

  useEffect(() => {
    const handleAuthChange = () => {
      // console.log("Resetting form after logout...");
      setToken(null);
      reset({
        name: "",
        mobile: "",
        pincode: "",
        gender: "",
      });
      setOtp("");
      setOtpVisible(false);
      setIsOtpVerified(false);
      setIsReadOnly(false);
      setCities({});
      setError("");
      setIsButtonEnabled(false);
      setDisplayedPincode("");
      setTimer(0);
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [reset]); // FIXED: Added reset as a dependency

  useEffect(() => {
    const getToken = token;
    // console.log("token:", getToken);
    if (getToken) {
      setToken(getToken);
      setIsOtpVerified(true);
      const fetchData = async () => {
        try {
          if (usersData) {
            reset({
              name: usersData?.name || "",
              mobile: usersData?.mobile || "",
              pincode: usersData?.pincode || "",
              gender: usersData?.gender || "",
            });
            setIsReadOnly(true);
          } else {
            setIsReadOnly(false);
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          setIsReadOnly(false);
        }
      };
      fetchData();
    } else {
      setIsReadOnly(false);
    }
  }, [usersData, token, reset]);

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
      if (!e.target.closest(".city-suggestions")) {
        setCities({});
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  const fetchCities = async (cleaned) => {
    if (/^\d{5,6}$/.test(cleaned)) {
      let pincodeData = { pincode: cleaned };
      // console.log("pincode", pincodeData);
      await CallApi(constant.API.HEALTH.PINCODE, "POST", pincodeData)
        .then((pindata) => {
          setCities(pindata);
          // console.log("rcvpincode", pindata);
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
      // console.log(res);
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

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const verifyotpdata = { mobile, otp };
      const res = await CallApi(
        constant.API.HEALTH.VERIFYOTP,
        "POST",
        verifyotpdata
      );
      // console.log(res);
      if (res.status) {
        setIsOtpVerified(true);
        setOtpVisible(false);
        showSuccess("OTP Verified Successfully");
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

  const onSubmit = async (data) => {
    const gender = watch("gender");
    const mobile = watch("mobile");
    const name = watch("name");
    const pincode = watch("pincode");
    if (!name) {
      showError("Please Enter your name");
      return;
    }
    // console.log(isOtpVerified, stoken);
    if (!isOtpVerified) {
      showError("Please verify your mobile number");
      return;
    }
    if (!pincode) {
      showError("Please Enter Pincode");
      return;
    }
    try {
      const res = await CallApi(constant.API.HEALTH.INSUREVIEW, "POST", data);
      // console.log(res);
      if (res.status) {
        localStorage.setItem("token", res.token);
        setToken(res.token);
        // await CallNextApi("/api/setsession", "POST", { token: res.token });
        window.dispatchEvent(new Event("auth-change"));
      }

      showSuccess(res.message);
      router.push(constant.ROUTES.HEALTH.INSURE);
    } catch (error) {
      console.error("Submission Error:", error);
      showError("Submission failed. Please try again later.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-[#C8EDFE] py-6 sm:py-10 flex justify-center items-center min-h-screen"
    >
      <div className="w-full max-w-6xl rounded-[64px] bg-white shadow-lg px-6 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 gap-6 flex flex-col md:flex-row items-center">
        {/* Left Form Section */}
        <div className="w-full md:w-3/5 p-2 md:p-6">
          <h2 className="text-[#2F4A7E] text-2xl md:text-3xl font-semibold mb-2">
            Find Top Plans For You
          </h2>

          {/* Gender Selection */}
          <div className="flex gap-2 mb-4">
            {["male", "female"].map((gender) => (
              <label key={gender}>
                <input
                  {...register("gender")}
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={selectedGender === gender}
                  onChange={() => {
                    setSelectedGender(gender);
                    setValue("gender", gender);
                  }}
                  className="hidden"
                />
                <div
                  className={`px-5 py-2 rounded border text-sm font-medium cursor-pointer transition ${
                    selectedGender === gender
                      ? "bg-gradient-to-r from-[#28A7E4] to-[#426D98] text-white"
                      : "border border-gray-400 text-black bg-white"
                  }`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </div>
              </label>
            ))}
          </div>

          {/* Name & Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="name"
                className="block text-[#2F4A7E] text-sm font-semibold mb-1"
              >
                Name
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="Enter Full Name"
                className="w-full border border-gray-400 px-4 py-2 rounded-md text-sm"
              />
            </div>

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
                    className={`w-full border border-gray-400 px-4 py-2 rounded-md text-sm ${
                      isOtpVerified
                        ? "bg-white text-gray-700"
                        : "border-gray-300 bg-white focus:ring-blue-100"
                    }`}
                  />

                  {!isOtpVerified && (
                    <button
                      type="button"
                      disabled={mobile?.length !== 10 || isLoading || timer > 0}
                      onClick={sendOtp}
                      className={`px-3 py-2 text-sm rounded-full bg-gradient-to-r from-[#28A7E4] to-[#426D98] text-white ${
                        mobile?.length === 10 && timer === 0
                          ? ""
                          : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      {timer > 0 ? "Resend" : "Verify"}
                    </button>
                  )}
                </div>
                {!isOtpVerified && timer > 0 && (
                  <p className="text-sm text-red-600">
                    You can resend OTP in 00:{timer.toString().padStart(2, "0")}
                  </p>
                )}
              </div>
            </div>

            {/* OTP Section */}
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
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={otp.length !== 6 || isLoading || stoken}
                    className={`px-3 py-2 text-sm rounded-full font-semibold shadow-md bg-gradient-to-r from-[#28A7E4] to-[#426D98] text-white ${
                      otp.length === 6 ? "" : "opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Verifying..." : "Submit"}
                  </button>
                </div>
              </div>
            )}

            {/* Pincode */}
            <div>
              <label className="text-sm font-semibold text-blue-900 mb-1 block">
                Pincode
              </label>
              <input
                type="text"
                {...register("pincode", {
                  pattern: /^[0-9]{5,6}$/,
                })}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setDisplayedPincode(cleaned);
                  setValue("pincode", cleaned);
                  fetchCities(cleaned);
                }}
                placeholder="Enter Pincode"
                className="w-full px-4 py-2 text-sm border border-gray-400 rounded-md"
              />
              <input
                type="hidden"
                {...register("pincode", {
                  pattern: /^[0-9]{5,6}$/,
                })}
              />
              {Object.keys(cities).length > 0 && (
                <ul className="border rounded shadow-sm bg-white city-suggestions mt-1 max-h-[120px] overflow-y-scroll">
                  {Object.entries(cities).map(([code, city]) => (
                    <li key={code}>
                      <button
                        type="button"
                        onClick={() => handleCityClick(code, city)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        <i className="fa-solid fa-location-dot mr-2"></i>
                        {code} {city ? `(${city})` : ""}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={!(isOtpVerified || stoken)}
            className={`px-10 py-2 thmbtn text-base ${
              isOtpVerified || stoken ? "" : "opacity-50 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
          <p className="text-base text-black mt-1">
            Already bought a policy from DigiBima?{" "}
            <a href="#" className="text-green-600 font-bold underline">
              Renew Now
            </a>
          </p>
        </div>

        {/* Right Image Section */}
        <div className="hidden md:flex flex-col md:items-start gap-1 mt-2 w-full md:w-2/5 p-2 md:p-6 flex justify-center">
          <Image
            src={healthOne}
            alt="Home with Umbrella"
            className="max-w-[280px] sm:max-w-xs w-full object-contain"
          />
        </div>
      </div>
    </form>
  );
}
