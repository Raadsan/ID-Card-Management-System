import "dotenv/config";
import express from "express";
import cors from "cors";

import { prisma } from "./lib/prisma.js";
import roleRoutes from "./Routes/roleRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import departmentRoutes from "./Routes/departmentRoutes.js";
import employeeRoutes from "./Routes/employeeRoutes.js";
import menuRoutes from "./Routes/menuRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import rolePermissionsRoutes from "./Routes/rolePermissionsRoutes.js";
import departmentTransfareRoutes from "./Routes/departmentTransferRoute.js";
import idTemplateRoutes from "./Routes/idTemplateRoutes.js"; // Import new routes
import idGenerateRoutes from "./Routes/idGenerateRoutes.js";


const app = express();


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/role-permissions", rolePermissionsRoutes);
app.use("/api/department-transfers", departmentTransfareRoutes);
app.use("/api/id-templates", idTemplateRoutes);
app.use("/api/auth", authRoutes)
app.use("/api/id-generates", idGenerateRoutes);

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
