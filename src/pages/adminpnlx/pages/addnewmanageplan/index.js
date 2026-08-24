import { useState, forwardRef, useImperativeHandle } from "react";
import { CallApi } from "@/api";
import constant from "@/env";
import { showSuccess, showError } from "@/layouts/toaster";

const AddPlanForm = forwardRef(function AddPlanForm({ closeModal, refreshData }, ref) {
 const [formValues, setFormValues] = useState({ planname: "" });

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await CallApi(constant.API.ADMIN.ADDNEWPLAN, "POST", formValues);
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
      <input
        type="text"
        name="planname"
       value={formValues.planname} 
        onChange={handleChange}
        placeholder="Plan Name"
        className="inputcls"
      />
      {/* <div className="flex gap-3">
        <button onClick={closeModal} className="thmbtn px-4 py-2">Cancel</button>
        <button onClick={handleSubmit} className="thmbtn px-4 py-2">Save</button>
      </div> */}
    </div>
  );
});
AddPlanForm.displayName = "AddPlanForm";
export default AddPlanForm;
