import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to extract error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// POST → create a sale
export async function POST(req: Request) {
  try {
    const body: { customer?: string; amount?: number | string } = await req.json();
    const { customer, amount } = body;

    if (!customer || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const sale = await prisma.sale.create({
      data: {
        customer,
        amount: parseFloat(amount as string),
      },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// GET → list all sales
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sales);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// PUT → update a sale
export async function PUT(req: Request) {
  try {
    const body: { id?: number | string; customer?: string; amount?: number | string } =
      await req.json();
    const { id, customer, amount } = body;

    if (!id || !customer || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedSale = await prisma.sale.update({
      where: { id: Number(id) },
      data: {
        customer,
        amount: parseFloat(amount as string),
      },
    });

    return NextResponse.json(updatedSale, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE → delete a sale
export async function DELETE(req: Request) {
  try {
    const body: { id?: number | string } = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing sale ID" }, { status: 400 });
    }

    await prisma.sale.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
