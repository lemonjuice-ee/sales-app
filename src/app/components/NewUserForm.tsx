"use client";
import { useState } from "react";

type Props = {
  initialData?: { name: string; email: string };
  onRequestSave: (data: { name: string; email: string }) => void;
  onCancel: () => void;
};

export default function NewUserForm({ initialData, onRequestSave, onCancel }: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onRequestSave({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </form>
  );
}
