import { prisma } from "../lib/prisma.js";

/* CREATE ROLE */
export const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const role = await prisma.role.create({
      data: { name, description },
    });

    res.status(201).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create role" });
  }
};

/* GET ALL ROLES */
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch roles" });
  }
};
