"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";
import { Eye, EyeClosed } from "lucide-react";

import React from "react";

type Customer = {
  id: number;
  name: string;
  email: string;
};

type Product = {
  id: number;
  name: string;
  capitalPerKilo: number;
};

type SaleProduct = {
  id: number;
  product: Product;
  quantity: number;
  price: number;
};

type Sale = {
  id: number;
  customer: Customer;
  createdAt: string;
  total: number;
  products: SaleProduct[];
};

type Props = {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: number) => void;
};

export default function SalesTable({ sales, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">(
    "all"
  );
  const [sortKey, setSortKey] = useState<"date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
   const [visible, setVisible] = useState(false);

  const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

    const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };
  
    // Unique customers list for filter buttons
  const uniqueCustomers = useMemo(() => {
    const seen = new Map<number, string>();
    sales.forEach((sale) => {
      if (sale.customer) seen.set(sale.customer.id, sale.customer.name);
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [sales]);

  const filteredSales = useMemo(() => {
    let data = [...sales];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (sale) =>
          sale.customer?.name.toLowerCase().includes(q) ||
          sale.products.some((p) =>
            p.product.name.toLowerCase().includes(q)
          )
      );
    }

        // Apply customer filter (if selected)
    if (selectedCustomers.length > 0) {
      data = data.filter((sale) =>
        selectedCustomers.includes(sale.customer?.id)
      );
    }

    const now = new Date();
    if (filter === "today") {
      data = data.filter(
        (sale) =>
          new Date(sale.createdAt).toDateString() === now.toDateString()
      );
    } else if (filter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      data = data.filter((sale) => new Date(sale.createdAt) >= start);
    } else if (filter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      data = data.filter((sale) => new Date(sale.createdAt) >= start);
    }

    data.sort((a, b) => {
      if (sortKey === "date") {
        const diff =
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? diff : -diff;
      } else {
        const diff = a.total - b.total;
        return sortOrder === "asc" ? diff : -diff;
      }
    });



    return data;
  }, [sales, search, filter, sortKey, sortOrder,selectedCustomers]);
  
  const totalSales = useMemo(() => {
  return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
}, [filteredSales]);

const totalProfit = useMemo(() => {
  return filteredSales.reduce(
    (sum, sale) =>
      sum +
      sale.products.reduce(
        (pSum, sp) => pSum + (sp.price - sp.product.capitalPerKilo) * sp.quantity,
        0
      ),
    0
  );
}, [filteredSales]);

  const toggleVisibility = () => {
    setVisible((prev) => !prev);
  };
const displayValue = (value: number) => {
  const formatted = `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return visible ? (
    formatted
  ) : (
    <span className="inline-block filter blur-sm select-none">{formatted}</span>
  );
};

  const toggleCustomer = (id: number) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

const retractAllRows = () => {
  setExpandedRows([]); // clear all expanded rows
};

  return (
    <div className="mt-10">
{/* Controls Row */}
<div className="flex flex-col gap-4 mb-6">
  {/* Top Row: Search + Filters */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
    {/* Search */}
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
      <input
        type="text"
        placeholder="Search sales..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 pr-4 py-2 border rounded-full bg-white dark:bg-gray-800 dark:border-gray-600 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
      />
    </div>    
  </div>

  {/* Customer Filter Buttons + Sorters in one row */}
<div className="flex flex-wrap items-center gap-2">
{/* Customer Buttons */}
{uniqueCustomers.map((c) => (
  <button
    key={c.id}
    onClick={() => toggleCustomer(c.id)}
    className={`px-3 py-1 rounded-md border text-sm transition ${
      selectedCustomers.includes(c.id)
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
    }`}
  >
    {c.name}
  </button>
))}

{/* Clear All Button */}
{selectedCustomers.length > 0 && (
  <button
    onClick={() => setSelectedCustomers([])}
    className="px-3 py-1 rounded-md border text-sm bg-red-500 text-white border-red-600 hover:bg-red-200 transition"
  >
    Clear All
  </button>
)}
  {/* Filters + Sort (pushed to the right) */}
  <div className="flex flex-col sm:flex-row items-end gap-3 ml-auto">
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value as any)}
      aria-label="Filter sales by date"
      className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-sm bg-white border-gray-300"
    >
      <option value="all">All</option>
      <option value="today">Today</option>
      <option value="week">This Week</option>
      <option value="month">This Month</option>
    </select>

    <select
      value={sortKey}
      onChange={(e) => setSortKey(e.target.value as any)}
      aria-label="Sort sales"
      className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-sm bg-white border-gray-300"
    >
      <option value="date">Sort by Date</option>
      <option value="total">Sort by Total</option>
    </select>

    <button
      type="button"
      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      className="p-3 border rounded-md dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition bg-white border-gray-300"
    >
      {sortOrder === "asc" ? (
        <ArrowUp className="w-3.5 h-3.5" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5" />
      )}
    </button>
  </div>
  </div>
</div>

      {/* Table */}
<div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
  <table className="min-w-full border-collapse text-sm">
    <thead className="bg-blue-600 text-white sticky top-0 z-10">
      <tr>
        <th className="p-4 text-left font-semibold border-b border-gray-300 dark:border-gray-700">
          Customer
        </th>
        <th className="p-4 text-left font-semibold border-b border-gray-300 dark:border-gray-700">
          Date
        </th>
        <th className="p-4 text-left font-semibold border-b border-gray-300 dark:border-gray-700">
          Total
        </th>
        <th className="p-4 text-left font-semibold border-b border-gray-300 dark:border-gray-700">
          Profit
        </th>
        <th className="p-4 text-center font-semibold border-b border-gray-300 dark:border-gray-700">
        </th>
       <th className="p-4 text-center font-semibold border-b border-gray-300 dark:border-gray-700">
  <div className="flex items-center justify-center gap-1">
    <button
      type="button"
      onClick={() => setExpandedRows([])} // retract all rows
      className="text-gray-300 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
      aria-label="Toggle all rows"
    >
      {expandedRows.length <= 1 ? <ChevronsDown size={24} /> : <ChevronsUp size={24} />}
    </button>
  </div>
</th>
      </tr>
    </thead>

    <tbody>
      {filteredSales.length === 0 ? (
        <tr>
          <td
            colSpan={6}
            className="text-center p-6 text-gray-500 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700"
          >
            No sales found.
          </td>
        </tr>
      ) : (
        filteredSales.map((sale, idx) => (
          <React.Fragment key={sale.id}>
            {/* Main Row */}
            <tr
              className={`${
                idx % 2 === 0
                  ? "bg-gray-200 dark:bg-gray-900/40"
                  : "bg-gray-50 dark:bg-gray-800"
              } hover:bg-blue-50 dark:hover:bg-gray-700 transition border-b border-gray-300 dark:border-gray-700`}
            >
              <td className="p-4 font-medium text-gray-900 dark:text-gray-100 text-lg">
                {sale.customer?.name}
              </td>

              <td className="p-4 text-gray-600 dark:text-gray-300">
                {format(new Date(sale.createdAt), "PPpp")}
              </td>

              <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">
                ₱{sale.total.toFixed(2)}
              </td>

              <td className="p-4 font-semibold text-green-600 dark:text-green-400">
                ₱
                {sale.products
                  .reduce(
                    (sum, sp) =>
                      sum + (sp.price - sp.product.capitalPerKilo) * sp.quantity,
                    0
                  )
                  .toFixed(2)}
              </td>

              <td className="p-4 text-center flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(sale)}
                  className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm sm:text-base"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(sale.id)}
                  className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm sm:text-base"
                >
                  Delete
                </button>
              </td>

              <td className="p-4 text-center">
                <button
                  type="button"
                  onClick={() => toggleRow(sale.id)}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  aria-label={`${
                    expandedRows.includes(sale.id) ? "Collapse" : "Expand"
                  } products for ${sale.customer?.name}`}
                >
                  {expandedRows.includes(sale.id) ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </td>
            </tr>

            {/* Expanded Products Cards */}
            {expandedRows.includes(sale.id) && (
              <tr key={`${sale.id}-details`}>
                <td colSpan={6} className="p-4 border-b border-gray-300 dark:border-gray-700">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {sale.products.map((sp) => (
                      <div
                        key={sp.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 hover:shadow-lg transition flex flex-col justify-between border border-gray-200 dark:border-gray-700"
                      >
                        <div className="mb-2">
                          <h5 className="text-gray-800 dark:text-gray-200 font-semibold text-lg truncate">
                            {sp.product.name}
                          </h5>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Quantity: {sp.quantity} kg
                          </p>
                        </div>
                        <div className="text-green-600 dark:text-green-400 font-semibold text-sm">
                          ₱{sp.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))
      )}
    </tbody>
  </table>      
</div>
{/* Total Sales & Profit */}
    {/* Eye Icon */}
<div className="fixed bottom-24 right-4 z-50">
  <button
    onClick={toggleVisibility}
    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
    aria-label={visible ? "Mask totals" : "Show totals"}
  >
    {visible ? <Eye size={24} /> : <EyeClosed size={24} />}
  </button>
</div>

{/* Totals */}
<div className="fixed bottom-4 right-4 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex gap-8 z-50">
  <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
    Total Sales:{" "}
    <span className="text-blue-600 dark:text-blue-400">
      {displayValue(totalSales)}
    </span>
  </p>
  <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
    Total Profit:{" "}
    <span className="text-green-600 dark:text-green-400">
      {displayValue(totalProfit)}
    </span>
  </p>
</div>
  </div>
  );
}
