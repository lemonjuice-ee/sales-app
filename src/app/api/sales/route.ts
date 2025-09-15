// app/api/sales/route.ts
import { prisma } from "@/lib/prisma";

// GET all sales (with customer + products + product details)
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(sales), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch sales" }),
      { status: 500 }
    );
  }
}

// CREATE a new sale
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, products, total, createdAt } = body;

    if (!customerId || !products || products.length === 0 || total === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const sale = await prisma.sale.create({
      data: {
        customerId,
        total,
        createdAt: createdAt ? new Date(createdAt) : undefined, // 👈 allow overriding createdAt
        products: {
          create: products.map((p: any) => ({
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
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to create sale" }),
      { status: 500 }
    );
  }
}

// UPDATE an existing sale
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, customerId, products, total, createdAt } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Missing sale id" }),
        { status: 400 }
      );
    }

    // Update basic sale info
    await prisma.sale.update({
      where: { id },
      data: {
        customerId: customerId || undefined,
        total: total || undefined,
        createdAt: createdAt ? new Date(createdAt) : undefined, // 👈 allow updating createdAt
      },
    });

    // If products are provided, replace existing ones
    if (products && products.length > 0) {
      await prisma.saleProduct.deleteMany({ where: { saleId: id } });
      await prisma.saleProduct.createMany({
        data: products.map((p: any) => ({
          saleId: id,
          productId: p.productId,
          quantity: p.quantity,
          price: p.price,
        })),
      });
    }

    // Return updated sale with full details
    const updatedSale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        products: { include: { product: true } },
      },
    });

    return new Response(JSON.stringify(updatedSale), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to update sale" }),
      { status: 500 }
    );
  }
}

// DELETE a sale
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Missing sale id" }),
        { status: 400 }
      );
    }

    // Delete related sale products first
    await prisma.saleProduct.deleteMany({ where: { saleId: id } });

    await prisma.sale.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Sale deleted" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to delete sale" }),
      { status: 500 }
    );
  }
}
