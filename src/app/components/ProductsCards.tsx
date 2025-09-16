"use client";

import React, { useState, useMemo } from "react";

type Product = {
  id: number;
  name: string;
  capitalPerKilo: number;
  imageUrl?: string;
};

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
};

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  suahe: "/suahe.png",
  nylonshell: "/nylonshell.png",
  alimasag: "/alimasag.png",
  halaan: "/halaan.png",
};

const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, "");

const getImageForProduct = (product: Product) => {
  if (product.imageUrl) return product.imageUrl;

  const normalizedName = normalize(product.name);
  const matchedKey = Object.keys(PRODUCT_IMAGE_MAP).find((key) =>
    normalizedName.includes(key)
  );

  return matchedKey ? PRODUCT_IMAGE_MAP[matchedKey] : "/textlogo.png";
};

export default function ProductsCards({
  products,
  onEdit,
  onDelete,
  onAddNew,
}: Props) {
  const [sortKey, setSortKey] = useState<"name" | "capital">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    sorted.sort((a, b) => {
      if (sortKey === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === "asc"
          ? a.capitalPerKilo - b.capitalPerKilo
          : b.capitalPerKilo - a.capitalPerKilo;
      }
    });
    return sorted;
  }, [products, sortKey, sortOrder]);

  // Paginated products
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex flex-col gap-6 mx-6 mt-10">
      {/* Header with title, add button, and sorter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Products
        </h2>
        <div className="flex gap-2 items-center">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            aria-label="Sort products"
            className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 text-sm bg-white border-gray-300"
          >
            <option value="name">Sort by Name</option>
            <option value="capital">Sort by Capital</option>
          </select>
          <button
            onClick={toggleSortOrder}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <button
            className="px-5 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            onClick={onAddNew}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col justify-between hover:shadow-2xl transition duration-300"
          >
            <div className="mb-4 flex justify-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <img
                  src={getImageForProduct(product)}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2 truncate">
                {product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Capital per kilo:{" "}
                <span className="font-semibold text-gray-500 dark:text-gray-300">
                  ₱{product.capitalPerKilo.toLocaleString()}
                </span>
              </p>
            </div>

            <div className="mt-auto flex justify-between gap-3">
              <button
                className="flex-1 px-3 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition text-sm font-medium"
                onClick={() => onEdit(product)}
              >
                Edit
              </button>
              <button
                className="flex-1 px-3 py-2 text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition text-sm font-medium"
                onClick={() => onDelete(product.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
<div className="fixed bottom-0 left-0 right-0 z-50 p-3 flex justify-center items-center gap-2">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-3 py-1 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
  >
    Previous
  </button>

  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={`px-3 py-1 border rounded-md ${
        page === currentPage
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      {page}
    </button>
  ))}

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-3 py-1 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
  >
    Next
  </button>
        </div>
      )}
    </div>
  );
}
