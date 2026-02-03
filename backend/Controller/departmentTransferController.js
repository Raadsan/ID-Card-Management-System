import { prisma } from "../lib/prisma.js";

// Create a new transfer and automatically update employee department
export const createDepartmentTransfer = async (req, res) => {
  try {
    const { employeeId, fromDepartmentId, toDepartmentId, transferDate, reason } = req.body;
    // Read authorized user ID from token
    const authorizedById = req.user?.id;

    if (!authorizedById) {
      return res.status(401).json({
        message: "Session context is invalid. Please log out and sign in again to authorize this transfer."
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 0️⃣ Verify the authorizing administrator exists in the current registry
      const authorizer = await tx.user.findUnique({
        where: { id: Number(authorizedById) }
      });

      if (!authorizer) {
        throw new Error(`CRITICAL: Your session ID (${authorizedById}) is not recognized by the central system. Authentication refresh required.`);
      }

      // 1️⃣ Create the transfer record
      const transfer = await tx.departmentTransfer.create({
        data: {
          employeeId: Number(employeeId),
          fromDepartmentId: Number(fromDepartmentId),
          toDepartmentId: Number(toDepartmentId),
          authorizedById: Number(authorizedById),
          transferDate: new Date(transferDate),
          reason: reason || "",
        },
      });

      // 2️⃣ Update employee's department
      const updatedEmployee = await tx.employee.update({
        where: { id: Number(employeeId) },
        data: { departmentId: Number(toDepartmentId) },
      });

      return { transfer, updatedEmployee };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Create Transfer Error:", error);
    res.status(500).json({ message: "Failed to transfer employee", error: error.message });
  }
};

// Get all transfers
export const getDepartmentTransfers = async (req, res) => {
  try {
    const transfers = await prisma.departmentTransfer.findMany({
      include: {
        employee: {
          include: { user: true }
        },
        fromDepartment: true,
        toDepartment: true,
        authorizedBy: true, // 👈 Included Authorizing User
      },
      orderBy: { transferDate: "desc" },
    });
    res.json(transfers);
  } catch (error) {
    console.error("Fetch Transfers Error:", error);
    res.status(500).json({ message: "Failed to fetch transfers", error: error.message });
  }
};

// Get transfer by ID
export const getDepartmentTransferById = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.departmentTransfer.findUnique({
      where: { id: Number(id) },
      include: {
        employee: {
          include: { user: true }
        },
        fromDepartment: true,
        toDepartment: true,
        authorizedBy: true, // 👈 Included Authorizing User
      },
    });
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    res.json(transfer);
  } catch (error) {
    console.error("Fetch Transfer by ID Error:", error);
    res.status(500).json({ message: "Failed to fetch transfer", error: error.message });
  }
};

// Update transfer
export const updateDepartmentTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, fromDepartmentId, toDepartmentId, transferDate, reason } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Update transfer
      const transfer = await tx.departmentTransfer.update({
        where: { id: Number(id) },
        data: {
          employeeId: Number(employeeId),
          fromDepartmentId: Number(fromDepartmentId),
          toDepartmentId: Number(toDepartmentId),
          transferDate: new Date(transferDate),
          reason: reason || "",
        },
      });

      // Update employee's department
      const updatedEmployee = await tx.employee.update({
        where: { id: Number(employeeId) },
        data: { departmentId: Number(toDepartmentId) },
      });

      return { transfer, updatedEmployee };
    });

    res.json(result);
  } catch (error) {
    console.error("Update Transfer Error:", error);
    res.status(500).json({ message: "Failed to update transfer", error: error.message });
  }
};

// Delete transfer
export const deleteDepartmentTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.departmentTransfer.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Transfer deleted successfully" });
  } catch (error) {
    console.error("Delete Transfer Error:", error);
    res.status(500).json({ message: "Failed to delete transfer", error: error.message });
  }
};
