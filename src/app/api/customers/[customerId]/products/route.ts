import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customers/:customerId/products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const customerIdNum = parseInt(customerId, 10);

  if (isNaN(customerIdNum)) {
    return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
  }

  try {
    // Fetch products along with customer-specific prices
    const products = await prisma.product.findMany({
      include: {
        productPrices: {
          where: { customerId: customerIdNum },
          select: { pricePerKilo: true },
        },
      },
    });

    // Fetch past sales count per product for this customer
    const salesData = await prisma.saleProduct.groupBy({
      by: ["productId"],
      where: {
        sale: { customerId: customerIdNum },
      },
      _sum: { quantity: true },
    });

    const salesMap = new Map<number, number>();
    salesData.forEach((s) => salesMap.set(s.productId, s._sum.quantity || 0));

    // Map products with price and total purchased
    const formatted = products
      .map((p) => ({
        id: p.id,
        name: p.name,
        capitalPerKilo: p.capitalPerKilo,
        pricePerKilo: p.productPrices[0]?.pricePerKilo ?? p.capitalPerKilo,
        totalPurchased: salesMap.get(p.id) || 0,
      }))
      .sort((a, b) => b.totalPurchased - a.totalPurchased); // sort by past sales descending

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// PUT /api/customers/:customerId/products
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const customerIdNum = parseInt(customerId, 10);

  if (isNaN(customerIdNum)) {
    return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
  }

  try {
    const body = await request.json(); // Expected format: { [productId]: pricePerKilo, ... }

    const updates = await Promise.all(
      Object.entries(body).map(async ([productIdStr, price]) => {
        const productId = parseInt(productIdStr, 10);
        const pricePerKilo = parseFloat(price as any);

        if (isNaN(productId) || isNaN(pricePerKilo)) return null;

        return prisma.customerProduct.upsert({
          where: { customerId_productId: { customerId: customerIdNum, productId } },
          update: { pricePerKilo },
          create: { customerId: customerIdNum, productId, pricePerKilo },
        });
      })
    );

    return NextResponse.json({ message: "Prices updated successfully!", updates });
  } catch (error) {
    console.error("Failed to update customer prices:", error);
    return NextResponse.json({ error: "Failed to update prices" }, { status: 500 });
  }
}
