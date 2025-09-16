"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PhilippinePeso, Users, Box, UserCheck, Eye, EyeClosed, Star, CalendarDays} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Calendar from "react-calendar";

// ✅ Safe Skeleton Component (renders span instead of div)
function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-pulse bg-muted rounded-md ${className}`}
    />
  );
}

export default function Dashboard() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    customers: 0,
    products: 0,
    totalSales: 0,
    users: 0,
    topCustomer: null,
  });
  const [loading, setLoading] = useState(true);

  // 👁️ Visibility toggle state
  const [showTotals, setShowTotals] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setSalesData(data.salesData);
        setCustomersData(data.customersData);
        setProductsData(data.productsData);

        // Find top customer based on segment with highest percentage/value
        const topSegment =
          data.customersData && data.customersData.length > 0
            ? data.customersData.reduce((a: any, b: any) =>
                a.value > b.value ? a : b
              )
            : null;

        setStats({
          ...data.stats,
          topCustomer: topSegment ? topSegment.name : "N/A",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayValue = (value: number) => {
    const formatted =
      "₱" +
      value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    return showTotals ? (
      formatted
    ) : (
      <span className="inline-block filter blur-sm select-none">
        {formatted}
      </span>
    );
  };

  return (
    <div className="p-6 mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* Top Section with Banner + Side Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Banner - 3/4 width */}
        <Card
          className="shadow-md rounded-2xl overflow-hidden bg-cover bg-center h-[420px] lg:col-span-9"
          style={{ backgroundImage: "url('/banner.png')" }}
        />

{/* Side Card - Full GIF with Hover Bubble */}
<div
  className="relative group lg:col-span-3 h-[420px] overflow-hidden rounded-2xl shadow-md"
>
  {/* GIF Background */}
  <Card
    className="shadow-md rounded-2xl overflow-hidden bg-cover bg-center h-full w-full"
    style={{ backgroundImage: "url('/goodluck.png')" }}
  />
</div>

      </div>

{/* Metric Cards */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 h-70">
  {/* Customers */}
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col">
    <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
      <Users className="h-8 w-8 text-blue-400" />
      <div>
        <p className="text-sm text-muted-foreground">Customers</p>
        <div className="text-2xl font-bold text-blue-400">
          {loading ? <Skeleton className="w-12 h-6 mx-auto" /> : stats.customers}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Products */}
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col">
    <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
      <Box className="h-8 w-8 text-orange-600" />
      <div>
        <p className="text-sm text-muted-foreground">Products</p>
        <div className="text-2xl font-bold text-orange-600">
          {loading ? <Skeleton className="w-12 h-6 mx-auto" /> : stats.products}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Total Sales with Toggle */}
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col relative">
    <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
      <PhilippinePeso className="h-8 w-8 text-green-400" />
      <div>
        <p className="text-sm text-muted-foreground">Total Sales</p>
        <div className="text-2xl font-bold text-green-400">
          {loading ? <Skeleton className="w-20 h-6 mx-auto" /> : displayValue(stats.totalSales ?? 0)}
        </div>
      </div>
    </CardContent>

    {/* Toggle button */}
    <button
      onClick={() => setShowTotals((prev) => !prev)}
      className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      aria-label={showTotals ? "Hide totals" : "Show totals"}
    >
      {showTotals ? <Eye size={20} /> : <EyeClosed size={20} />}
    </button>
  </Card>

  {/* Current Month Sales */}
<Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col">
  <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
    <CalendarDays className="h-8 w-8 text-purple-600" />
    <div>
      <p className="text-sm text-muted-foreground">
        {new Date().toLocaleString("default", { month: "long" })} Sales
      </p>
      <div className="text-2xl font-bold text-purple-600">
        {loading ? (
          <Skeleton className="w-20 h-6 mx-auto" />
        ) : (
          "₱" +
          (
            salesData.find(
              (s) =>
                s.month ===
                new Date().toLocaleString("default", { month: "short" })
            )?.sales ?? 0
          ).toLocaleString()
        )}
      </div>
    </div>
  </CardContent>
</Card>

  {/* Best-Selling Product */}
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col">
    <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
      <Star className="h-8 w-8 text-yellow-600" />
      <div>
        <p className="text-sm text-muted-foreground">Best Seller</p>
        <div className="text-2xl font-bold text-yellow-600">
          {loading ? (
            <Skeleton className="w-16 h-6 mx-auto" />
          ) : productsData.length > 0 ? (
            productsData.reduce((a, b) => (a.sales > b.sales ? a : b)).name
          ) : (
            "N/A"
          )}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Top Customer */}
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col">
    <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
      <UserCheck className="h-8 w-8 text-pink-500" />
      <div>
        <p className="text-sm text-muted-foreground">Top Customer</p>
        <div className="text-2xl font-bold text-pink-500">
          {loading ? <Skeleton className="w-16 h-6 mx-auto" /> : stats.topCustomer ?? "N/A"}
        </div>
      </div>
    </CardContent>
  </Card>
</div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Over Time */}
        <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
          <CardContent className="p-6 flex flex-col h-[350px]">
            <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
            <div className="flex-1">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip
  formatter={(value: number) => 
    `₱${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }
/>
<Line
  type="monotone"
  dataKey="sales"
  className="stroke-blue-400 dark:stroke-blue-500"
  strokeWidth={3}
/>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

{/* Customer Segments */}
<Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
  <CardContent className="p-6 flex flex-col h-[350px]">
    <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
    <div className="flex-1 flex justify-center items-center">
      {loading ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
<Pie
  data={customersData}
  cx="45%" // keep pie on the left
  cy="50%"
  outerRadius="70%"
  dataKey="value"
  label={({ percent }) =>
    percent !== undefined && percent >= 0.1
      ? `${(percent * 100).toFixed(1)}%`
      : ""
  }
  labelLine={false} // 🚫 hide the line for labels
>
  {customersData.map((entry, index) => {
    const hue = (index * 137.508) % 360; // golden angle
    return (
      <Cell
        key={`cell-${index}`}
        fill={`hsl(${hue}, 70%, 50%)`}
      />
    );
  })}
</Pie>

            {/* Custom Legend: 2 columns, 10 per column */}
            <Legend
  layout="vertical"
  align="right"
  verticalAlign="middle"
  content={({ payload }) => {
    if (!payload) return null;

    // Type cast so TS knows percent exists
    const sortedPayload = [...payload].sort(
      (a, b) =>
        ((b.payload as any)?.percent ?? 0) -
        ((a.payload as any)?.percent ?? 0)
    );

    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {sortedPayload.slice(0, 20).map((entry, index) => (
          <div
            key={`legend-item-${index}`}
            className="flex items-center text-sm"
          >
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            {entry.value}
          </div>
        ))}
      </div>
    );
  }}
/>
            <Tooltip
              formatter={(value: number) => [
                `₱${value.toLocaleString()}`,
                "Sales",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  </CardContent>
</Card>


        {/* Product Sales */}
        <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
          <CardContent className="p-6 flex flex-col h-[350px]">
            <h3 className="text-lg font-semibold mb-4">Product Sales</h3>
            <div className="flex-1">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productsData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip
                      formatter={(value: number) => [
                        `₱${value.toLocaleString()}`,
                        "Sales",
                      ]}
                    />
                    <Bar
                      dataKey="sales"
                      className="fill-blue-400 dark:fill-blue-500"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
