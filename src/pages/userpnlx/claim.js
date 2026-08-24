import Layout from "./component/layout";
import { useForm } from "react-hook-form";

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

const Claims = () => {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
  };

  return (
    <Layout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto space-y-4 bg-[#f4f4fa] h-screen"
      >
        <div className="flex items-center justify-center">
          <div className="bg-white w-[85%]  p-4 mt-4 rounded-xl shadow-md">
            <div className="flex items-center justify-center flex-col ">
              <h2 className="text-blue-800 text-2xl font-semibold">
                Enter Below Details and Submit Your Claim Request
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4">
                <Input
                  label="Proposer Name"
                  name="proposer name"
                  placeholder="Enter Full Name"
                  register={register}
                />

                <Input
                  label="Mobile Number"
                  name="mobile"
                  placeholder="Enter Mobile Number"
                  register={register}
                />

                <Input
                  label="Email Id"
                  name="email"
                  placeholder="Enter Email Id"
                  register={register}
                />


                <div>
                  <label className="block mb-1 font-medium text-blue-800">
                    Insurance Policy
                  </label>
                  <select
                    {...register("insurancePolicy")}
                    className="mt-2 p-2 block w-full border border-gray-400 rounded-md shadow-sm sm:text-sm "
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select Insurance Policy
                    </option>
                    <option value="Health">Health</option>
                    <option value="Vehicle">Vehicle</option>
                  </select>
                </div>

                <Input
                  label="Policy Number"
                  name="policy number"
                  placeholder="Enter Policy Number"
                  register={register}
                />
              </div>

              <div className="flex items-center justify-center mt-4">
                <button className="px-6 py-2  bg-blue-600 text-white rounded">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
};

export default Claims;
