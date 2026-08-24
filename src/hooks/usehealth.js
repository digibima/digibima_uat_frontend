import { useQuery, useQueries } from "@tanstack/react-query";
import { CallApi } from "@/api";
import constant from "@/env";
import { useHealthStore } from "@/store/healthstore";

export function usePlanData() {
  const setVendorData = useHealthStore((s) => s.setVendorData);
  const setPincode = useHealthStore((s) => s.setPincode);
  const setMemberName = useHealthStore((s) => s.setMemberName);
  const setFilters = useHealthStore((s) => s.setFilters);

  return useQuery({
    queryKey: ["planData"],
    queryFn: async () => {
      const res = await CallApi(constant.API.HEALTH.PLANDATA);
      if (res) {
        setVendorData(res.vendor || []);
        setPincode(res.pincode || "");
        const allMembers = res.aInsureData || [];
        setMemberName(`Self(${allMembers.length})`);

        setFilters({
          plantype: res.plantype?.toString() || "",
          coverage: res.coverage?.toString() || "",
          tenure: res.tenure?.toString() || "",
          covertype: res.covertype?.toString() || "",
          porttenure: res.porttenure?.toString() || "",
        });
      }
      return res;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5, 
    cacheTime: 1000 * 60 * 10,
  });
}

export function useVendorPlans() {
  const vendorData = useHealthStore((s) => s.vendorData);
  const filters = useHealthStore((s) => s.filters);

  return useQueries({
    queries: vendorData.map((vendor) => ({
      queryKey: ["vendorPlan", vendor.vid, filters], 
      queryFn: async () => {
        const route = constant.ROUTES.HEALTH.VENDOR[String(vendor.vid)] || "";
        const res = await CallApi(constant.API.HEALTH.GETQUOTE, "POST", {
          ...vendor,
          route,
          filters,
        });
        if (!res.status) throw new Error("Failed to fetch plan");
        return res.data;
      },
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })),
  });
}

// 3. Example Future Hook (Premium Details)
export function usePremiumDetails(planId) {
  return useQuery({
    queryKey: ["premiumDetails", planId],
    queryFn: () =>
      CallApi(constant.API.HEALTH.GET_PREMIUM_DETAILS, "POST", { planId }),
    enabled: !!planId, 
    staleTime: 1000 * 60 * 5,
  });
}
