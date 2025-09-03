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
};

type SaleProduct = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

type SaleData = {
  id?: number; // support editing
  customerId: number;
  products: SaleProduct[];
  total: number;
};

type NewSaleFormProps = {
  initialData?: SaleData; // when editing
  onSaved: () => void; // called after save
  onCancel?: () => void;
};

export default function NewSaleForm({
  initialData,
  onSaved,
  onCancel,
}: NewSaleFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [showConfirm, setShowConfirm] = useState(false); // ✅ control modal

  // Prefill for editing
  useEffect(() => {
    if (initialData) {
      setSaleProducts(initialData.products);
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
          const cust = data.find(
            (c: Customer) => c.id === initialData.customerId
          );
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
        const data = await res.json();
        setProducts(data);
      }
    }
    fetchProducts();
  }, [selectedCustomer]);

  // Update/add product quantity
  const handleUpdateProduct = (product: Product, newQty: number) => {
    setSaleProducts((prev) => {
      if (newQty <= 0) {
        return prev.filter((i) => i.productId !== product.id);
      }
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQty } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.pricePerKilo,
          quantity: newQty,
        },
      ];
    });
  };

  // Remove product
  const handleRemoveProduct = (index: number) => {
    setSaleProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const total = saleProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Submit to API
  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    // Shape products properly for API (exclude name)
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
    };

    const res = await fetch("/api/sales", {
      method: initialData ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSaved();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save sale");
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirm(true); // ✅ show modal before saving
        }}
        className="w-full max-w-7xl mx-auto bg-gray-200 dark:bg-gray-700 p-8 rounded-lg space-y-6 text-gray-800 dark:text-gray-100 shadow"
      >
        {/* Customer Dropdown */}
        <div>
          <label
            htmlFor="customer"
            className="block text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2"
          >
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
            disabled={!!initialData} // lock customer when editing
            className="text-lg mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Tiles */}
        {selectedCustomer && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Select Products
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const item = saleProducts.find((i) => i.productId === p.id);
                const qty = item ? item.quantity : 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                  >
                    {/* Product Info */}
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {p.name}
                      </h4>
                      <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                        ₱{p.pricePerKilo}/kg
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        aria-label={`Decrease quantity for ${p.name}`}
                        onClick={() =>
                          handleUpdateProduct(p, Math.max(qty - 1, 0))
                        }
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        id={`qty-${p.id}`}
                        type="number"
                        value={qty === 0 ? "" : qty}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleUpdateProduct(
                            p,
                            value === "" ? 0 : Number(value)
                          );
                        }}
                        className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 py-2"
                        placeholder="0"
                      />

                      <button
                        type="button"
                        aria-label={`Increase quantity for ${p.name}`}
                        onClick={() => handleUpdateProduct(p, qty + 1)}
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Products Table */}
        {saleProducts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left bg-gray-900">Product</th>
                  <th className="p-2 text-left bg-gray-900">Price</th>
                  <th className="p-2 text-left bg-gray-900">Quantity</th>
                  <th className="p-2 text-left bg-gray-900">Subtotal</th>
                  <th className="p-2 bg-gray-900 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {saleProducts.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">₱{item.price}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </td>
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
            {initialData ? "Update Sale" : "Save Sale"}
          </button>
        </div>
      </form>

      {/* ✅ Confirmation Modal */}
      {showConfirm && (
        <ConfirmationModal
          message={
            initialData
              ? "Are you sure you want to update this sale?"
              : "Are you sure you want to save this new sale?"
          }
          confirmText={initialData ? "Update" : "Save"}
          type="default"
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            setShowConfirm(false);
            await handleSubmit();
          }}
        />
      )}
    </>
  );
}
