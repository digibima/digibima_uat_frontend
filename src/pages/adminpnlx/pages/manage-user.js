import { useEffect, useMemo, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FiUser, FiFileText, FiPieChart, FiArrowUpRight, FiCheckCircle, FiXCircle } from "react-icons/fi";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { CallApi } from "@/api";
import constant from "@/env";
import Modal from "@/components/modal";

const ManageUser = ({ token }) => {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromIndex, setFromIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPolicies, setUserPolicies] = useState([]);
const [activeTab, setActiveTab] = useState("profile");

  const fetchUserData = async (page = 1, search = "") => {
  setLoading(true);
  try {
    const apiUrl = search 
      ? `${constant.API.ADMIN.MANAGEUSER}?search=${search}`
      : `${constant.API.ADMIN.MANAGEUSER}?page=${page}`;

    const response = await CallApi(apiUrl, "GET");
      if (response?.status) {
        const userData = response?.data?.user;
        setData(userData?.data || []);
        setTotalRecords(userData?.total || 0);
        setPageCount(userData?.last_page || 0);
        setCurrentPage(userData?.current_page || 1);
        setFromIndex(userData?.from || 1);
      }
    } catch (error) {
      console.error("API Error:", error);
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (token) fetchUserData(1, globalFilter); 
}, [token, globalFilter]); 

  const columns = useMemo(
    () => [
      {
        header: "S.No.",
        id: "serial",
        cell: ({ row }) => fromIndex + row.index,
      },
      {
        header: "Mobile Number",
        accessorKey: "mobile",
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Created At",
        accessorKey: "created_at",
      },
{
  header: "Action",
  accessorKey: "action",
  cell: ({ row }) => (
    <button
      onClick={async () => {
        const userId = row.original.id;
        setSelectedUser(row.original);
        
        try {
          // सटीक API पाथ यहाँ पास करें
          const response = await CallApi(
            `/api/adminpnlx/user-policies?user_id=${userId}`, 
            "GET"
          );
          
          // आपके JSON स्ट्रक्चर के अनुसार response.data.data में एरे आ रहा है
          if (response?.status) {
            setUserPolicies(response?.data?.data || []); 
          }
        } catch (error) {
          console.error("Policy API Error:", error);
          setUserPolicies([]);
        }

        setShowViewModal(true);
      }}
      className="text-blue-600 hover:underline"
    >
      <VisibilityIcon />
    </button>
  ),
},
    ],
    [fromIndex]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  //Server-side pagination
const getUserPage = (page) => {
  if (page < 1 || page > pageCount) return;
  fetchUserData(page, globalFilter);
};

  return (
    <>
      {/* View Modal */}
<Modal
  isOpen={showViewModal}
  onClose={() => {
    setShowViewModal(false);
    setSelectedUser(null);
    setUserPolicies([]);
    setActiveTab("profile"); 
  }}
  title="View User Details"
  width="max-w-4xl" 
  height="max-h-[85vh]"
  showConfirmButton={false}
  showCancelButton={true}
>
  <div className="w-full">
    <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2">
      {[
        { id: "profile", label: "User Details", icon: <FiUser className="text-base" /> },
        { id: "all_policies", label: "All Policies", icon: <FiFileText className="text-base" /> },
        { id: "status_view", label: "Policy Status", icon: <FiPieChart className="text-base" /> },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === tab.id
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>

    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn p-1">
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              value={selectedUser?.name || "N/A"}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">User ID</label>
            <input
              type="text"
              value={selectedUser?.id || "N/A"}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Mobile Number</label>
            <input
              type="text"
              value={selectedUser?.mobile || "N/A"}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Registered On</label>
            <input
              type="text"
              value={selectedUser?.created_at || "N/A"}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
            />
          </div>
        </div>
      )}

      {activeTab === "all_policies" && (
        <div className="animate-fadeIn overflow-x-auto border border-slate-100 rounded-xl shadow-sm">
          {userPolicies.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No policies linked to this user.</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Proposer</th>
                  <th className="px-4 py-3">Policy No.</th>
                  <th className="px-4 py-3">Plan Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Risk Start</th>
                  <th className="px-4 py-3">Risk End</th>
                  <th className="px-4 py-3 text-right">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {userPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{policy.proposar_name || "N/A"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{policy.policy || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{policy.policy_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded capitalize">
                        {policy.policy_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{policy.from_date || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{policy.to_date || "N/A"}</td>
                    <td className="px-4 py-3 text-right">
                      {policy.policy_pdf_path ? (
                        <a 
                          href={policy.policy_pdf_path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-0.5"
                        >
                          View <FiArrowUpRight />
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "status_view" && (
        <div className="animate-fadeIn space-y-6">
          {userPolicies.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No policies data to analyze status.</p>
          ) : (
            (() => {
              const today = new Date();
              const activeList = userPolicies.filter(p => p.to_date && new Date(p.to_date) >= today);
              const inactiveList = userPolicies.filter(p => !p.to_date || new Date(p.to_date) < today);

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="border border-emerald-100 bg-emerald-50/10 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                      <h4 className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                        <FiCheckCircle className="text-emerald-500 text-base" />
                        Active Coverage ({activeList.length})
                      </h4>
                    </div>
                    {activeList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No currently active policies.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeList.map(p => (
                          <div key={p.id} className="bg-white border border-slate-100 p-2.5 rounded-lg flex justify-between items-center text-xs">
                            <div>
                              <p className="font-semibold text-slate-800">{p.proposar_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">No: {p.policy}</p>
                            </div>
                            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              Ends: {p.to_date}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border border-rose-100 bg-rose-50/10 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-rose-100 pb-2">
                      <h4 className="font-bold text-sm text-rose-800 flex items-center gap-2">
                        <FiXCircle className="text-rose-500 text-base" />
                        Expired / Lapsed ({inactiveList.length})
                      </h4>
                    </div>
                    {inactiveList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No expired policies found.</p>
                    ) : (
                      <div className="space-y-2">
                        {inactiveList.map(p => (
                          <div key={p.id} className="bg-white border border-slate-100 p-2.5 rounded-lg flex justify-between items-center text-xs">
                            <div>
                              <p className="font-semibold text-slate-800">{p.proposar_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">No: {p.policy}</p>
                            </div>
                            <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              Expired
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })()
          )}
        </div>
      )}

    </div>
  </div>
</Modal>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm rounded-xl">
        <h2 className="text-xl font-semibold">Manage User</h2>
      </div>

      {/* Table Wrapper */}
      <div className="w-full mt-5 overflow-x-auto">
        <div className="rounded-xl shadow-lg border border-blue-200 bg-white overflow-x-auto min-w-full sm:min-w-[600px]">
         <div className="p-4 flex flex-wrap items-center gap-2">
  <input
    type="text"
    placeholder="Search..."
    value={searchTerm} 
    onChange={(e) => setSearchTerm(e.target.value)}
    className="p-2 w-full sm:w-64 border border-gray-300 rounded shadow-sm text-sm"
  />
  
  <button
    onClick={() => setGlobalFilter(searchTerm)}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded shadow-sm transition-colors"
  >
    Search
  </button>

  {globalFilter && (
    <button
      onClick={() => {
        setSearchTerm("");
        setGlobalFilter("");
      }}
      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium text-sm rounded shadow-sm transition-colors"
    >
      Clear
    </button>
  )}
</div>

          {/* Table */}
          <table className="w-full table-auto text-sm text-left text-gray-800">
            <thead className="bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-gray-700 text-xs uppercase tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-5 py-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && <span>🔼</span>}
                        {header.column.getIsSorted() === "desc" && <span>🔽</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-blue-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-5 py-3">
                      <div className="h-4 w-8 bg-gray-200 animate-pulse rounded"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 w-28 bg-gray-200 animate-pulse rounded"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 w-10 bg-gray-200 animate-pulse rounded"></div>
                    </td>
                  </tr>
                ))
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-blue-50/30"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center flex-wrap gap-4 pt-4 px-2 sm:px-0">
          <div className="bg-yellow-100 text-gray-800 px-4 py-2 rounded-full text-sm shadow-inner">
            Total <span className="font-semibold">{totalRecords}</span> Records
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {/* First + Prev */}
            <button
              onClick={() => getUserPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              «
            </button>
            <button
              onClick={() => getUserPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              ‹
            </button>

            {/* Page Numbers (Sliding Window) */}
            {(() => {
              const pageWindow = 5; 
              const startPage = Math.max(
                1,
                currentPage - Math.floor(pageWindow / 2)
              );
              const endPage = Math.min(pageCount, startPage + pageWindow - 1);

              return Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => {
                  const page = startPage + i;
                  return (
                    <button
                      key={page}
                      onClick={() => getUserPage(page)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        currentPage === page
                          ? "bg-blue-800 text-white"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              );
            })()}

            {/* Next + Last */}
            <button
              onClick={() => getUserPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              ›
            </button>
            <button
              onClick={() => getUserPage(pageCount)}
              disabled={currentPage === pageCount}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageUser;
