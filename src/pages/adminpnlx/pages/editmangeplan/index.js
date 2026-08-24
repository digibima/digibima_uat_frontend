import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { CallApi } from "@/api";
import constant from "@/env";
import { showSuccess, showError } from "@/layouts/toaster";

const PlanEditForm = forwardRef(({ selectedPlan, closeModal, refreshData }, ref) => {
  const [formValues, setFormValues] = useState({ id: "", editplanName: "" });

  useEffect(() => {
    if (selectedPlan) {
      setFormValues({
        id: selectedPlan.id,
        editplanName: selectedPlan.name || "",
      });
    }
  }, [selectedPlan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await CallApi(constant.API.ADMIN.EDITPLAN, "POST", formValues);
      if (res?.status) {
        showSuccess("Plan updated successfully");
        refreshData?.();
        closeModal();
      } else {
        showError("Failed to update plan");
      }
    } catch (error) {
      console.error("Update failed", error);
      showError("Error while saving");
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  return (
    <div className="space-y-4">
      <input
        type="text"
        name="editplanName"
        value={formValues.editplanName}
        onChange={handleInputChange}
        placeholder="Plan Name"
        className="inputcls"
      />
    </div>
  );
});


PlanEditForm.displayName = "PlanEditForm";
export default PlanEditForm;
