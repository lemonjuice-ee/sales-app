"use client";

type TotalSalesProps = {
  sales?: { amount: number }[]; // make optional to be safe
};

export default function TotalSales({ sales = [] }: TotalSalesProps) {
  // Compute total amount safely
  const total = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between mb-6 mx-4 my-6">
      <div>
        <h2 className="text-lg font-medium text-gray-600">Total Sales</h2>
        <p className="text-2xl font-bold text-gray-800">
          ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className="text-green-600 text-3xl font-bold">
        ₱
      </div>
    </div>
  );
}
