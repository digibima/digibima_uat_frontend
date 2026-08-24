import { useEffect, useMemo, useState, useRef } from "react";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VendorEditForm from "./editvendor/index";
import AddVendorForm from "./addnewvendor/index";
import { showSuccess, showError } from "@/layouts/toaster";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import Modal from "@/components/modal";
import { CallApi } from "@/api";
import constant from "@/env";

const ManageVendor = ({ token }) => {
  const [data, setData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromIndex, setFromIndex] = useState(1);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const vendorEditRef = useRef();
  const addVendorRef = useRef();

const fetchVendorData = async () => {
  setLoading(true);
  try {
    const response = await CallApi(constant.API.ADMIN.MANAGEVENDOR, "GET");
    if (response?.status && response?.data?.vendors) {
      const vendorArray = response.data.vendors; 

      setVendorList(vendorArray);
      setData(vendorArray);
      setTotalRecords(vendorArray.length);
      setPageCount(Math.ceil(vendorArray.length / 10));

      if (response.data.plans) {
        setPlans(response.data.plans);
      }
    } else {
      setVendorList([]);
      setData([]);
      setTotalRecords(0);
    }
  } catch (error) {
    console.error("API Error:", error);
    setTotalRecords(0);
    setData([]);
    setVendorList([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (token) fetchVendorData();
  }, [token]);

const deleteVendor = async () => {
  if (!selectedVendor?.id) return;
  try {
    const response = await CallApi(
      constant.API.ADMIN.MANAGEVENDOR,
      "POST",
      { id: selectedVendor.id }
    );
    if (response?.status) {
      showSuccess(response?.message || "Vendor deleted successfully!");
      fetchVendorData();
      setShowEditModal(false);
      setSelectedVendor(null);
    } else {
      showError(response?.message || "Failed to delete vendor.");
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
        cell: ({ row }) => fromIndex + row.index,
      },
      {
        header: "Vendor Name",
         accessorKey: "vendorname"
      },
      {
        header: "Action",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 text-blue-600">
            <button
              onClick={() => {
                setSelectedVendor(row.original);
                setShowEditModal(true);
              }}
              className="hover:text-blue-800"
            >
              <EditIcon />
            </button>
            {/* <button
  onClick={() => {
    setSelectedVendor(row.original);
    setShowDeleteModal(true);
  }}
  className="hover:text-red-600"
>
  <DeleteIcon />
</button> */}
          </div>
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



  const getPage = (page) => {
    setCurrentPage(page);
    setFromIndex((page - 1) * 10 + 1); // Calculate starting index
    table.setPageIndex(page - 1);
  };

  return (
    <>
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVendor(null);
        }}
        title="Edit Vendor"
        width="max-w-xl"
        height="max-h-[70vh]"
        showConfirmButton={true}
        showCancelButton={true}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => vendorEditRef.current?.submit()}
      >
        <VendorEditForm
          ref={vendorEditRef}
          selectedVendor={selectedVendor}
          closeModal={() => {
            setShowEditModal(false);
            setSelectedVendor(null);
          }}
          refreshData={fetchVendorData}
        />
      </Modal>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
        }}
        title="Add New Vendor"
        width="max-w-xl"
        height="max-h-[100vh]"
        showConfirmButton={true}
        showCancelButton={true}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => addVendorRef.current?.submit()}
      >
        <AddVendorForm
          ref={addVendorRef}
          plans={plans}
          closeModal={() => setShowAddModal(false)}
          refreshData={fetchVendorData}
        />
      </Modal>
      <Modal
  isOpen={showDeleteModal}
  onClose={() => {
    setShowDeleteModal(false);
    setSelectedVendor(null);
  }}
  title="Delete Vendor"
  width="max-w-md"
  height="max-h-[40vh]"
  showConfirmButton={true}
  showCancelButton={true}
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={async () => {
    await deleteVendor();
    setShowDeleteModal(false);
  }}
>
  <div className="py-4 text-gray-700">
    Are you sure you want to delete vendor{" "}
   <span className="font-semibold">{selectedVendor?.vendorname}</span>?
  </div>
</Modal>

      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm rounded-xl">
        <h2 className="text-xl font-semibold">Manage Vendor</h2>
        <button
          className="py-1.5 px-4 thmbtn"
          onClick={() => setShowAddModal(true)}
        >
          Add New Vendor
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
                      <td className="px-5 py-3">
                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
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

        {/* Pagination */}
        <div className="flex justify-between items-center flex-wrap gap-4 pt-4 px-2 sm:px-0">
          <div className="bg-yellow-100 text-gray-800 px-4 py-2 rounded-full text-sm shadow-inner">
            Total <span className="font-semibold">{totalRecords}</span> Records
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => getPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              «
            </button>
            <button
              onClick={() => getPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              ‹
            </button>

            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => getPage(i + 1)}
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
              onClick={() => getPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              ›
            </button>
            <button
              onClick={() => getPage(pageCount)}
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

export default ManageVendor;
