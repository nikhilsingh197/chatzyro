import prisma from "./lib/prisma";

async function main() {
  const result = await prisma.$queryRaw`SELECT NOW()`;
  console.log(result);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });