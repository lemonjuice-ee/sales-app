"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 🧾 Types
type Product = { id: number; name: string; capitalPerKilo: number };

type Sale = {
  id: number;
  customerId?: number;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  total: number;
  products: {
    id: number;
    saleId: number;
    productId: number;
    product: {
      id: number;
      name: string;
      capitalPerKilo: number;
    };
    quantity: number;
    price: number;
  }[];
};

export default function AnalyticsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("All");

  // ✅ Fetch sales data
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) throw new Error("Failed to fetch sales");
        const data = await res.json();
        setSales(data);
      } catch (err) {
        console.error("Failed to fetch sales:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  // 🧮 Filter by selected month
  const filteredSales = useMemo(() => {
    if (selectedMonth === "All") return sales;
    return sales.filter(
      (sale) => format(new Date(sale.createdAt), "MMM") === selectedMonth
    );
  }, [sales, selectedMonth]);

  // 🧮 Total Gross Sales
  const totalGrossSales = useMemo(
    () => filteredSales.reduce((sum, s) => sum + (s.total || 0), 0),
    [filteredSales]
  );

  // 🧮 Total Net Sales
  const totalNetSales = useMemo(() => {
    return filteredSales.reduce((sum, sale) => {
      const productNet = sale.products.reduce((acc, sp) => {
        const cost = sp.product?.capitalPerKilo ?? 0;
        return acc + (sp.price - cost) * sp.quantity;
      }, 0);
      return sum + productNet;
    }, 0);
  }, [filteredSales]);

  // 📊 Monthly Sales Data (Rolling 12 months)
  const monthlyData = useMemo(() => {
    if (sales.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthsRange = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - 6 + i, 1);
      return {
        key: format(date, "yyyy-MM"),
        label: format(date, "MMM yyyy"),
      };
    });

    const map = new Map<string, number>();
    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const key = format(saleDate, "yyyy-MM");
      map.set(key, (map.get(key) || 0) + (sale.total || 0));
    });

    return monthsRange.map(({ key, label }) => ({
      month: label,
      total: map.get(key) || 0,
    }));
  }, [sales]);

  // 🧮 Monthly Net Data
  const monthlyNetData = useMemo(() => {
    if (sales.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthsRange = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - 6 + i, 1);
      return {
        key: format(date, "yyyy-MM"),
        label: format(date, "MMM yyyy"),
      };
    });

    const map = new Map<string, number>();
    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const key = format(saleDate, "yyyy-MM");

      const netSale = sale.products.reduce((acc, sp) => {
        const cost = sp.product?.capitalPerKilo ?? 0;
        return acc + (sp.price - cost) * sp.quantity;
      }, 0);

      map.set(key, (map.get(key) || 0) + netSale);
    });

    return monthsRange.map(({ key, label }) => ({
      month: label,
      total: map.get(key) || 0,
    }));
  }, [sales]);

// 🧩 Accurate Same-Day Monthly Comparison
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const today = now.getDate();

// Get same day last month (ex: if Oct 11, then Sept 11)
const prevMonthDate = new Date(currentYear, currentMonth - 1, today);

// Compute gross and net totals up to today for current and previous months
const getSalesForPeriod = (year: number, month: number, dayLimit: number) => {
  const monthSales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return (
      saleDate.getFullYear() === year &&
      saleDate.getMonth() === month &&
      saleDate.getDate() <= dayLimit
    );
  });

  const gross = monthSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const net = monthSales.reduce((sum, sale) => {
    const netTotal = sale.products.reduce((acc, sp) => {
      const cost = sp.product?.capitalPerKilo ?? 0;
      return acc + (sp.price - cost) * sp.quantity;
    }, 0);
    return sum + netTotal;
  }, 0);

  return { gross, net };
};

// Compute for both months
const { gross: currentGross, net: currentNet } = getSalesForPeriod(currentYear, currentMonth, today);
const { gross: prevGross, net: prevNet } = getSalesForPeriod(currentYear, currentMonth - 1, today);

// Compute changes
const grossPesoChange = currentGross - prevGross;
const grossChange = prevGross !== 0 ? ((currentGross - prevGross) / prevGross) * 100 : 0;

const netPesoChange = currentNet - prevNet;
const netChange = prevNet !== 0 ? ((currentNet - prevNet) / prevNet) * 100 : 0;
const highestSale = filteredSales.reduce(
  (prev, current) => (current.total > prev.total ? current : prev),
  filteredSales[0] || { total: 0, customer: { name: "N/A" } }
);

const lowestSale = filteredSales.reduce(
  (prev, current) => (current.total < prev.total ? current : prev),
  filteredSales[0] || { total: 0, customer: { name: "N/A" } }
);



  const MONTHS = [
    "All",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Page Heading */}
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 ">
    Business Analytics
  </h1>

  {/* Month Filter */}
  <select
    aria-label="Filter by month"
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="rounded-md dark:bg-gray-800 dark:text-white px-2 py-2"
  >
    {MONTHS.map((month) => (
      <option key={month} value={month}>
        {month === "All" ? "All Months" : month}
      </option>
    ))}
  </select>
</div>

{/* 🏷️ Selected Scope Label */}
<p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
  {selectedMonth === "All"
    ? "Showing all time data    "
    : `Showing data for ${selectedMonth} ${new Date().getFullYear()}`}
</p>


      {/* 💰 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard title="Total Gross Sales" value={totalGrossSales} color="text-green-600" />
        <SummaryCard title="Total Net Sales" value={totalNetSales} color="text-green-600" />
          <SummaryCard
    title="Profit %"
    value={totalGrossSales ? ((totalNetSales / totalGrossSales) * 100).toFixed(1) + "%" : "0%"}
    color="text-yellow-600"
  />
      </div>

{/* 📊 Chart */}
<div className="grid grid-cols-1 gap-8 mt-8">
  <ChartContainer title="Monthly Sales Trend">
    <ResponsiveContainer width="100%" height={270}>
      <LineChart
        data={monthlyData}
        margin={{ top: 20, right: 30, left: 60, bottom: 20 }} // ← added left margin
      >
        <XAxis dataKey="month" />

        {/* Format Y-Axis with peso sign and commas */}
        <YAxis
          tickFormatter={(value) =>
            `₱${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          }
        />

        {/* Tooltip with peso sign */}
        <Tooltip
          formatter={(value: number) =>
            `₱${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          }
          labelFormatter={(label) => `Month: ${label}`}
        />

        <Line
          type="monotone"
          dataKey="total"
          stroke="#2563EB"
          strokeWidth={3}
          dot={(props) => {
            const { cx, cy, index, payload } = props;
            const currentMonth = format(now, "MMM yyyy");
            return (
              <circle
                key={`dot-${index}`}
                cx={cx}
                cy={cy}
                r={6}
                fill={payload.month === currentMonth ? "green" : "#2563EB"}
                stroke="#fff"
                strokeWidth={2}
              />
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
</div>


{/* 📈 Comparison Cards */}
<div className="border-t border-gray-500 my-6"></div>
<div className="text-gray-700 dark:text-gray-200 font-medium text-2xl">
  {format(now, "MMMM yyyy")} Stats
</div>

{/* Top Row: 3 Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
  <SummaryCard
    title={`Monthly Gross Sales`}
    value={currentGross}
    color="text-blue-600"
  />
  <SummaryCard
    title={`Monthly Net Sales`}
    value={currentNet}
    color="text-blue-600"
  />
  <SummaryCard
    title="Profit %"
    value={currentGross ? ((currentNet / currentGross) * 100).toFixed(1) + "%" : "0%"}
    color="text-yellow-600"
  />
</div>

{/* Bottom Row: 2 Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
  <SummaryCard
    title="Monthly Gross Change"
    value={`₱${grossPesoChange.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} (${grossChange.toFixed(1)}%)`}
    color={grossChange >= 0 ? "text-green-600" : "text-red-600"}
    icon={grossChange >= 0 ? <ArrowUp /> : <ArrowDown />}
    note={`Compared to last month (${format(new Date(now.getFullYear(), now.getMonth() - 1, 1), "MMMM yyyy")} 1 - ${now.getDate()})`}
  />

  <SummaryCard
    title="Monthly Net Change"
    value={`₱${netPesoChange.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} (${netChange.toFixed(1)}%)`}
    color={netChange >= 0 ? "text-green-600" : "text-red-600"}
    icon={netChange >= 0 ? <ArrowUp /> : <ArrowDown />}
    note={`Compared to last month (${format(new Date(now.getFullYear(), now.getMonth() - 1, 1), "MMMM yyyy")} 1 - ${now.getDate()})`}
  />
</div>
{/* 🏢 Business Summary */}
<div className="mt-2">
    <div className="border-t border-gray-500 my-6"></div>
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
  Business Summary
  <span className="text-sm font-light ml-2">
    {selectedMonth === "All"
      ? "Showing all time data  "
      : `Showing data for ${selectedMonth} ${new Date().getFullYear()}`}
  </span>
</h2>


  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

{/* Total Sales Count */}
<SummaryCard
  title="Total Sales"
  value={filteredSales.length.toString()} // convert to string to avoid peso sign
  note={`Avg per day: ${(
    filteredSales.length /
    (selectedMonth === "All"
      ? Math.max(1, Math.floor((new Date().getTime() - new Date(Math.min(...filteredSales.map(s => new Date(s.createdAt).getTime()))).getTime()) / (1000 * 60 * 60 * 24) + 1))
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate())
  ).toFixed(1)} sales`}
/>

<SummaryCard
  title="Average Sale Value"
  value={filteredSales.length > 0 ? totalGrossSales / filteredSales.length : 0}
  note={`Range: ${
    filteredSales.length > 0
      ? `${Math.min(...filteredSales.map(s => s.total)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${Math.max(...filteredSales.map(s => s.total)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "0.00"
  }`}
/>

<SummaryCard
  title="Profit per Sale Range"
  value={
    filteredSales.length > 0
      ? totalNetSales / filteredSales.length
      : 0
  }
  note={
    filteredSales.length > 0
      ? `Range: ₱${Math.min(...filteredSales.map(s =>
          s.products.reduce((acc, sp) => {
            const cost = sp.product?.capitalPerKilo ?? 0;
            return acc + (sp.price - cost) * sp.quantity;
          }, 0)
        )).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ₱${Math.max(...filteredSales.map(s =>
          s.products.reduce((acc, sp) => {
            const cost = sp.product?.capitalPerKilo ?? 0;
            return acc + (sp.price - cost) * sp.quantity;
          }, 0)
        )).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "No sales"
  }
/>


<SummaryCard
  title="Highest Sale"
  value={
    <span>
      ₱{highestSale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
      <span className="text-sm text-gray-500">— {highestSale.customer.name}</span>
    </span>
  }
note={`Lowest Sale: ₱${lowestSale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} — ${lowestSale.customer.name}`}
/>
  </div>
</div>
</div>
  );
}

// 🧩 Summary Card
function SummaryCard({
  title,
  value,
  color,
  icon,
  note,
}: {
  title: string;
  value: string | number | React.ReactNode; // ✅ allow JSX now
  color?: string;
  icon?: React.ReactNode;
  note?: string;
}) {
  // Only format number if value is a number
  const formatted =
    typeof value === "number"
      ? `₱${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : value;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</h3>
        {icon && <span>{icon}</span>}
      </div>
      <p className={`text-2xl font-semibold ${color}`}>{formatted}</p>
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  );
}



// 🧩 Chart Container
function ChartContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}
