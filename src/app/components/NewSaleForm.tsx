"use client";

import { useState, useEffect } from "react";

type SaleData = {
  customer: string;
  amount: number;
};

type NewSaleFormProps = {
  initialData?: SaleData; // optional for edit mode
  onRequestSave: (data: SaleData) => void;
  onCancel?: () => void; // optional for cancel button
};

export default function NewSaleForm({
  initialData,
  onRequestSave,
  onCancel,
}: NewSaleFormProps) {
  // Fully typed state
  const [customer, setCustomer] = useState<string>("");
  const [amount, setAmount] = useState<number | "">(""); // "" for empty input before converting

  useEffect(() => {
    if (initialData) {
      setCustomer(initialData.customer);
      setAmount(initialData.amount);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert amount to number safely
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      alert("Please enter a valid amount");
      return;
    }

    onRequestSave({ customer, amount: numericAmount });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow-md space-y-4"
    >
      <div>
        <label
          htmlFor="customer"
          className="block text-sm font-medium text-gray-700"
        >
          Customer
        </label>
        <input
          id="customer"
          type="text"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Enter customer name"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            setAmount(val === "" ? "" : Number(val));
          }}
          placeholder="Enter amount"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialData ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
}
