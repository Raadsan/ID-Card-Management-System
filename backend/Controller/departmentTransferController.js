import { prisma } from "../lib/prisma.js";

// Create a new transfer and automatically update employee department
export const createDepartmentTransfer = async (req, res) => {
  try {
    const { employeeId, fromDepartmentId, toDepartmentId, transferDate } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create the transfer record
      const transfer = await tx.departmentTransfer.create({
        data: {
          employeeId: Number(employeeId),
          fromDepartmentId: Number(fromDepartmentId),
          toDepartmentId: Number(toDepartmentId),
          transferDate: new Date(transferDate),
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
    console.error(error);
    res.status(500).json({ message: "Failed to transfer employee", error });
  }
};

// Get all transfers
export const getDepartmentTransfers = async (req, res) => {
  try {
    const transfers = await prisma.departmentTransfer.findMany({
      include: {
        employee: true,
        fromDepartment: true,
        toDepartment: true,
      },
      orderBy: { transferDate: "desc" },
    });
    res.json(transfers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch transfers", error });
  }
};

// Get transfer by ID
export const getDepartmentTransferById = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.departmentTransfer.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
        fromDepartment: true,
        toDepartment: true,
      },
    });
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    res.json(transfer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch transfer", error });
  }
};

// Update transfer
export const updateDepartmentTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, fromDepartmentId, toDepartmentId, transferDate } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Update transfer
      const transfer = await tx.departmentTransfer.update({
        where: { id: Number(id) },
        data: {
          employeeId: Number(employeeId),
          fromDepartmentId: Number(fromDepartmentId),
          toDepartmentId: Number(toDepartmentId),
          transferDate: new Date(transferDate),
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
    console.error(error);
    res.status(500).json({ message: "Failed to update transfer", error });
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
    console.error(error);
    res.status(500).json({ message: "Failed to delete transfer", error });
  }
};
