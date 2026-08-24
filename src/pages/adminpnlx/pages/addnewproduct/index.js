import { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { CallApi } from "@/api";
import constant from "@/env";

const NewProduct = forwardRef(({ selectedProduct, closeModal, refreshData, plans, vendors }, ref) => {
  const [formValues, setFormValues] = useState({
    productName: "",
    vendorName: null,   
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
  const vendorOptions = useMemo(() => {
    return (vendors || []).map((v) => ({
      value: v.id,
      label: v.vendorname,
    }));
  }, [vendors]);

  const planOptions = useMemo(() => {
    return (plans || []).map((plan) => ({
      value: plan.id,
      label: plan.name,
    }));
  }, [plans]);

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleVendorChange = (selectedVendor) => {
    setFormValues({ ...formValues, vendorName: selectedVendor });
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
      const alreadyExists = addonOptions.some((opt) => opt.value === newOption.value);

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
      vendorid: formValues.vendorName?.value || null, 
      vendorname: formValues.vendorName?.label || "",
      planid: formValues.selectedPlan?.value || null, 
      planname: formValues.selectedPlan?.label || "",
      addons: formValues.selectedAddons.map((addon) => addon.value),
    };

    try {
      const response = await CallApi(constant.API.ADMIN.ADDNEWPRODUCT, "POST", payload);
      if (response?.status) {
        refreshData?.();
        closeModal();
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
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          options={vendorOptions}
          placeholder="Vendor Name"
          onChange={handleVendorChange}
          value={formValues.vendorName}
         styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({...base, maxHeight: "200px", overflowY: "auto",}),}} 
     menuPortalTarget={typeof window !== "undefined" ? document.body : null}
          className="mt-1"
          isSearchable
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
                    formValues.selectedAddons.filter((a) => a.value !== addon.value)
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
          placeholder="Product Name sfdfdsfdsfsdds"
          className="inputcls w-full"
        />
      </div>
    </div>
  );
});

NewProduct.displayName = "NewProduct";
export default NewProduct;
