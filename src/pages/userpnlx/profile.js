import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "./component/layout";
import constant from "../../env";
import { CallApi } from "../../api";
import { showSuccess , showError} from "@/layouts/toaster";
import Image from "next/image";

export function Input({
  label,
  name,
  type = "text",
  placeholder = "",
  register,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-medium text-blue-800">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className="border border-gray-400 rounded px-3 py-2"
     
      />
    </div>
  );
}

// pages/profile.js

const Profile = ({ usersData }) => {
  const { register, handleSubmit, reset , watch} = useForm();

  const onSubmit = async (data) => {
    const name = watch("name")
    const mobile = watch("mobile")
    const email = watch("email")
    const city = watch("city");
    const dob = watch("dob");
    const income = watch("income");
    const marital_status = watch("marital_status")
     const gender = watch("gender");

   if (!name?.trim()) {
    showError("Please enter your name");
    return;
  }
  if (!mobile?.trim()) {
    showError("Please enter your mobile number");
    return;
  }
  if (!email?.trim()) {
    showError("Please enter your email address");
    return;
  }
  if (!dob?.trim()) {
    showError("Please enter your date of birth");
    return;
  }
  if (!income?.trim()) {
    showError("Please enter your annual income");
    return;
  }
  if (!marital_status?.trim()) {
    showError("Please enter your marital status");
    return;
  }
  if (!city?.trim()) {
    showError("Please enter your city");
    return;
  }
  if (!gender?.trim()) {
    showError("Please select your gender");
    return;
  }

     try {
    let response = await CallApi(constant.API.USER.PROFILEUPDATE, "POST", data);
    showSuccess(response.message);
  } catch (error) {
    showError("Something went wrong!", error);
  }
  };

  useEffect(() => {
    reset({
      name: usersData?.name || "",
      email: usersData?.email || "",
      gender: usersData?.gender || "",
      mobile: usersData?.mobile || "",
      city: usersData?.city || "",
      income: usersData?.income || "",
      marital_status: usersData?.martial_status || "",
      dob: usersData?.dob || "",
    });
  }, [usersData,reset]);

  return (
    <Layout >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto space-y-4 bg-[#f4f4fa] "
      >

        <div className="flex items-center justify-center ">
          <div className="bg-white p-4 mt-4 w-[85%] rounded-xl shadow-md">
            {/* Profile Card */}
            <div className="flex items-center gap-3 p-4 bg-[#f8f9fd] rounded-xl shadow-sm w-fit mt-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Image src="" alt="icon" className="w-6 h-6" />
              </div>
              <span className="text-gray-800 font-semibold text-md">
                Personal details
              </span>
            </div>

            {/* Gender Selector */}
            <div className="flex gap-2 rounded-md mt-4">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="male"
                  {...register("gender")}
                  name="gender"
                  className="hidden peer"
                />
                <div className="flex items-center gap-2 px-4 py-1 rounded bg-white text-gray-500 border border-gray-400 peer-checked:bg-gradient-to-b peer-checked:from-[#426D98] peer-checked:to-[#28A7E4] peer-checked:text-white transition-colors duration-200">
                  Male
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="female"
                  {...register("gender")}
                  name="gender"
                  className="hidden peer"
                />
                <div className="flex items-center gap-2 px-4 py-1 rounded bg-white text-gray-500 border border-gray-400 peer-checked:bg-gradient-to-b peer-checked:from-[#426D98] peer-checked:to-[#28A7E4] peer-checked:text-white transition-colors duration-200">
                  Female
                </div>
              </label>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4">
              <Input
                label="Full Name"
                name="name"
                placeholder="Enter Full Name"
                register={register}

              />
              <Input
                label="Mobile Number"
                name="mobile"
                placeholder="Enter Mobile Number"
                register={register}
                readOnly={true}
                
              />
              <Input
                label="Email ID"
                name="email"
                placeholder="Enter Email ID"
                register={register}
              />
              <Input
                label="Date of Birth"
                name="dob"
                placeholder="Enter Date of Birth"
                register={register}
              />
              {/* <Input
                label="Annual Income"
                name="income"
                placeholder="Annual Income"
                register={register}
              /> */}

              <div>
                  <label className="block mb-1 font-medium text-blue-800">
                  Annual Income
                  </label>
                  <select
                    {...register("income")}
                    className="mt-2 p-2 block w-full border border-gray-400 rounded-md shadow-sm sm:text-sm "
                
                  >
                    <option value="" disabled>
                      Select Income
                    </option>
                    <option value="Below ₹5 Lakh">Below ₹5 Lakh</option>
                    <option value="₹5-10 Lakh">₹5-10 Lakh</option>
                    <option value="Above ₹10 Lakh">Above ₹10 Lakh</option>
                  </select>
                </div>

              {/* <Input
                label="Marital Status"
                name="marital_status"
                placeholder=""
                register={register}
              /> */}

               <div>
                  <label className="block mb-1 font-medium text-blue-800">
                  Marital Status
                  </label>
                  <select
                    {...register("marital_status")}
                    className="mt-2 p-2 block w-full border border-gray-400 rounded-md shadow-sm sm:text-sm "
                  
                   
                  >
                    <option value="" disabled>
                      Select marital status
                    </option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  
                  </select>
                </div>
              <Input label="City" name="city" placeholder="" register={register} />
            </div>

            <div className="flex items-center justify-center mt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
};

export default Profile;
