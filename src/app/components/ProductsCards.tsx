"use client";

import React from "react";

type Product = {
  id: number;
  name: string;
  capitalPerKilo: number;
  imageUrl?: string; // optional custom image URL
};

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
};

// Map product names (lowercase) to image URLs
// Map product names (normalized) to image URLs
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  suahe: "/suahe.png",
  nylonshell: "/nylonshell.png", // no spaces in filename
  alimasag: "/alimasag.png",
  halaan: "/halaan.png",
};

// Function to normalize strings: lowercase + remove spaces
const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, "");

// Function to get image URL for a product
const getImageForProduct = (product: Product) => {
  if (product.imageUrl) return product.imageUrl;

  const normalizedName = normalize(product.name);
  const matchedKey = Object.keys(PRODUCT_IMAGE_MAP).find(
    key => normalizedName.includes(key)
  );

  return matchedKey ? PRODUCT_IMAGE_MAP[matchedKey] : "/logo.png";
};

export default function ProductsCards({ products, onEdit, onDelete, onAddNew }: Props) {
  return (
    <div className="flex flex-col gap-6 mx-6 mt-10">
      {/* Add Product Button */}
      <div className="flex justify-end mb-4">
        <button
          className="px-5 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base"
          onClick={onAddNew}
        >
          + New Product
        </button>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between hover:shadow-2xl transition duration-300"
          >
            {/* Image Slot */}
            <div className="mb-4 flex justify-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={getImageForProduct(product)}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
              <p className="text-gray-600">
                Capital per kilo:{" "}
                <span className="font-semibold text-gray-800">
                  ₱{product.capitalPerKilo.toLocaleString()}
                </span>
              </p>
            </div>

            {/* Action Buttons */}
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
    </div>
  );
}
