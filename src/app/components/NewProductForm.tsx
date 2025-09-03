"use client";

import { useState, useEffect } from "react";

type Product = {
  id?: number;
  name: string;
  capitalPerKilo: number;
};

type Props = {
  initialData?: Product;
  onRequestSave: (data: Product) => void;
  onCancel: () => void;
};

export default function NewProductForm({
  initialData,
  onRequestSave,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [capitalPerKilo, setCapitalPerKilo] = useState<string>(
    initialData?.capitalPerKilo !== undefined
      ? initialData.capitalPerKilo.toString()
      : ""
  );

  useEffect(() => {
    setName(initialData?.name || "");
    setCapitalPerKilo(
      initialData?.capitalPerKilo !== undefined
        ? initialData.capitalPerKilo.toString()
        : ""
    );
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const capital = parseFloat(capitalPerKilo);
    if (!name || isNaN(capital) || capital <= 0) {
      return alert("Please provide valid product name and capital per kilo.");
    }

    onRequestSave({
      id: initialData?.id,
      name,
      capitalPerKilo: capital,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-4 text-gray-900 dark:text-gray-100"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Product Name
        </label>
        <input
          id="name"
          type="text"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                     placeholder-gray-400 dark:placeholder-gray-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <label
          htmlFor="capitalPerKilo"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Capital per Kilo
        </label>
        <input
          id="capitalPerKilo"
          type="number"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                     placeholder-gray-400 dark:placeholder-gray-500"
          value={capitalPerKilo}
          onChange={(e) => setCapitalPerKilo(e.target.value)}
          min={0}
          step={0.01}
          placeholder="Enter capital per kilo"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 
                     rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {initialData ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
