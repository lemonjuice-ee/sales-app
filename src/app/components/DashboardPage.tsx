"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PhilippinePeso, Users, Box, UserCheck, Eye, EyeClosed, Star, CalendarDays, Clipboard} from "lucide-react";
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
type Sale = {
  customer: { name: string };
  total: number;
  products: { product: { name: string }; quantity: number; price: number }[];
};

export default function Dashboard() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [allSales, setAllSales] = useState<any[]>([]); // raw sales
const [monthlySales, setMonthlySales] = useState<any[]>([]); // aggregated for chart

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
  async function fetchStats() {
    try {
      setLoading(true);

      const [salesRes, customersRes, productsRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/customers"),
        fetch("/api/products"),
      ]);

      const sales = await salesRes.json();
      const customers = await customersRes.json();
      const products = await productsRes.json();

      // Total Gross Sales
      const totalSales = sales.reduce((sum: number, sale: any) => sum + (sale.total ?? 0), 0);

      // Total Net Sales
      const totalNetSales = sales.reduce((sum: number, sale: any) => {
        const net = sale.products?.reduce((acc: number, sp: any) => {
          const cost = sp.product?.capitalPerKilo ?? 0;
          return acc + (sp.price - cost) * sp.quantity;
        }, 0) ?? 0;
        return sum + net;
      }, 0);

      const profitPercentage = totalSales > 0 ? (totalNetSales / totalSales) * 100 : 0;

      // Top Customer
      const customersMap: Record<string, number> = {};
      sales.forEach((sale: any) => {
        const name = sale.customer?.name ?? "N/A";
        customersMap[name] = (customersMap[name] || 0) + (sale.total ?? 0);
      });
      const topCustomer = Object.entries(customersMap)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

      // Customer Segments for PieChart
      const customerSegments = Object.entries(customersMap).map(([name, value]) => ({ name, value }));

      // Set state
      setStats({
        customers: customers.length, // total customers
        products: products.length,   // total products
        totalSales,
        totalNetSales,
        profitPercentage,
        topCustomer,
      });

      setAllSales(sales);
      setCustomersData(customerSegments);

      // Monthly Sales
      const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const monthlyMap: Record<string, number> = {};
      sales.forEach((sale: any) => {
        const month = new Date(sale.createdAt).toLocaleString("default",{month:"short"});
        monthlyMap[month] = (monthlyMap[month] || 0) + (sale.total ?? 0);
      });
      setMonthlySales(monthOrder.map(m => ({ month: m, sales: monthlyMap[m] ?? 0 })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  fetchStats();
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
  const messages = [
  "Hello there!",
  "Catch me if you can!",
  "Swim swim swim",
  "I'm hungry!",
  "Feeling bubbly!",
];
  const [bubbleMessage, setBubbleMessage] = useState(messages[0]);

  const handleMouseEnter = () => {
    // Pick a random message
    const randomMsg =
      messages[Math.floor(Math.random() * messages.length)];
    setBubbleMessage(randomMsg);
  };

  return (
    <div className="p-6 mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

     {/* Top Section with 2x2 + GIF */}
<div className="grid grid-cols-3 grid-rows-2 gap-6">

  {/* Total Gross Sales */}
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col relative">
    <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
      <div>
        <p className="text-sm text-muted-foreground">Total Gross Sales</p>
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

{/* Total Net Sales */}
<Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col relative">
  <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
    <div>
      <p className="text-sm text-muted-foreground">Total Net Sales</p>
      <div className="text-2xl font-bold text-green-400">
        {loading ? (
          <Skeleton className="w-20 h-6 mx-auto" />
        ) : (
          displayValue(stats.totalNetSales ?? 0)
        )}
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


  {/* GIF spanning 2 rows */}
  <div
    className="relative row-span-2 h-full overflow-hidden rounded-2xl shadow-md"
    onMouseEnter={handleMouseEnter}
  >
    <Card
      className="shadow-md rounded-2xl overflow-hidden bg-cover bg-center h-full w-full"
      style={{ backgroundImage: "url('/fishgif.gif')" }}
    />

    {/* Hover Bubble */}
    <div className="absolute top-4 left-1/2 transform -translate-x-[90%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      <div className="relative bg-white text-black px-4 py-2 rounded-2xl max-w-xs text-center shadow-md border-2 border-black">
        {bubbleMessage}
        <div className="absolute -bottom-2 left-1/3 w-3 h-3 bg-white border-2 border-black rounded-full"></div>
        <div className="absolute -bottom-5 left-2/5 w-2.5 h-2.5 bg-white border-2 border-black rounded-full"></div>
        <div className="absolute -bottom-7 left-1/2 w-2 h-2 bg-white border-2 border-black rounded-full"></div>
      </div>
    </div>
  </div>

{/* Profit % */}
<Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col relative">
  <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
    <div>
      <p className="text-sm text-muted-foreground">Profit %</p>
      <div className="text-2xl font-bold text-green-400">
        {loading ? (
          <Skeleton className="w-12 h-6 mx-auto" />
        ) : (
          `${(stats.profitPercentage ?? 0).toFixed(1)}%`
        )}
      </div>
    </div>
  </CardContent>
</Card>

  {/* Total Transactions */}
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col col-span-1">
    <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
      <div>
        <p className="text-sm text-muted-foreground">Total Transactions</p>
        <div className="text-2xl font-bold text-green-400">
          {loading ? <Skeleton className="w-12 h-6 mx-auto" /> : allSales.length}
        </div>
      </div>
    </CardContent>
  </Card>
</div>


{/* Metric Cards */}
<div className="grid grid-cols-5 gap-6">
  {/* Customers */}
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col col-span-1">
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
  <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col col-span-1">
    <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
      <Box className="h-8 w-8 text-blue-400" />
      <div>
        <p className="text-sm text-muted-foreground">Products</p>
        <div className="text-2xl font-bold text-blue-400">
          {loading ? <Skeleton className="w-12 h-6 mx-auto" /> : stats.products}
        </div>
      </div>
    </CardContent>
  </Card>

<Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col col-span-1">
  <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
    <Clipboard className="h-8 w-8 text-blue-400" />
    <div>
      <p className="text-sm text-muted-foreground">Top Customer</p>
      <div className="text-2xl font-bold text-blue-400">
        {loading ? (
          <Skeleton className="w-32 h-6 mx-auto" />
        ) : (() => {
          if (!allSales || allSales.length === 0) return "-";

          // Compute total spent per customer
          const customerMap: Record<string, { total: number; sales: Sale[] }> = {};
          allSales.forEach((sale: Sale) => {
            const custName = sale.customer.name;
            const saleTotal = sale.total || 0;
            if (!customerMap[custName]) {
              customerMap[custName] = { total: 0, sales: [] };
            }
            customerMap[custName].total += saleTotal;
            customerMap[custName].sales.push(sale);
          });

          // Find top customer
          const topCustomer = Object.entries(customerMap).reduce(
            (max, [name, data]) =>
              data.total > max.total ? { name, total: data.total, sales: data.sales } : max,
            { name: "", total: 0, sales: [] as Sale[] }
          );

          if (!topCustomer.name) return "-";

          // Find top product for this customer
          const productMap: Record<string, number> = {};
          topCustomer.sales.forEach((sale) => {
            sale.products.forEach((p) => {
              const prodName = p.product.name;
              const totalSale = p.price * p.quantity;
              productMap[prodName] = (productMap[prodName] || 0) + totalSale;
            });
          });

          const topProduct = Object.entries(productMap).reduce(
            (max, [name, total]) => (total > max.total ? { name, total } : max),
            { name: "", total: 0 }
          );

          return (
            <div>
              <span>{topCustomer.name}</span>
              {topProduct.name && (
                <p className="text-sm text-gray-500 mt-1">{topProduct.name}</p>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  </CardContent>
</Card>



  {/* Current Month Gross & Net (take 2/5 of row) */}
  <div className="col-span-2 flex flex-col gap-6 h-full">
{/* Gross */}
<Card className="flex-1 shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col">
  <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
    <p className="text-sm text-muted-foreground">
      {new Date().toLocaleString("default", { month: "long" })} Gross Sales
    </p>
    {loading ? (
      <Skeleton className="w-32 h-10 mx-auto" />
    ) : (() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const thisMonthSales = allSales.filter((sale: any) => {
        const date = new Date(sale.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      const grossSales = thisMonthSales.reduce(
        (sum: number, sale: any) => sum + (sale.total ?? 0),
        0
      );
      return (
        <span className="text-2xl font-bold text-blue-600">
          ₱{grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    })()}
  </CardContent>
</Card>

{/* Net */}
<Card className="flex-1 shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground flex flex-col">
  <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2 flex-1">
    <p className="text-sm text-muted-foreground">
      {new Date().toLocaleString("default", { month: "long" })} Net Sales
    </p>
    {loading ? (
      <Skeleton className="w-32 h-10 mx-auto" />
    ) : (() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const thisMonthSales = allSales.filter((sale: any) => {
        const date = new Date(sale.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      const netSales = thisMonthSales.reduce((sum: number, sale: any) => {
        const profit = sale.products?.reduce((acc: number, sp: any) => {
          const cost = sp.product?.capitalPerKilo ?? 0;
          return acc + (sp.price - cost) * sp.quantity;
        }, 0) ?? 0;
        return sum + profit;
      }, 0);
      return (
        <span className="text-2xl font-bold text-blue-600">
          ₱{netSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    })()}
  </CardContent>
</Card>

  </div>
</div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time */}
        <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
          <CardContent className="p-6 flex flex-col h-[350px]">
            <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
            <div className="flex-1">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
<LineChart data={monthlySales} 
    margin={{ top: 20, right: 30, left: 60, bottom: 20 }} // ensures Y-axis isn't cut off
  >
    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
    <YAxis
      stroke="var(--muted-foreground)"
      tickFormatter={(value) =>
        `₱${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      }
    />
    <Tooltip
      formatter={(value: number) =>
        `₱${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      }
    />
    <Line
      type="monotone"
      dataKey="sales"
      className="stroke-blue-400 dark:stroke-blue-500"
      strokeWidth={3}
      dot={{ r: 5 }}
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
    <h3 className="text-lg font-semibold mb-1">Customer Segments</h3>
    {/* Note */}
    <p className="text-xs text-muted-foreground mb-4">
      Showing top 10 customers only
    </p>
    <div className="flex-1 flex justify-center items-center">
      {loading ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={customersData
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)}
              cx="45%"
              cy="50%"
              outerRadius="70%"
              dataKey="value"
              label={({ percent }) =>
                percent !== undefined && percent >= 0.1
                  ? `${(percent * 100).toFixed(1)}%`
                  : ""
              }
              labelLine={false}
            >
              {customersData
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)
                .map((entry, index) => {
                  const hue = (index * 137.508) % 360;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${hue}, 70%, 50%)`}
                    />
                  );
                })}
            </Pie>

            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              content={({ payload }) => {
                if (!payload) return null;

                const sortedPayload = [...payload].sort(
                  (a, b) =>
                    ((b.payload as any)?.percent ?? 0) -
                    ((a.payload as any)?.percent ?? 0)
                );

                return (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {sortedPayload.slice(0, 10).map((entry, index) => (
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


{/* Product Sales 
<Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
  <CardContent className="p-6 flex flex-col h-[350px]">
    <h3 className="text-lg font-semibold mb-4">Product Sales</h3>
    <div className="flex-1">
      {loading ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
  data={checkedProductsData} 
  barCategoryGap="20%"
  margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
>
  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
  <XAxis dataKey="name" stroke="var(--muted-foreground)" />
  <YAxis
    type="number"
    allowDecimals={true}
    stroke="var(--muted-foreground)"
    tickFormatter={(value) =>
      `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    width={100}
    domain={[0, 'dataMax + 5000']}
  />
  <Tooltip
    formatter={(value: number) => [
      `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
*/}
      </div>
    </div>
  );
}
