import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  return new Response(JSON.stringify(users), { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
    },
  });
  return new Response(JSON.stringify(user), { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const user = await prisma.user.update({
    where: { id: body.id },
    data: {
      name: body.name,
      email: body.email,
    },
  });
  return new Response(JSON.stringify(user), { status: 200 });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  await prisma.user.delete({
    where: { id: body.id },
  });
  return new Response(JSON.stringify({ message: "User deleted" }), { status: 200 });
}
