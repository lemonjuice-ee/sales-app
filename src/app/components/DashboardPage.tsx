"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, Box, UserCog } from "lucide-react";
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

export default function Dashboard() {
  const salesData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 4780 },
    { month: "May", sales: 5890 },
    { month: "Jun", sales: 4390 },
    { month: "Jul", sales: 6490 },
  ];

  const customersData = [
    { name: "New", value: 400 },
    { name: "Returning", value: 300 },
    { name: "Churned", value: 100 },
  ];
  const COLORS = ["#34d399", "#60a5fa", "#f87171"];

  const productsData = [
    { name: "Rice", stock: 120 },
    { name: "Sugar", stock: 98 },
    { name: "Corn", stock: 86 },
    { name: "Wheat", stock: 99 },
  ];

  return (
    <div className="p-6 mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* Top Section with Banner + Side Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Banner - 3/4 width */}
        <Card
          className="shadow-md rounded-2xl overflow-hidden bg-cover bg-center h-[400px] lg:col-span-9"
          style={{ backgroundImage: "url('/banner.png')" }}
        />

        {/* Side Card - 1/4 width */}
<Card className="bg-card dark:bg-gray-800 text-card-foreground shadow-md rounded-2xl h-[400px] lg:col-span-3">
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-4 h-full">
            <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
            <p className="text-sm text-muted-foreground">
              This could show alerts, tips, or summaries.
            </p>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground">
                Orders Today: <b className="text-foreground">25</b>
              </span>
              <span className="text-sm text-muted-foreground">
                Pending: <b className="text-foreground">5</b>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Customers */}
        <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Customers</p>
              <p className="text-2xl font-bold text-primary">350</p>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <Box className="h-8 w-8 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="text-2xl font-bold text-accent">42</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Sales */}
        <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-primary">₱120,000</p>
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <UserCog className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-2xl font-bold text-destructive">8</p>
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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              color: "var(--popover-foreground)",
            }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            className="stroke-blue-400 dark:stroke-blue-500"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>

{/* Customer Segments */}
<Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
  <CardContent className="p-6 flex flex-col h-[350px]">
    <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
    <div className="flex-1 flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={customersData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="70%" // scales dynamically
            dataKey="value"
            label
          >
            {customersData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              color: "var(--popover-foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>


{/* Product Inventory */}
<Card className="shadow-md rounded-2xl bg-card dark:bg-gray-800 text-card-foreground">
  <CardContent className="p-6 flex flex-col h-[350px]">
    <h3 className="text-lg font-semibold mb-4">Product Inventory</h3>
    <div className="flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={productsData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              color: "var(--popover-foreground)",
            }}
          />
          <Bar
            dataKey="stock"
            className="fill-blue-400 dark:fill-blue-500" 
            radius={[6, 6, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
      </div>
    </div>
  );
}
