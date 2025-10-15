"use client";

import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import ConfirmationModal from "./ConfirmartionModal";

type Customer = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  pricePerKilo: number;
  totalPurchased?: number;
};

type SaleProduct = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

type SaleData = {
  id?: number;
  customerId: number;
  products: SaleProduct[];
  total: number;
  date?: string;
};

type NewSaleFormProps = {
  initialData?: SaleData;
  onSaved: () => void;
  onCancel?: () => void;
};

export default function NewSaleForm({
  initialData,
  onSaved,
  onCancel,
}: NewSaleFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const isEdit = Boolean(initialData);

  // 🆕 Date state
  const [saleDate, setSaleDate] = useState<string>("");

  // Prefill for editing or set today for new
  useEffect(() => {
    if (initialData) {
      setSaleProducts(initialData.products);
      setSaleDate(initialData.date || "");
    } else {
      const today = new Date().toISOString().split("T")[0];
      setSaleDate(today);
    }
  }, [initialData]);

  // Fetch customers
  useEffect(() => {
    async function fetchCustomers() {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        if (initialData) {
          const cust = data.find((c: Customer) => c.id === initialData.customerId);
          setSelectedCustomer(cust || null);
        }
      }
    }
    fetchCustomers();
  }, [initialData]);

  // Fetch products for selected customer
  useEffect(() => {
    async function fetchProducts() {
      if (!selectedCustomer) return;
      const res = await fetch(`/api/customers/${selectedCustomer.id}/products`);
      if (res.ok) {
        let data: Product[] = await res.json();
        data = data.sort((a, b) => (b.totalPurchased ?? 0) - (a.totalPurchased ?? 0));
        setProducts(data);
      }
    }
    fetchProducts();
    setCurrentPage(1);
  }, [selectedCustomer]);

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateProduct = (product: Product, newQty: number, newPrice: number) => {
    setSaleProducts((prev) => {
      if (newQty <= 0) return prev.filter((i) => i.productId !== product.id);
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQty, price: newPrice } : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: newPrice, quantity: newQty }];
    });
  };

  const handleRemoveProduct = (index: number) => {
    setSaleProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const total = saleProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }
    if (!saleDate) {
      alert("Please select a date");
      return;
    }

    const productsForApi = saleProducts.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
    }));

const payload = {
  id: initialData?.id,
  customerId: selectedCustomer.id,
  products: productsForApi,
  total,
  createdAt: saleDate, // 👈 match schema
};

    const res = await fetch("/api/sales", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) onSaved();
    else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save sale");
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirm(true);
        }}
        className="w-full max-w-7xl mx-auto bg-gray-200 dark:bg-gray-700 p-8 rounded-lg space-y-6 text-gray-800 dark:text-gray-100 shadow"
      >
<div className="flex flex-col sm:flex-row gap-4">
  {/* Customer Dropdown */}
  <div className="flex-1">
    <label htmlFor="customer" className="block text-xl font-semibold mb-2">
      Customer
    </label>
    <select
      id="customer"
      value={selectedCustomer?.id || ""}
      onChange={(e) =>
        setSelectedCustomer(
          customers.find((c) => c.id === Number(e.target.value)) || null
        )
      }
      required
      disabled={isEdit}
      className="text-lg mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-800"
    >
      <option value="">Select a customer</option>
      {customers.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  </div>

  {/* Sale Date */}
  <div className="flex-1">
    <label htmlFor="saleDate" className="block text-xl font-semibold mb-2">
      Sale Date
    </label>
    <input
      type="date"
      id="saleDate"
      value={saleDate}
      onChange={(e) => setSaleDate(e.target.value)}
      className="text-lg mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-800"
      required
      max={new Date().toISOString().split("T")[0]} // prevents future dates
    />
  </div>
</div>

        {/* Product Tiles with Pagination */}
        {selectedCustomer && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Select Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((p) => {
                const item = saleProducts.find((i) => i.productId === p.id);
                const qty = item ? item.quantity : 0;
                const price = item ? item.price : p.pricePerKilo;

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm p-5 flex flex-col justify-between"
                  >
                    <div className="mb-4">
                      <h4 className="text-xl font-bold">{p.name}</h4>
                      <div className="flex items-center gap-2">
                        <span>₱</span>
                        <span>{price.toFixed(2)}</span>
                        <span>/kg</span>
                      </div>
                    </div>

                    <div className="border-t my-3" />

                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => handleUpdateProduct(p, qty - 1, price)}>
                        <Minus className="w-4 h-4" />
                        <span className="sr-only">Decrease quantity for {p.name}</span>
                      </button>

                      <input
                        type="number"
                        step="1"
                        value={qty === 0 ? "" : qty}
                        onChange={(e) =>
                          handleUpdateProduct(
                            p,
                            e.target.value === "" ? 0 : parseFloat(e.target.value),
                            price
                          )
                        }
                        className="w-20 text-center border rounded-lg bg-white dark:bg-gray-900 py-2"
                        placeholder="0"
                      />
                      <button type="button" onClick={() => handleUpdateProduct(p, qty + 1, price)}>
                        <Plus className="w-4 h-4" />
                        <span className="sr-only">Increase quantity for {p.name}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-md ${
                      page === currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Table */}
        {saleProducts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Quantity</th>
                  <th className="p-2 text-left">Subtotal</th>
                  <th className="p-2 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {saleProducts.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">₱{item.price.toFixed(2)}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">₱{(item.price * item.quantity).toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(i)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="text-right mt-4 text-2xl font-semibold">
              Total: ₱{total.toFixed(2)}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!saleProducts.length}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isEdit ? "Update Sale" : "Save Sale"}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmationModal
          message={
            isEdit
              ? "Are you sure you want to update this sale?"
              : "Are you sure you want to save this new sale?"
          }
          confirmText={isEdit ? "Update" : "Save"}
          type="default"
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            try {
              await handleSubmit();
              setShowConfirm(false);
            } catch (err) {}
          }}
        />
      )}
    </>
  );
}
