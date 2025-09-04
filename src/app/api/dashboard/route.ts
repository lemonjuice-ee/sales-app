// app/api/dashboard/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Count customers, products, and users
  const customersCount = await prisma.customer.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Total sales
  const totalSalesAgg = await prisma.sale.aggregate({
    _sum: { total: true },
  });
  const totalSales = totalSalesAgg._sum.total ?? 0;

  // Sales over time (group by month)
  const salesByMonth = await prisma.sale.findMany({
    select: { createdAt: true, total: true },
  });

  const salesDataMap: Record<string, number> = {};
  salesByMonth.forEach((s) => {
    const month = new Date(s.createdAt).toLocaleString("default", {
      month: "short",
    });
    salesDataMap[month] = (salesDataMap[month] || 0) + s.total;
  });

  const salesData = Object.entries(salesDataMap).map(([month, sales]) => ({
    month,
    sales,
  }));

  // Customer sales share (% of total sales)
  const customerSales = await prisma.sale.groupBy({
    by: ["customerId"],
    _sum: { total: true },
  });

  const customers = await prisma.customer.findMany({
    select: { id: true, name: true },
  });

  const customersData = customerSales.map((cs) => {
    const customer = customers.find((c) => c.id === cs.customerId);
    return {
      name: customer?.name || `Customer ${cs.customerId}`,
      value: totalSales > 0 ? (cs._sum.total ?? 0) : 0,
    };
  });

  // Product sales (total sales value per product, not quantity)
  const productSales = await prisma.saleProduct.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
      price: true,
    },
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true },
  });

  const productsData = productSales.map((ps) => {
    const product = products.find((p) => p.id === ps.productId);
    return {
      name: product?.name || `Product ${ps.productId}`,
      sales: (ps._sum.quantity ?? 0) * (ps._sum.price ?? 0),
    };
  });

  return NextResponse.json({
    stats: {
      customers: customersCount,
      products: productsCount,
      totalSales,
      users: usersCount,
    },
    salesData,
    customersData,
    productsData,
  });
}
