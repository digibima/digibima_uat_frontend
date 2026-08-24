"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { showSuccess, showError } from "../../layouts/toaster";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import constant from "../../env";
import { CallApi, isAuth } from "../../api";
import { FaCar, FaMotorcycle, FaTractor } from "react-icons/fa6";
import { homecommercial } from "@/images/Image";

export default function VehicleSelect({ usersData }) {
  const [carnumber, setCarnumber] = useState();
  const [bikenumber, setBikenumber] = useState();
  const [cities, setCities] = useState(null);
  const [selectedcity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false); // Added for safe API sequence execution
  const cityRef = useRef(null);
  const bikecityRef = useRef(null);

  const {
    register,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vehicle: "car",
      carOption: "knowcar",
      bikeOption: "knowbike",
      commercialOption: "knowcommercial",
    },
  });

  const router = useRouter();
  const selectedVehicle = watch("vehicle");
  const carOption = watch("carOption");
  const bikeOption = watch("bikeOption");
  const commercialOption = watch("commercialOption");

  useEffect(() => {
    async function getAuth() {
      const isauth = isAuth();
      if (!isauth) {
        router.replace(constant.ROUTES.INDEX);
      }
    }
    getAuth();
  }, [router]);

  useEffect(() => {
    reset({
      vehicle: "car",
      carOption: "knowcar",
      bikeOption: "knowbike",
      commercialOption: "knowcommercial",
      mobile: usersData?.mobile,
      carRegNumber: carnumber,
      bikeRegNumber: bikenumber,
    });
  }, [usersData, carnumber, bikenumber, reset]);

  useEffect(() => {
    async function getSavedResponse() {
      try {
        const response = await CallApi(
          constant.API.MOTOR.CAR.SAVESTEPONE,
          "GET"
        );
        setCarnumber(response.data.carregnumber);
      } catch (error) {
        console.error(error);
      }
    }
    getSavedResponse();
  }, []);

  useEffect(() => {
    async function getBikeSavedResponse() {
      try {
        const response = await CallApi(
          constant.API.MOTOR.BIKE.BIKESAVESTEPONE,
          "GET"
        );
        setBikenumber(response.data.bikeregnumber);
      } catch (error) {
        console.error(error);
      }
    }
    getBikeSavedResponse();
  }, []);

  const getCities = async (value) => {
    try {
      const response = await CallApi(constant.API.MOTOR.GETCITY, "POST", {
        city: value,
      });
      setCities(response);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    const selected = data.vehicle;
    var payload = {
      carregnumber: data.carRegNumber,
    };

    if (selected === "car") {
      payload.carOption = data.carOption;

      if (data.carOption === "knowcar") {
        payload.carregnumber = data.carRegNumber;
        setLoading(true);

        try {
          // STEP 1: Verify RTO
          const verifyResponse = await CallApi(
            constant.API.MOTOR.VERIFYRTO,
            "POST",
            { carregnumber: data.carRegNumber }
          );

          if (verifyResponse?.status === false) {
            showError(verifyResponse.message || "RTO verification failed");
            setLoading(false);
            return;
          }

          showSuccess("Detail verified");

          // Save Step 1 Data
          const saveStepOneRes = await CallApi(
            constant.API.MOTOR.CAR.SAVESTEPONE,
            "POST",
            { carregnumber: data.carRegNumber }
          );

          if (saveStepOneRes?.status === false) {
            showError("Failed to save step one details");
            setLoading(false);
            return;
          }

          // STEP 2 (BACKGROUND): Fetch Vahan/Saved Data & Auto-submit Step 2
          const stepTwoGetRes = await CallApi(
            constant.API.MOTOR.CAR.KNOWCARDETAILSTWO,
            "GET"
          );

          if (stepTwoGetRes?.status) {
            const pageData = stepTwoGetRes.data || {};
            const vahanData = stepTwoGetRes.vahandata || {};

            const brandVal = pageData.brand || vahanData.brand || "";
            const modelVal = pageData.model || vahanData.model || "";
            const regDateVal = pageData.carregdate || vahanData.regno || "";
            const underVal = pageData.under || "individual";

            let brandYearVal = pageData.brandyear || "";
            if (regDateVal && !brandYearVal) {
              const dateParts = regDateVal.split("-");
              if (dateParts.length === 3) {
                brandYearVal = dateParts[2];
              }
            }

            const stepTwoPayload = {
              brand: brandVal,
              model: modelVal,
              carregdate: regDateVal,
              brandyear: brandYearVal,
              under: underVal,
            };

            const postStepTwoRes = await CallApi(
              constant.API.MOTOR.CAR.KNOWCARDETAILSTWO,
              "POST",
              stepTwoPayload
            );

            if (postStepTwoRes?.status === false) {
              showError("Failed to save step two details");
              setLoading(false);
              return;
            }
          }

          // STEP 3 (BACKGROUND): Fetch Saved Data & Auto-submit Step 3
          const stepThreeGetRes = await CallApi(
            constant.API.MOTOR.CAR.KNOWCARDETAILSTHREE,
            "GET"
          );

          if (stepThreeGetRes?.data) {
            const stepThreeData = stepThreeGetRes.data;

            await CallApi(
              constant.API.MOTOR.CAR.KNOWCARDETAILSTHREE,
              "POST",
              stepThreeData
            );
          }

          // DIRECT REDIRECT: Direct to Plans Page
          router.push(constant.ROUTES.MOTOR.CAR.PLANS);

        } catch (error) {
          console.error("Error in automatic flow:", error);
          showError("Something went wrong while fetching details. Please try again.");
        } finally {
          setLoading(false);
        }
      } else if (data.carOption === "newcar") {
        payload.carCity = data.carCity;

        if (selectedcity === "") {
          showError("Please fill the city name");
          return;
        }

        try {
          const response = await CallApi(
            constant.API.MOTOR.CAR.NEWCARDETAILS,
            "POST",
            {
              newcarcity: selectedcity,
            }
          );

          if (response.status === false) {
            showError(response.message);
          }

          if (response.status === true) {
            router.push(constant.ROUTES.MOTOR.CAR.NEWCAR);
          }
        } catch (error) {
          console.error(error);
        }
      }
    } else if (selected === "bike") {
      payload.bikeOption = data.bikeOption;

      if (data.bikeOption === "knowbike") {
        payload.bikeRegNumber = data.bikeRegNumber;

        try {
          const response = await CallApi(
            constant.API.MOTOR.BIKEVERIFYRTO,
            "POST",
            {
              bikeregnumber: data.bikeRegNumber,
            }
          );
          if (response.status === false) {
            showError(response.message);
          }

          if (response.status === true) {
            showSuccess("Detail verified");
          }

          if (response.status === true) {
            const bikeDetailsSave = await CallApi(
              constant.API.MOTOR.BIKE.BIKESAVESTEPONE,
              "POST",
              {
                bikeregnumber: data.bikeRegNumber,
              }
            );
            if (bikeDetailsSave.status === true) {
              router.push(constant.ROUTES.MOTOR.BIKE.KNOWBIKESTEPTWO);
            }
          }
        } catch (error) {
          console.error("Error", error);
          showError("Error");
        }
      } else if (data.bikeOption === "newbike") {
        payload.bikeCity = data.bikeCity;

        if (selectedcity === "") {
          showError("Please fill the city name");
          return;
        }

        try {
          const response = await CallApi(
            constant.API.MOTOR.BIKE.NEWBIKE,
            "POST",
            {
              newbikecity: selectedcity,
            }
          );
          if (response.status === false) {
            showError(response.message);
          }

          if (response.status === true) {
            router.push(constant.ROUTES.MOTOR.BIKE.NEWBIKE);
          }
        } catch (error) {
          console.error("Error", error);
          showError("Error");
        }
      }
    } else if (selected === "commercial") {
      payload.commercialOption = data.commercialOption;

      if (data.commercialOption === "knowcommercial") {
        payload.commercialRegNumber = data.commercialRegNumber;
      } else if (data.commercialOption === "newcommercial") {
        payload.commercialCity = data.commercialCity;
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setCities([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onInvalid = (errors) => {
    const firstErrorKey = Object.keys(errors)[0];
    const message =
      errors[firstErrorKey]?.message || "Please check required fields.";
    showError(message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bgcolor py-6 sm:py-10">
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-6xl rounded-[64px] bg-white shadow-lg px-6 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 gap-6 flex flex-col md:flex-row items-center">
          {/* Right Section (Image) */}
          <div className="hidden md:flex flex-col md:items-start gap-1 mt-2 w-full md:w-2/5 p-2 md:p-6 justify-center">
            <Image
              src={homecommercial}
              alt="Home with Umbrella"
              className="max-w-[280px] sm:max-w-xs w-full object-contain"
            />
          </div>

          <div className="w-full md:w-3/5 p-2 md:p-6">
            <p className="text-[#2F4A7E] text-lg sm:text-xl md:text-2xl font-semibold text-center w-full mb-6">
              Motor insurance provides essential coverage against accidents.
            </p>
            <div>
              {/* Vehicle Selection */}
              <div className="flex flex-wrap gap-4 mb-4">
                {["car", "bike", "commercial"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={type}
                      {...register("vehicle")}
                      className="hidden peer"
                    />
                    <div
                      className="px-4 py-2 rounded-full border 
                      bg-white text-black 
                      peer-checked:bg-[#7998F4] 
                      peer-checked:text-white 
                      transition-colors duration-200"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                      {type === "car" && <FaCar className="inline ml-2" />}
                      {type === "bike" && (
                        <FaMotorcycle className="inline ml-2" />
                      )}
                      {type === "commercial" && (
                        <FaTractor className="inline ml-2" />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {selectedVehicle === "car" && (
                <div className="space-y-4 ">
                  <div className="flex items-center bg-[#E9F1FF] rounded-full p-1 w-fit shadow-sm">
                    {/* Know Car No. */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        value="knowcar"
                        {...register("carOption")}
                        className="peer hidden"
                      />
                      <div
                        className="
      px-5 py-1.5 rounded-full text-sm font-semibold
      text-[#195BDA] hover:bg-[#d3e6ff]
      transition-all duration-300 ease-in-out
      peer-checked:bg-[#7998F4] 
      peer-checked:text-white
    "
                      >
                        Know car No.
                      </div>
                    </label>

                    {/* New Car */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        value="newcar"
                        {...register("carOption")}
                        className="peer hidden"
                      />
                      <div
                        className="
       px-5 py-1.5 rounded-full text-sm font-semibold
      text-[#195BDA] hover:bg-[#d3e6ff]
      transition-all duration-300 ease-in-out
      peer-checked:bg-[#7998F4] 
      peer-checked:text-white
    "
                      >
                        New car
                      </div>
                    </label>
                  </div>

                  {carOption === "knowcar" && (
                    <>
                      <div className="flex flex-col md:flex-row gap-4 ">
                        <div className="flex flex-col flex-1">
                          <label className="labelcls">
                            Car Registration Number
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Car Registration Number"
                            {...register("carRegNumber", {
                              required:
                                carOption === "knowcar"
                                  ? "Car Registration Number is required"
                                  : false,
                              pattern: {
                                value: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
                                message: "Invalid car registration number",
                              },
                            })}
                            className="inputcls"
                            onInput={(e) => {
                              e.target.value = e.target.value
                                .toUpperCase()
                                .slice(0, 10);
                            }}
                          />
                        </div>

                        <div className="flex flex-col flex-1">
                          <label className="labelcls">Mobile Number</label>
                          <input
                            type="text"
                            {...register("mobile", {
                              required:
                                carOption === "knowcar"
                                  ? "Mobile Number is required"
                                  : false,
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Invalid Mobile Number",
                              },
                            })}
                            className="inputcls"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {carOption === "newcar" && (
                    <>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div
                          className="flex flex-col relative flex-1"
                          ref={cityRef}
                        >
                          <label className="labelcls">City Name</label>
                          <input
                            type="text"
                            placeholder="Enter City Name"
                            {...register("carCity", {
                              required:
                                carOption === "newcar"
                                  ? "City name is required"
                                  : false,
                              onChange: (e) => getCities(e.target.value),
                            })}
                            className="inputcls"
                          />

                          {cities?.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 z-10 border rounded bg-white max-h-40 overflow-y-auto shadow-md mt-1">
                              {cities.map((city, idx) => (
                                <li
                                  key={idx}
                                  onClick={() => {
                                    setValue("carCity", city);
                                    setSelectedCity(city);
                                    setCities([]);
                                  }}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  {city}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="flex flex-col flex-1">
                          <label className="labelcls">Mobile Number</label>
                          <input
                            type="number"
                            readOnly
                            {...register("mobile", {
                              required:
                                carOption === "newcar"
                                  ? "Mobile number is required"
                                  : false,
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Invalid Mobile Number",
                              },
                            })}
                            className="inputcls"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {selectedVehicle === "bike" && (
                <div className="space-y-4 ">
                  <div className="flex items-center bg-[#E9F1FF] rounded-full p-1 w-fit shadow-sm mb-">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        value="knowbike"
                        {...register("bikeOption")}
                        className="peer hidden"
                      />
                      <div
                        className="
                          px-5 py-1.5 rounded-full text-sm font-semibold capitalize
                              text-[#2F4A7E] hover:bg-[#d3e6ff]
                              transition-all duration-300 ease-in-out
                              peer-checked:bg-[#7998F4]
                              peer-checked:text-white
                        "
                      >
                        Know Bike No.
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        value="newbike"
                        {...register("bikeOption")}
                        className="peer hidden"
                      />
                      <div
                        className="
     px-5 py-1.5 rounded-full text-sm font-semibold capitalize
                              text-[#2F4A7E] hover:bg-[#d3e6ff]
                              transition-all duration-300 ease-in-out
                              peer-checked:bg-[#7998F4] 
                              peer-checked:text-white
    "
                      >
                        New Bike
                      </div>
                    </label>
                  </div>

                  {bikeOption === "knowbike" && (
                    <>
                      <div className="flex flex-col md:flex-row gap-4 ">
                        <div className="flex flex-col flex-1">
                          <label className="labelcls">
                            Bike Registration Number
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Bike Registration Number"
                            {...register("bikeRegNumber", {
                              pattern: {
                                value: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
                                message: "Invalid bike registration number",
                              },
                            })}
                            className="inputcls"
                            onInput={(e) => {
                              e.target.value = e.target.value
                                .toUpperCase()
                                .slice(0, 10);
                            }}
                          />
                        </div>

                        <div className="flex flex-col flex-1">
                          <label className="labelcls">Mobile Number</label>
                          <input
                            type="text"
                            {...register("mobile", {
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Invalid Mobile Number",
                              },
                            })}
                            className="inputcls"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {bikeOption === "newbike" && (
                    <>
                      <div className="flex flex-col md:flex-row  gap-4">
                        <div
                          className="flex flex-col relative flex-1"
                          ref={bikecityRef}
                        >
                          <label className="labelcls">City Name</label>
                          <input
                            type="text"
                            placeholder="Enter City Name"
                            {...register("bikeCity", {
                              required:
                                bikeOption === "newbike"
                                  ? "City name is required"
                                  : false,
                              onChange: (e) => getCities(e.target.value),
                            })}
                            className="inputcls"
                          />

                          {cities?.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 z-10 border rounded bg-white max-h-40 overflow-y-auto shadow-md mt-1">
                              {cities.map((city, idx) => (
                                <li
                                  key={idx}
                                  onClick={() => {
                                    setValue("bikeCity", city);
                                    setSelectedCity(city);
                                    setCities([]);
                                  }}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  {city}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="flex flex-col flex-1">
                          <label className="labelcls">Mobile Number</label>
                          <input
                            type="text"
                            {...register("mobile", {
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Invalid Mobile Number",
                              },
                            })}
                            className="inputcls "
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* COMMERCIAL FORM */}
              {selectedVehicle === "commercial" && (
                <div className="space-y-4 ">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex gap-4">
                      <label>
                        <input
                          type="radio"
                          value="knowcommercial"
                          {...register("commercialOption")}
                        />
                        Know Commercial No.
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="newcommercial"
                          {...register("commercialOption")}
                        />
                        New Commercial
                      </label>
                    </div>
                  </div>

                  {commercialOption === "knowcommercial" && (
                    <>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col gap-4 flex-1">
                          <div className="flex flex-col w-full">
                            <label className="labelcls">
                              Registration Number
                            </label>
                            <input
                              type="text"
                              placeholder="Enter Commercial Reg. Number"
                              {...register("commercialRegNumber")}
                              className="inputcls w-full"
                            />
                          </div>

                          <div className="flex flex-col w-full">
                            <label className="labelcls">Vehicle Type</label>
                            <select
                              name="commercialVehicle"
                              id="comVehicle"
                              className="inputcls "
                            >
                              <option>Vehicle Type</option>
                              <option value="">
                                Passenger Carrying Commercial Vehicle
                              </option>
                              <option value="">
                                Goods Carrying Commercial Vehicles
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col flex-1">
                          <label className="labelcls">Mobile Number</label>
                          <input
                            type="text"
                            {...register("mobile")}
                            className="inputcls w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {commercialOption === "newcommercial" && (
                    <>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col flex-1">
                          <label className="labelcls">City Name</label>
                          <input
                            type="text"
                            placeholder="Enter City Name"
                            {...register("commercialCity")}
                            className="inputcls"
                          />
                        </div>

                        <div className="flex flex-col flex-1">
                          <label className="labelcls">Mobile Number</label>
                          <input
                            type="text"
                            {...register("mobile")}
                            className="inputcls"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-start mt-4">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="px-6 py-2 text-white rounded-full text-sm font-semibold shadow-md hover:scale-105 transition"
                  style={{
                    background: "#7998F4",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit(onSubmit, onInvalid)}
                  className="px-6 py-2 text-white rounded-full text-sm font-semibold shadow-md hover:scale-105 transition disabled:opacity-50"
                  style={{
                    background: "#7998F4",
                  }}
                >
                  {loading ? "Processing..." : "Continue"}
                </button>
              </div>

              {/* Footer Text */}
              <p className="text-base text-black mt-1">
                Already bought a policy from DigiBima?{" "}
                <a href="#" className="text-green-600 font-bold underline">
                  Renew Now
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}