"use client";

type TotalSalesProps = {
  sales?: { amount: number }[]; // make optional to be safe
};

export default function TotalSales({ sales = [] }: TotalSalesProps) {
  // Compute total amount safely
  const total = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 flex items-center justify-between mb-6 mx-6 my-6">
      <div>
        <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300">
          Total Sales
        </h2>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          ₱{total.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="text-green-600 dark:text-green-400 text-3xl font-bold">
        ₱
      </div>
    </div>
  );
}
