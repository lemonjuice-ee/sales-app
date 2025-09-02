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

export default function NewProductForm({ initialData, onRequestSave, onCancel }: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [capitalPerKilo, setCapitalPerKilo] = useState<string>(
    initialData?.capitalPerKilo !== undefined ? initialData.capitalPerKilo.toString() : ""
  );

  useEffect(() => {
    setName(initialData?.name || "");
    setCapitalPerKilo(
      initialData?.capitalPerKilo !== undefined ? initialData.capitalPerKilo.toString() : ""
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block mb-1 font-medium">Product Name</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Capital per Kilo</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={capitalPerKilo}
          onChange={(e) => setCapitalPerKilo(e.target.value)}
          min={0}
          step={0.01}
          placeholder="Enter capital per kilo"
          required
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
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
          {initialData ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
