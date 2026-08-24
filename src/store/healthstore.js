import { create } from "zustand";

export const useHealthStore = create((set) => ({
  // 🌐 Common States
  loading: false,
  error: null,

  // 🌐 Landing Page Data
  vendorData: [],
  filters: {
    plantype: "",
    coverage: "",
    tenure: "",
    covertype: "",
    porttenure: "",
  },
  pincode: "",
  memberName: "",
  compared: [],

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setVendorData: (vendors) => set({ vendorData: vendors }),
  setFilters: (filters) => set({ filters }),
  setPincode: (pincode) => set({ pincode }),
  setMemberName: (memberName) => set({ memberName }),
  setCompared: (compared) => set({ compared }),

  // 🗑 Reset function
  resetStore: () =>
    set({
      vendorData: [],
      filters: {
        plantype: "",
        coverage: "",
        tenure: "",
        covertype: "",
        porttenure: "",
      },
      pincode: "",
      memberName: "",
      compared: [],
    }),
}));
