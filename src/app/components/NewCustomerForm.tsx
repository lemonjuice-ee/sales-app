"use client";

import { useState, useEffect } from "react";

type Customer = { id: number; name: string; email: string };

type NewCustomerFormProps = {
  initialData?: Customer;
  onRequestSave: (data: { name: string; email: string }) => void;
  onCancel: () => void;
};

export default function NewCustomerForm({ initialData, onRequestSave, onCancel }: NewCustomerFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return alert("Name and email are required");
    onRequestSave({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-3 py-2 rounded-lg w-full"
      />
      <input
        type="email"
        placeholder="Customer Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-3 py-2 rounded-lg w-full"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Confirm
        </button>
      </div>
    </form>
  );
}
