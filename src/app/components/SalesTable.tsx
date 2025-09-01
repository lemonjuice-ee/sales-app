"use client";

import { useState, useMemo } from "react";
import { ArrowUpNarrowWide,ArrowDownNarrowWide } from "lucide-react"
import { Search } from "lucide-react"


type Sale = {
  id: number;
  customer: string;
  amount: number;
  createdAt: string;
  status?: string;
};

type SalesTableProps = {
  sales: Sale[];
  onDelete: (id: number) => void;
  onAddNew: () => void;
  onEdit: (sale: Sale) => void;
};


export default function SalesTable({ sales, onDelete, onAddNew, onEdit }: SalesTableProps) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Pick<Sale, "amount" | "createdAt" | "customer">>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => sale.customer.toLowerCase().includes(search.toLowerCase()))
      .filter((sale) => {
        const saleDate = new Date(sale.createdAt).setHours(0, 0, 0, 0);
        const start = startDate ? new Date(startDate).getTime() : null;
        const end = endDate ? new Date(endDate).getTime() : null;
        if (start && saleDate < start) return false;
        if (end && saleDate > end) return false;
        return true;
      })
      .sort((a, b) => {
        let valA: string | number, valB: string | number;
        if (sortField === "amount") {
          valA = a.amount;
          valB = b.amount;
        } else if (sortField === "createdAt") {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        } else {
          valA = a.customer.toLowerCase();
          valB = b.customer.toLowerCase();
        }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [sales, search, startDate, endDate, sortField, sortOrder]);

  return (
    <div className="mx-4 sm:mx-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Sales</h2>
        <button
          onClick={onAddNew}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          + New Sale
        </button>
      </div>

{/* Filter & Sort Controls */}
<div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 flex-wrap">
  {/* Search */}
  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1 w-full sm:w-64 bg-white">
    <Search className="w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search Name"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-1 outline-none px-1 text-sm text-gray-700"
    />
  </div>

  {/* Date filters + Sort */}
  <div className="flex gap-2 items-center flex-wrap">
    {/* Date filters */}
    <label htmlFor="startDate" className="text-gray-700 text-sm">From:</label>
    <input
      id="startDate"
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="px-2 py-1 border border-gray-300 rounded-lg"
      aria-label="Start date"
    />
    <label htmlFor="endDate" className="text-gray-700 text-sm">To:</label>
    <input
      id="endDate"
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="px-2 py-1 border border-gray-300 rounded-lg"
      aria-label="End date"
    />

    {/* Sort */}
    <label htmlFor="sortField" className="text-gray-700 text-sm ml-5">Sort by:</label>
    <select
      id="sortField"
      value={sortField}
      onChange={(e) =>
        setSortField(e.target.value as keyof Pick<Sale, "amount" | "createdAt" | "customer">)
      }
      className="px-2 py-1 border border-gray-300 rounded-lg"
      aria-label="Sort by field"
    >
      <option value="createdAt">Date</option>
      <option value="amount">Amount</option>
      <option value="customer">Customer</option>
    </select>
    <button
      type="button"
      aria-label="Toggle sort order"
      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition flex items-center justify-center"
    >
      {sortOrder === "asc" ? (
        <ArrowUpNarrowWide className="w-6 h-6" />
      ) : (
        <ArrowDownNarrowWide className="w-6 h-6" />
      )}
    </button>
  </div>
</div>

      {/* Table headers */}
      <div className="grid grid-cols-3 sm:grid-cols-4 bg-blue-500 p-4 sm:p-6 rounded-t-xl text-white font-semibold text-sm sm:text-base">
        <div>Customer</div>
        <div>Amount</div>
        <div>Date & Time</div>
        <div className="text-right sm:text-center"></div>
      </div>

      {/* Table body */}
      <div className="flex flex-col gap-2">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="grid grid-cols-3 sm:grid-cols-4 items-center bg-white shadow-sm rounded-xl p-4 sm:p-6 transition-colors duration-300 min-h-[70px] hover:shadow-lg"
            >
              <div className="text-gray-800 font-medium truncate">{sale.customer}</div>
              <div className="text-gray-600 truncate">₱{Number(sale.amount).toLocaleString("en-PH")}</div>
              <div className="text-gray-500 text-sm sm:text-base truncate">
                {new Date(sale.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
              </div>
              <div className="flex gap-2 justify-end sm:justify-center mt-2 sm:mt-0 col-span-1 sm:col-span-1">
                <button
                  onClick={() => onEdit(sale)}
                  className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(sale.id)}
                  className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8 bg-white rounded-b-xl shadow-md">
            No sales found
          </div>
        )}
      </div>
    </div>
  );
}
