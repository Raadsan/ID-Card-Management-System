"use client";

import React, { useState, useEffect } from "react";
// Removed ThemeContext dependency for now as it wasn't requested/verified to exist in this context,
// and we want to enforce brand colors.

const DataTable = ({ title, columns, data = [], onAddClick, onRefresh, showAddButton = true, loading = false, addButtonLabel = "Add New", showSearch = true }: any) => {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>(data);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (Array.isArray(data)) {
      const searchStr = search.toLowerCase();

      // Helper to get all searchable strings from any value (including objects and dates)
      const getAllStrings = (val: any): string => {
        if (val === null || val === undefined) return "";

        // Handle Dates specifically
        if (val instanceof Date) {
          return `${val.toLocaleDateString()} ${val.toISOString()}`;
        }

        if (typeof val === "string") {
          // Check if it's an ISO date string (common for created_at fields)
          if (val.length > 10 && !isNaN(Date.parse(val)) && val.includes("-") && val.includes("T")) {
            const d = new Date(val);
            return `${val} ${d.toLocaleDateString()}`;
          }
          return val;
        }

        if (typeof val === "number") return String(val);
        if (Array.isArray(val)) return val.map(getAllStrings).join(" ");
        if (typeof val === "object") {
          return Object.values(val).map(getAllStrings).join(" ");
        }
        return "";
      };

      const filtered = data.filter((row) => {
        if (!searchStr) return true;

        return columns.some((col: any) => {
          let searchableContent = "";

          // 1. Try to get from render
          if (col.render) {
            try {
              const rendered = col.render(row);
              if (typeof rendered === "string" || typeof rendered === "number") {
                searchableContent = String(rendered);
              } else {
                // If it's a React element, fall back to the data at col.key
                const raw = col.key ? col.key.split(".").reduce((obj: any, k: any) => obj?.[k], row) : null;
                searchableContent = getAllStrings(raw);
              }
            } catch (e) {
              searchableContent = "";
            }
          }
          // 2. Fallback to key
          else if (col.key) {
            const raw = col.key.split(".").reduce((obj: any, k: any) => obj?.[k], row);
            searchableContent = getAllStrings(raw);
          }

          return searchableContent.toLowerCase().includes(searchStr);
        });
      });
      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData([]);
    }
  }, [search, data, columns]);

  const startIdx = (currentPage - 1) * entriesPerPage;
  const endIdx = startIdx + entriesPerPage;
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-full mx-auto overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex justify-between items-center mb-4">
          <div className="header">
            <h2 className="text-xl font-bold text-[#1B1555]">{title}</h2>
          </div>
          <div className="flex items-center gap-3">

            {showAddButton && onAddClick && (
              <button
                onClick={onAddClick}
                className="bg-[#1B1555] hover:bg-[#16BCF8] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {addButtonLabel}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-3 gap-4 flex-wrap">
          <div className="flex items-center">
            <label className="text-sm text-gray-600">Show&nbsp;</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-2 py-1 focus:ring-[#16BCF8] focus:border-[#16BCF8]"
            >
              {[5, 10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 ml-1"> entries</span>
          </div>
          {showSearch && (
            <div className="relative w-full sm:w-64">
              {/* Search Icon */}
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search details..."
                className="border border-gray-200 pl-9 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#16BCF8] focus:border-transparent transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1B1555] text-white">
            <tr>
              {columns.map((col: any, i: number) => (
                <th
                  key={col.key || i}
                  className={`px-6 py-4 uppercase text-xs font-bold tracking-wider ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  style={col.width ? { width: col.width, minWidth: col.width } : {}}
                >
                  {col.label ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && filteredData.length === 0 ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_: any, j: number) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              filteredData.length > 0 ? (
                filteredData.slice(startIdx, endIdx).map((row: any, idx: number) => (
                  <tr
                    key={row._id || row.id || idx}
                    className={`group transition-colors ${idx % 2 === 0
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-50/50 hover:bg-gray-100"
                      }`}
                  >
                    {columns.map((col: any, i: number) => {
                      const rawValue = col.render
                        ? col.render(row, idx)
                        : col.key
                          ? col.key.split(".").reduce((obj: any, key: any) => obj?.[key], row)
                          : undefined;

                      let cellContent = rawValue;

                      if (rawValue === undefined || rawValue === null || rawValue === "") {
                        cellContent = <span className="text-gray-400">-</span>;
                      } else if (Array.isArray(rawValue)) {
                        cellContent = rawValue.join(", ");
                      }

                      return (
                        <td
                          key={col.key || i}
                          className={`px-4 py-3 text-gray-600 font-medium ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                            }`}
                          style={col.width ? { width: col.width, minWidth: col.width } : {}}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    <p>No data found matching your search.</p>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {loading && filteredData.length > 0 && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-[#1B1555] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-[#1B1555] uppercase tracking-widest">Updating...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500 flex-wrap gap-4">
        <span>
          {filteredData.length === 0
            ? "Showing 0 entries"
            : `Showing ${startIdx + 1} to ${Math.min(endIdx, filteredData.length)} of ${filteredData.length} entries`}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <div className="bg-[#1B1555] text-white px-3 py-1.5 rounded-md text-xs font-bold">
            {currentPage}
          </div>

          <button
            className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
