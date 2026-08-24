import { useEffect, useMemo, useState } from "react";
// import Layout from "./component/layout";
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

import { CallApi } from "../../api";
import constant from "../../env";

const ManageVendor = () => {
const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageCount, setPageCount] = useState(0);
 const [currentPage, setCurrentPage] = useState(1);
const [fromIndex, setFromIndex] = useState(1);


const columns = useMemo(
    () => [
      {
        header: "S.No.",
        id: "serial",
        cell: ({ row }) => fromIndex + row.index,
      },

      {
        header: "Vendor Name",
        accessorKey: "vendorName",
      },
       
      {
        header: "Action",
        accessorKey: "action",
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
    // onPaginationChange: setPagination,
    // manualPagination: true,
    // pageCount: pageCount,
  });



 const handleCSVImport = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (result) =>
        setData(result.data.filter((row) => row.name && row.position)),
    });
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const workbook = XLSX.read(reader.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);
      setData(parsed.filter((row) => row.name && row.position));
    };
    reader.readAsBinaryString(file);
  };



  return (
    <>
       <div className="flex items-center justify-between p-4">
      <h2 className="text-xl font-semibold">Manage Vendor</h2>

      <button className="bg-purple-400 py-1 px-4 rounded text-white">Add New Vendor</button>
    </div>
       <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="p-2 border rounded"
          />
          {/* <label className="text-sm font-medium">Import CSV:
            <input type="file" accept=".csv" onChange={handleCSVImport} className="ml-2" />
          </label>
          <label className="text-sm font-medium">Import Excel:
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelImport} className="ml-2" />
          </label> */}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm text-left text-gray-700">
            <thead className="bg-gray-100 uppercase text-xs font-semibold">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-2 border cursor-pointer"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc"
                        ? " 🔼"
                        : header.column.getIsSorted() === "desc"
                          ? " 🔽"
                          : ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 border">
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

       


       
        <div className="flex justify-between items-center pt-4 flex-wrap gap-4">
          {/* Left side: Total Records */}
          <div className="bg-yellow-100 text-black px-3 py-1 rounded">
            Total {totalRecords} Records
          </div>

          {/* Right side: Pagination Numbers */}
          <div className="flex gap-1 flex-wrap">

            {/* First Page Button */}
            <button
              // onClick={""}
              disabled={ currentPage === 1}
              className="px-2 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
            >
              «
            </button>

            {/* Prev Page Button */}
            <button
             onClick={""}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
            >
              ‹
            </button>

 
        {/* Number Buttons */}
        {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={''}
                className={`px-2 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-900 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {i + 1}
              </button>
            ))}

         
         {/* Next Page Btn */}
            <button
              onClick={""}
              disabled={currentPage === pageCount}
              className="px-2 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
            >
              ›
            </button>
  
          {/* Last Page Btn */}
            <button
              onClick={""}
              disabled={ currentPage === pageCount}
              className="px-2 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>

      </div>

    </>
  )
}

export default ManageVendor
