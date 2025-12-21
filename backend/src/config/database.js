const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(`✅ PostgreSQL Connected via Prisma`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

module.exports = { connectDB, disconnectDB, prisma };
