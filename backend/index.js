import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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
import auditLogRoutes from "./Routes/auditLogRoutes.js";
import employeeReportRoutes from "./Routes/report/employeeReportRoutes.js";
import departmentReportRoutes from "./Routes/report/departmentReportRoutes.js";
import departmentTransferReportRoutes from "./Routes/report/departmentTransferReportRoutes.js";
import idCardReportRoutes from "./Routes/report/idCardReportRoutes.js";
import job from "./config/cron.js";



const app = express();

// Trust proxy for correct IP detection behind proxies/load balancers
app.set("trust proxy", true);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Legacy redirect for old QR codes pointing to backend root
app.get("/verify/:qrCode", (req, res) => {
  const { qrCode } = req.params;
  // Use environment variable for frontend URL if available, else default to localhost:3000
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/verify/${qrCode}`);
});

app.get("/", (req, res) => {
  res.send("ID Card Management System API");
});

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
app.use("/api/employee-report", employeeReportRoutes);
app.use("/api/department-report", departmentReportRoutes);
app.use("/api/department-transfer-report", departmentTransferReportRoutes);
app.use("/api/id-card-report", idCardReportRoutes);
app.use("/api/audit-logs", auditLogRoutes);

async function startServer() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful!");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      job.start();
      console.log("⏰ Cron job started successfully!");
    });
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(error);
    process.exit(1);
  }
}

startServer();
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
