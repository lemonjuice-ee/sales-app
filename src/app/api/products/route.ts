import { prisma } from "@/lib/prisma";

// GET all products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), { status: 500 });
  }
}

// CREATE a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || body.capitalPerKilo === undefined) {
      return new Response(JSON.stringify({ error: "Missing product name or capitalPerKilo" }), { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        capitalPerKilo: Number(body.capitalPerKilo),
      },
    });

    return new Response(JSON.stringify(product), { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return new Response(JSON.stringify({ error: "Failed to create product" }), { status: 500 });
  }
}

// UPDATE an existing product
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name || body.capitalPerKilo === undefined) {
      return new Response(JSON.stringify({ error: "Missing product id, name, or capitalPerKilo" }), { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name,
        capitalPerKilo: Number(body.capitalPerKilo),
      },
    });

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    console.error("PUT /api/products error:", error);
    return new Response(JSON.stringify({ error: "Failed to update product" }), { status: 500 });
  }
}

// DELETE a product safely
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return new Response(JSON.stringify({ error: "Missing product id" }), { status: 400 });
    }

    const productId = Number(body.id);
    console.log("Attempting to delete product id:", productId);

    // Optional: delete related records first (if any)
    await prisma.saleProduct.deleteMany({ where: { productId } });
    await prisma.customerProduct.deleteMany({ where: { productId } });

    // Delete product
    await prisma.product.delete({ where: { id: productId } });

    return new Response(JSON.stringify({ message: "Product deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete product" }), { status: 500 });
  }
}
