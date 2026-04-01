import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const gens = await prisma.generation.findMany({ where: { stemStatus: "splitting" } });
  console.log(gens);
}
run();
