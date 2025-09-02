// app/api/sales/route.ts
import { prisma } from "@/lib/prisma";

// Type for line items
type LineItem = {
  productId: number;
  quantity: number;
  price: number;
};

function validateItems(items: any): items is LineItem[] {
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every(
      (p) =>
        p &&
        typeof p.productId === "number" &&
        typeof p.quantity === "number" &&
        typeof p.price === "number"
    )
  );
}

// ----------------- GET all sales -----------------
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        products: { include: { product: true } },
      },
    });

    return new Response(JSON.stringify(sales), { status: 200 });
  } catch (error) {
    console.error("GET /api/sales error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch sales" }), {
      status: 500,
    });
  }
}

// ----------------- CREATE a sale -----------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, products } = body;

    if (typeof customerId !== "number" || !validateItems(products)) {
      return new Response(
        JSON.stringify({
          error:
            "customerId (number) and products (non-empty array of { productId, quantity, price }) are required",
        }),
        { status: 400 }
      );
    }

    const total = products.reduce(
      (sum: number, p: LineItem) => sum + p.quantity * p.price,
      0
    );

    const sale = await prisma.sale.create({
      data: {
        customerId,
        total,
        products: {
          create: products.map((p: LineItem) => ({
            productId: p.productId,
            quantity: p.quantity,
            price: p.price,
          })),
        },
      },
      include: {
        customer: true,
        products: { include: { product: true } },
      },
    });

    return new Response(JSON.stringify(sale), { status: 201 });
  } catch (error) {
    console.error("POST /api/sales error:", error);
    return new Response(JSON.stringify({ error: "Failed to create sale" }), {
      status: 500,
    });
  }
}

// ----------------- UPDATE a sale -----------------
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, customerId, products } = body;

    if (typeof id !== "number") {
      return new Response(JSON.stringify({ error: "Sale id is required" }), {
        status: 400,
      });
    }

    const data: any = {};
    if (typeof customerId === "number") data.customerId = customerId;

    if (products && validateItems(products)) {
      const total = products.reduce(
        (sum: number, p: LineItem) => sum + p.quantity * p.price,
        0
      );
      data.total = total;

      data.products = {
        deleteMany: {}, // remove all existing line items
        create: products.map((p: LineItem) => ({
          productId: p.productId,
          quantity: p.quantity,
          price: p.price,
        })),
      };
    }

    const updated = await prisma.sale.update({
      where: { id },
      data,
      include: {
        customer: true,
        products: { include: { product: true } },
      },
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("PUT /api/sales error:", error);
    return new Response(JSON.stringify({ error: "Failed to update sale" }), {
      status: 500,
    });
  }
}

// ----------------- DELETE a sale -----------------
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return new Response(JSON.stringify({ error: "Sale id is required" }), {
        status: 400,
      });
    }

    // Remove child items first
    await prisma.sale.update({
      where: { id },
      data: { products: { deleteMany: {} } },
    });

    const deleted = await prisma.sale.delete({
      where: { id },
    });

    return new Response(JSON.stringify(deleted), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/sales error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete sale" }), {
      status: 500,
    });
  }
}
