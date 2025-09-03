"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { ArrowUp, ArrowDown, Shrimp } from "lucide-react";

type Customer = {
  id: number;
  name: string;
  email: string;
};

type Product = {
  id: number;
  name: string;
  capitalPerKilo: number;
  pricePerKilo?: number;
};

type CustomersTableProps = {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
};

export default function CustomersTable({ customers, onEdit, onDelete }: CustomersTableProps) {
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);
  const [customerProducts, setCustomerProducts] = useState<Record<number, Product[]>>({});
  const [editingPrices, setEditingPrices] = useState<Record<number, Record<number, string>>>({});
  const [sortField, setSortField] = useState<keyof Customer>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [priceErrors, setPriceErrors] = useState<Record<number, Record<number, string>>>({});

  const fetchProducts = async (customerId: number) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/products`);
      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        throw new Error(data?.error || "Unexpected API response");
      }

      setCustomerProducts((prev) => ({ ...prev, [customerId]: data }));

      const initialPrices: Record<number, string> = {};
      data.forEach((p) => {
        initialPrices[p.id] = (p.pricePerKilo ?? p.capitalPerKilo).toString();
      });
      setEditingPrices((prev) => ({ ...prev, [customerId]: initialPrices }));
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products.");
    }
  };

  const handleViewProducts = (customerId: number) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(customerId);
      if (!customerProducts[customerId]) fetchProducts(customerId);
    }
  };

  const handlePriceChange = (customerId: number, productId: number, value: string) => {
    const product = customerProducts[customerId]?.find((p) => p.id === productId);
    const num = parseFloat(value);

    let errorMsg = "";
    if (product && !isNaN(num) && num <= product.capitalPerKilo) {
      errorMsg = `Retail price must be higher than ₱${product.capitalPerKilo.toLocaleString()}`;
    }

    setEditingPrices((prev) => ({
      ...prev,
      [customerId]: { ...prev[customerId], [productId]: value },
    }));

    setPriceErrors((prev) => ({
      ...prev,
      [customerId]: { ...prev[customerId], [productId]: errorMsg },
    }));
  };

  const handleSavePrices = async (customerId: number) => {
    try {
      const errors = priceErrors[customerId];
      if (errors && Object.values(errors).some((msg) => msg)) {
        toast.error("Please fix validation errors before saving.");
        return;
      }

      const payload: Record<number, number> = {};
      Object.entries(editingPrices[customerId]).forEach(([productId, val]) => {
        const num = parseFloat(val);
        if (!isNaN(num)) payload[parseInt(productId)] = num;
      });

      const res = await fetch(`/api/customers/${customerId}/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save prices");
      toast.success("Customer prices updated successfully!");
      setExpandedCustomer(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save customer prices.");
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    const valA = a[sortField].toString().toLowerCase();
    const valB = b[sortField].toString().toLowerCase();
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="mx-4 sm:mx-6 mt-2">
      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <label htmlFor="sortField" className="text-gray-700 dark:text-gray-300 text-sm">
          Sort by:
        </label>
        <select
          id="sortField"
          value={sortField}
          onChange={(e) => setSortField(e.target.value as keyof Customer)}
          className="px-2 py-1 border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-xl"
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
        </select>
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center"
        >
          {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {sortedCustomers.length > 0 ? (
          sortedCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 sm:p-6 transition-colors duration-300 hover:shadow-lg"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 items-center gap-2">
                <span className="text-gray-800 dark:text-gray-100 font-bold truncate">{customer.name}</span>
                <span className="text-gray-500 dark:text-gray-400 truncate">{customer.email}</span>
                <button
                 className="flex items-center justify-center gap-2 px-3 py-1 
           bg-purple-200/70 dark:bg-orange-900/50 
           text-orange-600 dark:text-orange-400 
           rounded-lg font-medium 
           hover:bg-orange-200/80 dark:hover:bg-orange-800/60 
           transition w-full sm:w-40"

                  onClick={() => handleViewProducts(customer.id)}
                >
                  <Shrimp className="w-5 h-5" />
                  {expandedCustomer === customer.id ? "Hide Products" : "View Products"}
                </button>
                <div className="flex gap-2 justify-end sm:justify-center">
                  <button
                    className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm sm:text-base"
                    onClick={() => onEdit(customer)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm sm:text-base"
                    onClick={() => onDelete(customer.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded products */}
              {expandedCustomer === customer.id && customerProducts[customer.id] && (
                <div className="mt-4 grid gap-4">
                  {customerProducts[customer.id].map((product) => (
                    <div
                      key={product.id}
                      className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base">{product.name}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
                          Capital: ₱{product.capitalPerKilo.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-full sm:w-40 flex flex-col mt-2 sm:mt-0">
                        <label
                          htmlFor={`price-${customer.id}-${product.id}`}
                          className="text-gray-700 dark:text-gray-300 font-medium mb-1 text-sm"
                        >
                          Retail Price
                        </label>
                        <input
                          id={`price-${customer.id}-${product.id}`}
                          type="number"
                          className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                            ${
                              priceErrors[customer.id]?.[product.id]
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 dark:border-gray-600 focus:ring-blue-400"
                            }`}
                          placeholder="₱ Enter price"
                          value={editingPrices[customer.id][product.id]}
                          onChange={(e) => handlePriceChange(customer.id, product.id, e.target.value)}
                        />
                        {priceErrors[customer.id]?.[product.id] && (
                          <p className="text-red-500 text-xs mt-1">{priceErrors[customer.id][product.id]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSavePrices(customer.id)}
                      className="px-6 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition"
                    >
                      Save Prices
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 bg-white dark:bg-gray-800 rounded-b-xl shadow-md col-span-2">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}
