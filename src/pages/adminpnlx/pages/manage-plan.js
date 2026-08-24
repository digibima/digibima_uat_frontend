import { useEffect, useMemo, useState, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { CallApi } from "@/api";
import constant from "@/env";
import Modal from "@/components/modal";
import PlanEditForm from "./editmangeplan/index";
import AddPlanForm from "./addnewmanageplan/index";
import { showSuccess, showError } from "@/layouts/toaster";

const ManagePlan = ({ token }) => {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromIndex, setFromIndex] = useState(1);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const formRef = useRef();
  const addFormRef = useRef();

  // Fetch plans
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await CallApi(constant.API.ADMIN.MANAGEPLAN, "GET");
      if (response?.status && Array.isArray(response?.data?.plan)) {
        setTotalRecords(response.data.plan.length);
        setData(response.data.plan);
        setPageCount(Math.ceil(response.data.plan.length / 10)); // 10 per page
      } else {
        setTotalRecords(0);
        setData([]);
      }
    } catch (error) {
      console.error("API Error:", error);
      setTotalRecords(0);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUserData();
  }, [token]);

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setShowEditModal(true);
  };

  const deletePlan = async () => {
  if (!selectedPlan?.id) return;
  try {
    const response = await CallApi(
      constant.API.ADMIN.DELETEPLAN,
      "POST",
      { id: selectedPlan.id }
    );
    if (response?.status) {
      showSuccess(response?.message || "Plans deleted successfully!");
     fetchUserData();
      setShowEditModal(false);
      setSelectedPlan(null);
    } else {
      showError(response?.message || "Failed to delete Plans.");
    }
  } catch (error) {
    console.error("API Error:", error);
    showError("Something went wrong!");
  }
};

  const columns = useMemo(
    () => [
      {
        header: "S.No.",
        id: "serial",
        cell: ({ row }) => (currentPage - 1) * 10 + row.index + 1,
      },
      {
        header: "Plan Name",
        accessorKey: "name",
      },
      {
        header: "Action",
        id: "id",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 text-blue-600">
            <button
              onClick={() => handleEdit(row.original)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => {
                setSelectedPlan(row.original);
                setShowDeleteModal(true);
              }}
              className="hover:text-red-600"
              title="Delete"
            >
              <DeleteIcon />
            </button>
          </div>
        ),
      },
    ],
    [currentPage]
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

  

  // Pagination
  const getPlanPage = (page) => {
    setCurrentPage(page);
    setFromIndex((page - 1) * 10 + 1);
    table.setPageIndex(page - 1);
  };

  return (
    <>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPlan(null);
        }}
        title="Delete Plan"
        width="max-w-md"
        height="max-h-[40vh]"
        showConfirmButton={true}
        showCancelButton={true}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          await deletePlan();
          setShowDeleteModal(false);
        }}
      >
        <div className="py-4 text-gray-700">
          Are you sure you want to delete plan{" "}
          <span className="font-semibold">{selectedPlan?.name}</span>?
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPlan(null);
        }}
        title="Edit Plan"
        width="max-w-xl"
        height="max-h-[70vh]"
        showConfirmButton={true}
        showCancelButton={true}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => formRef.current?.submit()}
      >
        <PlanEditForm
          ref={formRef}
          selectedPlan={selectedPlan}
          closeModal={() => {
            setShowEditModal(false);
            setSelectedPlan(null);
          }}
          refreshData={fetchUserData}
        />
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
        }}
        title="Add New Plan"
        width="max-w-xl"
        height="max-h-[70vh]"
        showConfirmButton={true}
        showCancelButton={true}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => addFormRef.current?.submit()}
      >
        <AddPlanForm
          ref={addFormRef}
          closeModal={() => setShowAddModal(false)}
          refreshData={fetchUserData}
        />
      </Modal>

  
      <div className="flex items-center justify-between px-4 py-4 bg-white shadow-sm rounded-xl">
        <h2 className="text-xl font-semibold">Manage Plan</h2>
        <button
          className="py-1.5 px-4 thmbtn"
          onClick={() => setShowAddModal(true)}
        >
          Add New Plan
        </button>
      </div>

    
      <div className="w-full mt-5 overflow-x-auto">
        <div className="rounded-xl shadow-lg border border-blue-200 bg-white overflow-x-auto min-w-full sm:min-w-[600px]">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="p-2 w-full sm:w-64 border border-gray-300 rounded shadow-sm text-sm"
            />
          </div>

          <table className="w-full table-auto text-sm text-left text-gray-800">
            <thead className="bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-gray-700 text-xs uppercase tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-5 py-3 cursor-pointer break-words max-w-[180px] align-top"
                    >
                      <div className="flex items-start gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <AiOutlineArrowUp className="text-sm text-blue-600" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <AiOutlineArrowDown className="text-sm text-blue-600" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-blue-100">
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-5 py-3">
                        <div className="h-4 w-10 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))
                : table.getRowModel().rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`transition-all hover:bg-blue-50 ${
                        i % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-5 py-3 break-words max-w-[180px] align-top"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4 pt-4 px-2 sm:px-0">
          <div className="bg-yellow-100 text-gray-800 px-4 py-2 rounded-full text-sm shadow-inner">
            Total <span className="font-semibold">{totalRecords}</span> Records
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => getPlanPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              «
            </button>
            <button
              onClick={() => getPlanPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              ‹
            </button>

            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => getPlanPage(i + 1)}
                className={`px-3 py-1 rounded-full text-sm transition font-medium ${
                  currentPage === i + 1
                    ? "bg-blue-800 text-white"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => getPlanPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              ›
            </button>
            <button
              onClick={() => getPlanPage(pageCount)}
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

export default ManagePlan;
