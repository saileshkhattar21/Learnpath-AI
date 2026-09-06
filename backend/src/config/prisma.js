import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

export default prisma;
