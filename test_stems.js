const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const gens = await prisma.generation.findMany({ where: { stemStatus: "splitting" } });
  console.log(JSON.stringify(gens, null, 2));
}
run();
