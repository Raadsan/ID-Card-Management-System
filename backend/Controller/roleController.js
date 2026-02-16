import { prisma } from "../lib/prisma.js";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

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

    // Log audit
    await logAudit({
      userId: req.user?.id,
      action: AUDIT_ACTIONS.CREATE,
      tableName: TABLE_NAMES.ROLE,
      recordId: role.id,
      newData: { name, description },
      ipAddress: getClientIp(req),
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

    // Get old data
    const oldRole = await prisma.role.findUnique({ where: { id } });

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    // Log audit
    await logAudit({
      userId: req.user?.id,
      action: AUDIT_ACTIONS.UPDATE,
      tableName: TABLE_NAMES.ROLE,
      recordId: id,
      oldData: { name: oldRole.name, description: oldRole.description },
      newData: updateData,
      ipAddress: getClientIp(req),
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

    // 1️⃣ Check if role exists and has relations
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: { take: 1 },
        RolePermissions: { take: 1 }
      }
    });

    if (!role) return res.status(404).json({ message: "Role-ka lama helin" });

    // 2️⃣ Check for related records
    const relatedRecords = [];
    if (role.users.length > 0) relatedRecords.push("Isticmaalayaal (Users)");
    if (role.RolePermissions) relatedRecords.push("Ogolaansho (Permissions)");

    if (relatedRecords.length > 0) {
      const tableList = relatedRecords.join(" iyo ");
      return res.status(400).json({
        message: `Ma tirtiri kartid Role-kan sababtoo ah waxaa jira ${tableList} ku xiran. Fadlan marka hore ka saar xogtaas.`
      });
    }

    // 3️⃣ Perform Delete
    await prisma.role.delete({
      where: { id },
    });

    // Log audit
    await logAudit({
      userId: req.user?.id,
      action: AUDIT_ACTIONS.DELETE,
      tableName: TABLE_NAMES.ROLE,
      recordId: id,
      oldData: { name: role.name, description: role.description },
      ipAddress: getClientIp(req),
    });

    res.json({ message: "Role-ka waa la tirtiray si guul ah" });
  } catch (error) {
    console.error("DELETE_ROLE_ERROR:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Role-ka lama helin" });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Ma tirtiri kartid Role-kan sababtoo ah waxaa jira xog kale oo ku xiran."
      });
    }

    res.status(500).json({ message: "Wuu ku guuldareystay tirtirista Role-ka.", error: error.message });
  }
};
