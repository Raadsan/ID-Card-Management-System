import "dotenv/config";
import express from "express";
import cors from "cors";

import { prisma } from "./lib/prisma.js";
import roleRoutes from "./Routes/roleRoutes.js";

const app = express();

/* ================= Middleware ================= */
app.use(cors());
app.use(express.json());

/* ================= Routes ================= */
app.use("/api/roles", roleRoutes);

/* ================= DB Check ================= */
async function startServer() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful!");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(error);
    process.exit(1);
  }
}

startServer();

/* ================= Graceful Shutdown ================= */
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
