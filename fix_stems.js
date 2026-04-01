const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.generation.updateMany({
    where: { stemStatus: "splitting" },
    data: { stemStatus: "none", lalalTaskId: null }
  });
  console.log("Fixed stuck stems.");
}
run();
