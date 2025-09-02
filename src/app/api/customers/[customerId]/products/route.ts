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
    const products = await prisma.product.findMany({
      include: {
        productPrices: {
          where: { customerId: customerIdNum },
          select: { pricePerKilo: true },
        },
      },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      capitalPerKilo: p.capitalPerKilo,
      pricePerKilo: p.productPrices[0]?.pricePerKilo ?? p.capitalPerKilo,
    }));

    return NextResponse.json(formatted); // ✅ always an array
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
