import { useState, forwardRef, useImperativeHandle } from "react";
import { CallApi } from "@/api";
import constant from "@/env";
import { showSuccess, showError } from "@/layouts/toaster";
import Select from "react-select";

const AddVendorForm = forwardRef(({ plans, closeModal, refreshData }, ref) => {
  
  const [formValues, setFormValues] = useState({
    vendorname: "",
    selectplan: null, 
  });

  const planOptions = plans.map((plan) => ({
    value: String(plan.id),
    label: plan.name,
  }));

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handlePlanChange = (selectedOption) => {
    setFormValues({
      ...formValues,
      selectplan: selectedOption ? selectedOption.value : null,
    });
  };

const handleSubmit = async () => {

  try {
    const res = await CallApi(constant.API.ADMIN.ADDNEWVENDOR, "POST", formValues);

    if (res?.status) {
      showSuccess("Plan added successfully");
      if (refreshData) refreshData();
      closeModal();
    } else {
      showError("Failed to add plan");
    }
  } catch (error) {
    console.error(error);
    showError("Error while adding plan");
  }
};

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));


  return (
    <div className="space-y-4">
      

      <div>
        <label className="labelcls">Select Plan</label>
        <Select
          options={planOptions}
          placeholder="Select a plan"
          onChange={handlePlanChange}
          styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({...base, maxHeight: "200px", overflowY: "auto",}),}} 
     menuPortalTarget={typeof window !== "undefined" ? document.body : null}

          isSearchable
        />
      </div>
      <div>
        <label className="labelcls">Vendor Name</label>
        <input
          type="text"
          name="vendorname"
          value={formValues.vendorname}
          onChange={handleInputChange}
          placeholder="Enter vendor name"
          className="inputcls"
        />
      </div>

      {/* <button onClick={handleSubmit} className="thmbtn px-4 py-2">
        Submit
      </button> */}
    </div>
  );
});

AddVendorForm.displayName = "AddVendorForm";
export default AddVendorForm;
