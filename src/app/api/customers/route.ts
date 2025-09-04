// app/api/customers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany();
    return NextResponse.json(customers);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

// CREATE a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Missing name or email" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}

// UPDATE an existing customer
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !body.name || !body.email) {
      return NextResponse.json({ error: "Missing id, name, or email" }, { status: 400 });
    }

    const customer = await prisma.customer.update({
      where: { id: Number(body.id) }, // ✅ ensure number
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("PUT /api/customers error:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

// DELETE a customer safely
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Missing customer id" }, { status: 400 });
    }

    const customerId = Number(body.id);
    console.log("Deleting customer id:", customerId);

    // Optional: delete related records first
    await prisma.sale.deleteMany({ where: { customerId } });
    await prisma.customerProduct.deleteMany({ where: { customerId } });

    // Delete customer
    await prisma.customer.delete({ where: { id: customerId } });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/customers error:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
