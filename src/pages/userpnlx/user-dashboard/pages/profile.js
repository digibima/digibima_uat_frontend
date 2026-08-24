import { useEffect } from "react";
import { useForm } from "react-hook-form";
import constant from "@/env";
import { CallApi } from "@/api";
import { showSuccess, showError } from "@/layouts/toaster";
import { HiOutlineUserCircle } from "react-icons/hi";
import { useUser } from "@/context/UserContext";

export function Input({
  label,
  name,
  type = "text",
  placeholder = "",
  register,
  readOnly = false,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="labelcls">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        readOnly={readOnly}
        className="inputcls"
      />
    </div>
  );
}

const Profile = ({ usersData, collapsed }) => {
 const { userData, setUserData } = useUser();
  const user = usersData || userData;
  // console.log("user data List",userData)
  const { register, handleSubmit, reset, watch } = useForm();

  const onSubmit = async (data) => {
    const name = watch("name");
    const mobile = watch("mobile");
    const email = watch("email");
    const city = watch("city");
    const dob = watch("dob");
    const income = watch("income");
    const marital_status = watch("marital_status");
    const gender = watch("gender");

    if (!name?.trim()) return showError("Please enter your name");
    if (!mobile?.trim()) return showError("Please enter your mobile number");
    if (!email?.trim()) return showError("Please enter your email address");
    if (!dob?.trim()) return showError("Please enter your date of birth");
    if (!income?.trim()) return showError("Please enter your annual income");
    if (!marital_status?.trim())
      return showError("Please enter your marital status");
    if (!city?.trim()) return showError("Please enter your city");
    if (!gender?.trim()) return showError("Please select your gender");

    try {
  let response = await CallApi(
    constant.API.USER.PROFILEUPDATE,
    "POST",
    data
  );

  setUserData((prev) => ({
    ...prev,
    ...data,
  }));

  showSuccess(response.message);
} catch (error) {
  showError("Something went wrong!", error);
}

  };

  // Prefill data
  useEffect(() => {
    if (user) {
      reset({
        name: user?.name || "",
        email: user?.email || "",
        gender: user?.gender || "",
        mobile: user?.mobile || "",
        city: user?.city || "",
        income: user?.income || "",
        marital_status: user?.martial_status || "",
        dob: user?.dob || "",
      });
    }
  }, [user, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="px-4 py-5 min-h-screen flex items-center justify-center">
        <div
          className={`bg-white w-full max-w-5xl p-6 sm:p-8 rounded-[32px] sm:rounded-[48px] md:rounded-[64px] shadow-lg relative`}
        >
          {/* Profile Card */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-b from-[#7ba7ff] to-[#7998F4] text-white shadow-md">
              <HiOutlineUserCircle className="w-5 h-5" />
              <span className="font-semibold text-base sm:text-lg">
                Personal Details
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-md mt-2 sm:mt-12 flex-wrap">
            <label className="cursor-pointer">
              <input
                type="radio"
                value="male"
                {...register("gender")}
                name="gender"
                className="hidden peer"
              />
              <div className="flex items-center gap-2 px-4 py-1 rounded bg-white text-black border border-gray-400 peer-checked:bg-[#7998F4] peer-checked:text-white transition-colors duration-200">
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
              <div className="flex items-center gap-2 px-4 py-1 rounded bg-white text-black border border-gray-400 peer-checked:bg-[#7998F4] peer-checked:text-white transition-colors duration-200">
                Female
              </div>
            </label>
          </div>

          <div className="w-full mt-6 sm:mt-10 px-0 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="labelcls">Annual Income</label>
                <select {...register("income")} className="inputcls">
                  <option value="" disabled>
                    Select Income
                  </option>
                  <option value="Below ₹5 Lakh">Below ₹5 Lakh</option>
                  <option value="₹5-10 Lakh">₹5-10 Lakh</option>
                  <option value="Above ₹10 Lakh">Above ₹10 Lakh</option>
                </select>
              </div>

              <div>
                <label className="labelcls">Marital Status</label>
                <select {...register("marital_status")} className="inputcls">
                  <option value="" disabled>
                    Select marital status
                  </option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>

              <Input
                label="City"
                name="city"
                placeholder=""
                register={register}
              />
            </div>
          </div>

          <div className="flex items-center justify-center mt-6">
            <button type="submit" className="px-6 py-2 thmbtn">
              Submit
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Profile;
