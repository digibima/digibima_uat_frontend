import { useEffect, useMemo, useState, useRef } from "react";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProductEditForm from "./editproduct/index";
import AddonForm from "./addnewproduct/index";
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

const ManageProduct = ({ token }) => {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [plans, setPlans] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromIndex, setFromIndex] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const productEditRef = useRef();
  const addonFormRef = useRef();


  const fetchProductData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await CallApi(
        `${constant.API.ADMIN.PRODUCT}?page=${page}`,
        "GET"
      );
      if (response?.status) {
        const productPage = response?.data;   
        const vendorsPage = response?.vendors; 
        const plansPage = response?.plans;     

        setData(productPage?.data ?? []);
        setTotalRecords(productPage?.total ?? 0);
        setPageCount(productPage?.last_page ?? 0);
        setCurrentPage(productPage?.current_page ?? 1);
        setFromIndex(productPage?.from ?? 1);

        // For forms we only need the arrays
        setVendors(vendorsPage?.data ?? []);
        setPlans(plansPage?.data ?? []);
      } else {
        setData([]);
        setTotalRecords(0);
        setPageCount(0);
        setCurrentPage(1);
        setFromIndex(1);
        setVendors([]);
        setPlans([]);
      }
    } catch (error) {
      console.error("API Error:", error);
      setData([]);
      setTotalRecords(0);
      setPageCount(0);
      setCurrentPage(1);
      setFromIndex(1);
      setVendors([]);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProductData(1);
  }, [token]);

  const deleteProduct = async () => {
    if (!selectedProduct?.id) return;
    try {
      const response = await CallApi(
        constant.API.ADMIN.DELETEPRODUCT,
        "POST",
        { id: selectedProduct.id }
      );
      console.log("DeleteProduct API:", response);
      if (response?.status) {
        showSuccess(response?.message || "Product deleted successfully!");

        fetchProductData(currentPage);
        setShowDeleteModal(false);
        setSelectedProduct(null);
      } else {
        showError(response?.message || "Failed to delete product.");
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
        header: "Product Name",
        accessorKey: "productname",
      },
      {
        header: "Vendor Name",
        accessorKey: "vendorname",
      },
      {
        header: "Plan",
        accessorKey: "type",
      },
      {
        header: "Addons",
        accessorKey: "addons",
        cell: ({ row }) => (
          <button onClick={() => {}} className="text-blue-600 hover:underline">
            <VisibilityIcon />
          </button>
        ),
      },
      {
        header: "Action",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 text-blue-600">
            <button
              onClick={() => {
                setSelectedProduct(row.original);
                setShowEditModal(true);
              }}
              className="hover:text-blue-800"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => {
                setSelectedProduct(row.original);
                setShowDeleteModal(true);
              }}
              className="hover:text-red-600"
            >
              <DeleteIcon />
            </button>
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


  const getProductPage = (page) => {
    if (page < 1 || page > pageCount) return;
    fetchProductData(page);
  };

  return (
    <>
      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        title="Edit Product"
        width="max-w-3xl"
        height="max-h-[70vh]"
        showConfirmButton={true}
        showCancelButton={true}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => productEditRef.current?.submit()}
      >
        <ProductEditForm
          ref={productEditRef}
          selectedProduct={selectedProduct}
          plans={plans}
          closeModal={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          refreshData={() => fetchProductData(currentPage)}
        />
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedProduct(null);
        }}
        title="Add New Product"
        width="max-w-3xl"
        height="max-h-[70vh]"
        showConfirmButton={true}
        showCancelButton={true}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => addonFormRef.current?.submit()}
      >
        <AddonForm
          ref={addonFormRef}
          closeModal={() => {
            setShowAddModal(false);
            setSelectedProduct(null);
          }}
          refreshData={() => fetchProductData(currentPage)}
          vendors={vendors}
          plans={plans}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
        width="max-w-md"
        height="max-h-[40vh]"
        showConfirmButton={true}
        showCancelButton={true}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={deleteProduct}
      >
        <div className="p-4">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete{" "}
            <strong>{selectedProduct?.productname}</strong>? This action cannot
            be undone.
          </p>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm rounded-xl">
        <h2 className="text-xl font-semibold">Manage Product</h2>
        <button
          className="py-1.5 px-4 thmbtn"
          onClick={() => {
            setShowAddModal(true);
            setSelectedProduct(null);
          }}
        >
          Add New Vendor
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full mt-5 overflow-x-auto">
        <div className="rounded-xl shadow-lg border border-blue-200 bg-white overflow-x-auto min-w-full sm:min-w-[600px]">
          {/* Search */}
          <div className="p-4">
            <input
              type="text"
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="p-2 w-full sm:w-64 border border-gray-300 rounded shadow-sm text-sm"
            />
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
                : table.getRowModel().rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-blue-50/30"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3">
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
              onClick={() => getProductPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              «
            </button>
            <button
              onClick={() => getProductPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              ‹
            </button>

            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => getProductPage(i + 1)}
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
              onClick={() => getProductPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm disabled:opacity-30 hover:bg-blue-700"
            >
              ›
            </button>
            <button
              onClick={() => getProductPage(pageCount)}
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

export default ManageProduct;
