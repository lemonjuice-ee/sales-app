import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rice = await prisma.product.create({ data: { name: "Rice", capitalPerKilo: 50 } });
  const beans = await prisma.product.create({ data: { name: "Beans", capitalPerKilo: 80 } });

  const customerA = await prisma.customer.create({ data: { name: "Customer A", email: "a@example.com" } });
  const customerB = await prisma.customer.create({ data: { name: "Customer B", email: "b@example.com" } });

  await prisma.customerProduct.createMany({
    data: [
      { customerId: customerA.id, productId: rice.id, pricePerKilo: 100 },
      { customerId: customerA.id, productId: beans.id, pricePerKilo: 120 },
      { customerId: customerB.id, productId: rice.id, pricePerKilo: 110 },
      { customerId: customerB.id, productId: beans.id, pricePerKilo: 130 },
    ],
  });

  await prisma.sale.createMany({
    data: [
      { customerId: customerA.id, productId: rice.id, amount: 5, salePrice: 500 },
      { customerId: customerA.id, productId: beans.id, amount: 3, salePrice: 360 },
      { customerId: customerB.id, productId: rice.id, amount: 10, salePrice: 1100 },
      { customerId: customerB.id, productId: beans.id, amount: 7, salePrice: 910 },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

