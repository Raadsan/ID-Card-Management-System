import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

/* =========================
   CREATE USER
========================= */
export const createUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, roleId, status } = req.body;

    if (!fullName || !email || !password || !roleId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check role exists
    const role = await prisma.role.findUnique({
      where: { id: Number(roleId) },
    });

    if (!role) {
      return res.status(400).json({ message: "Invalid roleId" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        status: status || "active",
        roleId: Number(roleId),
      },
      include: {
        role: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Failed to create user" });
  }
};

/* =========================
   GET ALL USERS
========================= */
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: "asc" },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* =========================
   GET USER BY ID
========================= */
export const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/* =========================
   UPDATE USER
========================= */
export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fullName, email, phone, roleId, status } = req.body;

    if (roleId) {
      const role = await prisma.role.findUnique({
        where: { id: Number(roleId) },
      });
      if (!role) return res.status(400).json({ message: "Invalid roleId" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        phone,
        roleId: roleId ? Number(roleId) : undefined,
        status,
      },
      include: { role: true },
    });

    res.json(user);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Failed to update user" });
  }
};

/* =========================
   DELETE USER
========================= */
export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(500).json({ message: "Failed to delete user" });
  }
};
