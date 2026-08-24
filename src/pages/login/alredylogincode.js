"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showSuccess, showError } from "../../layouts/toaster";
import { CallApi, getUserinfo,storeDBData,getDBData } from "../../api";
import constant from "../../env";
import { isNumber } from "../../styles/js/validation";
import Image from "next/image";
import { healthTwo } from "@/images/Image";
import Modal from "@/components/modal";
import { deviceId } from "@/components/deviceid";
export default function FormPage({ usersData }) {
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
  const gender = watch("gender");
  const mobile = watch("mobile");
  const name = watch("name");
  const pincode = watch("pincode");
  const email = watch("email");
  const [cities, setCities] = useState({});
  const [error, setError] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [displayedPincode, setDisplayedPincode] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [stoken, setToken] = useState();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");

    const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalOtpVisible, setModalOtpVisible] = useState(false);
  const [modalMobile, setModalMobile] = useState("");
const [modalOtp, setModalOtp] = useState("");


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
  }, [reset]);

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    //const getToken = await getDBData("token")
    if (type === "health" && getToken) {
      deviceId(getToken)
      router.push(constant.ROUTES.HEALTH.INSURE);
    }
    if (type === "motor" && getToken) {
      deviceId(getToken)
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
            reset({
              name: data.name || "",
              mobile: data.mobile || "",
              pincode: data.pincode || data.pin || "",
              gender: data.gender || "male",
              email: data.email || "",
            });

            if (data.pincode || data.pin) {
              const pin = data.pincode || data.pin;
              setValue("pincode", pin);
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
  }, [usersData, router, type, reset, setValue]);

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
        setOtp("");
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
      showError(
        error.message || "Something went wrong during OTP verification"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const onSubmit = async (data) => {
    const gender = watch("gender");
    const mobile = watch("mobile");
    const name = watch("name");
    const pincode = watch("pincode");
    const email = watch("email");
    if (!name) {
      showError("Please Enter your name");
      return;
    }
    if (!isOtpVerified) {
      showError("Please verify your mobile number");
      return;
    }

    if (!pincode) {
      showError("Please Enter Pincode");
      return;
    }
    if (!email) {
      showError("Please Enter Email");
      return;
    }
   if (type === "motor") {
  try {
    const res = await CallApi(constant.API.MOTOR.LOGIN, "POST", data);

   if (res?.isloggedin === true || res?.data?.isloggedin === true) {
  const msg =
    res?.message ||
    res?.data?.message ||
    "You are already logged in from another device.";

  setModalMessage(msg);

  setValue("mobile", "");
  setOtp("");
  setOtpVisible(false);
  setTimer(0);

  setModalOpen(true);
  return;
}


    if (!stoken) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("logintype", "user");
      localStorage.setItem("username", data.name || "");
      setToken(res.token);
      window.dispatchEvent(
        new CustomEvent("auth-change", {
          detail: { username: data.name || "", token: res.token },
        })
      );
    }

    showSuccess("Login successfully");
    deviceId(localStorage.getItem("token"))
    router.push(constant.ROUTES.MOTOR.SELECTVEHICLE);
  } catch (error) {
    console.error("Submission Error:", error);
    showError("Submission failed. Please try again later.");
  }
} else if (type === "health") {
  try {
    const res = await CallApi(constant.API.HEALTH.INSUREVIEW, "POST", data);
    // console.log(res);


   if (res?.isloggedin === true || res?.data?.isloggedin === true) {
  const msg =
    res?.message ||
    res?.data?.message ||
    "You are already logged in from another device.";

  setModalMessage(msg);

  setValue("mobile", "");
  setOtp("");
  setOtpVisible(false);
  setTimer(0);

  // console.log("Modal opening triggered");
  setModalOpen(true);
  return;
}


    if (res.status) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("logintype", "user");
      localStorage.setItem("userid", res.userid);
      localStorage.setItem("username", data.name || "");
      await storeDBData("token", res.token);
      await storeDBData("userid", res.userid);
      setToken(res.token);
      
      window.dispatchEvent(
        new CustomEvent("auth-change", {
          detail: { username: data.name || "", token: res.token },
        })
      );
    }

    showSuccess(res.message);
    deviceId(localStorage.getItem("token"))
    router.push(constant.ROUTES.HEALTH.INSURE);
  } catch (error) {
    console.error("Submission Error:", error);
    showError("Submission failed. Please try again later.");
  }
}

  };


const sendModalOtp = async () => {
  if (!modalMobile || modalMobile.length !== 10) {
    showError("Please enter a valid 10-digit mobile number");
    return;
  }

  setIsLoading(true);
  try {
    const res = await CallApi(constant.API.HEALTH.SENDOTP, "POST", { mobile: modalMobile });
    if (res.status) {
      setModalOtp("");
      setModalOtpVisible(true);
      setTimer(30);
      showSuccess("OTP sent to your mobile");
    } else {
      showError(res.message || "OTP not sent");
    }
  } catch (error) {
    showError(error.message || "Something went wrong");
  } finally {
    setIsLoading(false);
  }
};

const verifyModalOtp = async () => {
  if (!modalOtp || modalOtp.length !== 6) {
    showError("Please enter a valid 6-digit OTP");
    return;
  }

  setIsLoading(true);
  try {
    const res = await CallApi(constant.API.HEALTH.REVERIFYOTP, "POST", {
      mobile: modalMobile,
      otp: modalOtp,
    });

    if (res.status) {
      showSuccess("Re-login successful!");
      setModalOpen(false);
      setModalOtpVisible(false);

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("logintype", "user");
        setToken(res.token);
        window.dispatchEvent(
          new CustomEvent("auth-change", {
            detail: { username: name || "", token: res.token },
          })
        );
      }

      if (type === "health"){
        deviceId(localStorage.getItem("token"))
 router.push(constant.ROUTES.HEALTH.INSURE);
      }
      else if (type === "motor") {
        deviceId(localStorage.getItem("token"))
        router.push(constant.ROUTES.MOTOR.SELECTVEHICLE);
      }
    } else {
      showError(res.message || "Invalid OTP, please try again");
    }
  } catch (error) {
    showError(error.message || "Something went wrong during verification");
  } finally {
    setIsLoading(false);
  }
};


  return (
 <>
    <Modal
  isOpen={modalOpen}
  onClose={() => {
  setModalOpen(false);
  setModalMobile("");
  setModalOtp("");
  setModalOtpVisible(false);
}}

  title="Re-login Required"
  showConfirmButton={false}
    width="max-w-md"
>
  <div className="flex flex-col gap-4">
    <p className="text-gray-700 text-base">{modalMessage}</p>

    <div>
      <label className="text-sm font-semibold text-blue-900 mb-1 block">
        Mobile Number
      </label>
      <div className="flex gap-2">
       <input
  type="tel"
  maxLength={10}
  placeholder="Enter Mobile Number"
  value={modalMobile}
  onChange={(e) => setModalMobile(e.target.value.replace(/\D/g, ""))}
  className="inputcls"
/>

      <button
  type="button"
  onClick={async () => {
  await sendModalOtp(); 
  setModalOtp("");
  setModalOtpVisible(true);
}}

  disabled={modalMobile?.length !== 10 || isLoading || timer > 0}
className={`px-6 py-2 text-sm rounded-full bg-[#7998F4] text-white font-medium whitespace-nowrap ${
  modalMobile?.length === 10 && timer === 0
    ? ""
    : "opacity-40 cursor-not-allowed"
}`}

>
  {timer > 0 ? "Resend" : "Send OTP"}
</button>


      </div>

      {timer > 0 && (
        <p className="text-sm text-red-600 mt-1">
          You can resend OTP in 00:{timer.toString().padStart(2, "0")}
        </p>
      )}
    </div>

 {modalOtpVisible && (
  <div>
    <label className="text-sm font-semibold text-blue-900 mb-1 block">
      Enter OTP
    </label>

    <div className="flex justify-between gap-2 max-w-[240px]">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={modalOtp[index] || ""}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (!val && modalOtp[index] === "") return; 

            const newOtp = modalOtp.split("").concat(Array(6).fill(""));
            newOtp[index] = val;
            const otpValue = newOtp.slice(0, 6).join("");
            setModalOtp(otpValue);

            if (val && e.target.nextSibling) e.target.nextSibling.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !modalOtp[index] && e.target.previousSibling) {
              e.target.previousSibling.focus();
            }
          }}
          className="w-9 h-9 border border-gray-400 rounded text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ))}
    </div>

    <button
      type="button"
      onClick={verifyModalOtp}
      disabled={modalOtp.length !== 6 || isLoading}
      className={`mt-4 px-4 py-2 rounded-full bg-[#7998F4] text-white text-sm font-semibold ${
        modalOtp.length === 6 ? "" : "opacity-40 cursor-not-allowed"
      }`}
    >
      {isLoading ? "Verifying..." : "Verify OTP"}
    </button>
  </div>
)}

  </div>
</Modal>

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bgcolor py-10 flex justify-center items-center min-h-screen"
    >
      <div className="w-full max-w-6xl rounded-[64px] bg-white shadow-lg px-10 py-8 gap-6 flex flex-col md:flex-row  items-center">
        <div className="w-full md:w-3/5 p-2 md:p-6">
          <h2 className="text-[#2F4A7E] text-2xl md:text-3xl font-semibold mb-2">
            Find Top Plans For You {type}
          </h2>

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
                      ? "bg-[#7998F4] text-white text-white"
                      : "border border-gray-400 text-black bg-white"
                  }`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </div>
              </label>
            ))}
          </div>

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
                  onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                    }}
                className="w-full border border-gray-400 px-4 py-2 rounded-md text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[#2F4A7E] text-sm font-semibold mb-1"
              >
                Email
              </label>
              <input
                {...register("email", {
                  pattern: {
                    value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                    message: "Enter a valid email address",
                  },
                })}
                type="text"
                placeholder="Enter Email"
                className="w-full border border-gray-400 px-4 py-2 rounded-md text-sm"
                defaultValue={email}
                readOnly={isReadOnly}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
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
                      className={`px-3 py-2 text-sm rounded-full bg-[#7998F4] text-white ${
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
                    className={`px-3 py-2 text-sm rounded-full font-semibold shadow-md bg-[#7998F4] text-white ${
                      otp.length === 6 ? "" : "opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Verifying..." : "Submit"}
                  </button>
                </div>
              </div>
            )}
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

          <div className="flex flex-col md:items-start gap-1 mt-2">
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
 </>
  );
}
