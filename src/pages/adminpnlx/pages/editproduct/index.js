import { forwardRef, useImperativeHandle, useState, useEffect,useMemo } from "react";
import Select from "react-select";
import { CallApi } from "@/api";
import constant from "@/env";
import { showSuccess, showError } from "@/layouts/toaster";

const AddonForm =  forwardRef(({ selectedProduct, closeModal, refreshData, plans }, ref) => {
  const [formValues, setFormValues] = useState({
    productName: "",
    vendorName: "",
    selectedPlan: null,
    selectedAddons: [],
  });

  const [addonOptions, setAddonOptions] = useState([
    { value: "critical_illness", label: "Critical Illness" },
    { value: "hospital_cash", label: "Hospital Cash" },
    { value: "maternity", label: "Maternity Cover" },
  ]);

  const [newAddonOption, setNewAddonOption] = useState(null);
  const [showNewAddon, setShowNewAddon] = useState(false);
  const planOptions = useMemo(() => {
    return (plans || []).map((plan) => ({
      value: plan.id,
      label: plan.name,
    }));
  }, [plans]);

  useEffect(() => {
    if (selectedProduct?.type && plans?.length > 0) {
      const matchingPlan = plans.find(
        (plan) => plan.name === selectedProduct.type
      );
      if (matchingPlan) {
        setFormValues((prev) => ({
          ...prev,
          selectedPlan: { value: matchingPlan.id, label: matchingPlan.name },
        }));
      }
    }
  }, [selectedProduct, plans]);

  useEffect(() => {
    if (selectedProduct) {
      setFormValues((prev) => ({
        ...prev,
        productName: selectedProduct.productname || "",
        vendorName: selectedProduct.vendorname || "",
      }));
    }
  }, [selectedProduct]);

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handlePlanChange = (selectedPlan) => {
    setFormValues({ ...formValues, selectedPlan });
  };

  const handleAddonChange = (selectedAddons) => {
    setFormValues({ ...formValues, selectedAddons });
  };

  const handleAddNewAddon = () => {
    setShowNewAddon(true);
  };

  const handleNewAddonChange = (option) => {
    setNewAddonOption(option);
    if (option) {
      const newOption = { value: option.value, label: option.label };

      const alreadyExists = addonOptions.some(
        (opt) => opt.value === newOption.value
      );
      if (!alreadyExists) {
        setAddonOptions((prev) => [...prev, newOption]);
      }

      handleAddonChange([...formValues.selectedAddons, newOption]);

      setShowNewAddon(false);
      setNewAddonOption(null);
    }
  };

  const handleSave = async () => {
    const payload = {
      productname: formValues.productName,
      vendorname: formValues.vendorName,
      planname: formValues.selectedPlan?.label,
       prevendor: selectedProduct?.vendorname || "",
       productId: selectedProduct?.id || "",
      // addons: formValues.selectedAddons.map((addon) => addon.value),
    };
    try {
      const response = await CallApi(constant.API.ADMIN.EDITPRODUCT, "POST",payload);
       if (response?.status) {
              showSuccess(response?.message);
               if (refreshData) refreshData();
               closeModal();
             } else {
               showError("Failed to update Vendor");
             }
    } catch (error) {
      console.error("API Error:", error);
    }
  };
  
  useImperativeHandle(ref, () => ({
    submit: handleSave,
  }));
  return (
    <div className="space-y-4">
      {/* Row 1: Vendor Name & Addons */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          name="vendorName"
          value={formValues.vendorName}
          onChange={handleInputChange}
          placeholder="Vendor Name"
          className="inputcls"
        />
        <div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={addonOptions}
                placeholder="Select Addons"
                isMulti
                onChange={handleAddonChange}
                value={formValues.selectedAddons}
    styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({...base, maxHeight: "200px", overflowY: "auto",}),}} 
     menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                className="mt-1"
              />
            </div>
            <button
              onClick={handleAddNewAddon}
              className="px-4 py-1 rounded-md bg-gradient-to-r from-indigo-400 to-purple-500 text-white text-sm mt-1"
            >
              Add New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          options={planOptions}
          placeholder="Select Plan"
          onChange={handlePlanChange}
          value={formValues.selectedPlan}
       styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({...base, maxHeight: "200px", overflowY: "auto",}),}} 
     menuPortalTarget={typeof window !== "undefined" ? document.body : null}
          isSearchable
        />
        <div className="flex flex-wrap gap-2 mt-1">
          {formValues.selectedAddons.map((addon) => (
            <div
              key={addon.value}
              className="bg-blue-50 text-black px-3 py-1 rounded-md shadow-sm"
            >
              {addon.label}
              <button
                onClick={() =>
                  handleAddonChange(
                    formValues.selectedAddons.filter(
                      (a) => a.value !== addon.value
                    )
                  )
                }
                className="ml-1 text-sm text-gray-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          name="productName"
          value={formValues.productName}
          onChange={handleInputChange}
          placeholder="Product Name"
          className="inputcls w-full"
        />
      </div>

      {/* Action Buttons */}
      {/* <div className="max-w-4xl mx-auto flex justify-start gap-3 mt-4">
        <button onClick={closeModal} className="px-4 py-2 thmbtn">
          Cancel
        </button>
        <button onClick={handleSave} className="px-4 py-2 thmbtn">
          Save
        </button>
      </div> */}
    </div>
  );
});

AddonForm.displayName = "AddonForm";
export default AddonForm;
