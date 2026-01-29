import { prisma } from "../lib/prisma.js";

/* =========================
   CREATE ROLE
========================= */
export const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const role = await prisma.role.create({
      data: { name, description },
    });

    res.status(201).json(role);
  } catch (error) {
    console.error(error);

    // Unique constraint (name must be unique)
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Role already exists" });
    }

    res.status(500).json({ message: "Failed to create role" });
  }
};

/* =========================
   GET ALL ROLES
========================= */
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: "asc" },
    });
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch roles" });
  }
};

/* =========================
   GET ROLE BY ID
========================= */
export const getRoleById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch role" });
  }
};

/* =========================
   UPDATE ROLE
========================= */
export const updateRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const role = await prisma.role.update({
      where: { id },
      data: { name, description },
    });

    res.json(role);
  } catch (error) {
    console.error(error);

    // Record not found
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Role not found" });
    }

    // Unique constraint
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Role name already exists" });
    }

    res.status(500).json({ message: "Failed to update role" });
  }
};

/* =========================
   DELETE ROLE
========================= */
export const deleteRole = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.role.delete({
      where: { id },
    });

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(500).json({ message: "Failed to delete role" });
  }
};
