import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

/* =========================
   CREATE USER
========================= */
const checkUserPermission = async (req, action) => {
  const userId = req.user?.id;
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { roleId: true }
  });

  if (!user) return false;

  // Check permissions for "Users" submenu
  // We look for the submenu with url "/system/users"
  const permission = await prisma.roleSubMenuAccess.findFirst({
    where: {
      subMenu: {
        OR: [
          { url: "/system/users" },
          { title: "Users" }
        ]
      },
      roleMenuAccess: {
        rolePermissions: {
          roleId: user.roleId
        }
      }
    }
  });

  if (!permission) return false;

  if (action === 'create' && !permission.canAdd) return false;
  if (action === 'update' && !permission.canEdit) return false;
  if (action === 'delete' && !permission.canDelete) return false;

  return true;
};

export const createUser = async (req, res) => {
  try {
    const hasPermission = await checkUserPermission(req, 'create');
    if (!hasPermission) {
      return res.status(403).json({ message: "You do not have permission to add users." });
    }

    const { fullName, email, phone, password, roleId, status, gender } = req.body;

    if (!fullName || !email || !password || !roleId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check role exists
    const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
    if (!role) return res.status(400).json({ message: "Invalid roleId" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Cloudinary file URL
    const photo = req.file ? req.file.path : null;

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        gender,
        password: hashedPassword,
        status: status || "active",
        roleId: Number(roleId),
        photo,
      },
      include: { role: true },
    });

    // Log audit
    await logAudit({
      userId: req.user?.id || user.id,
      action: AUDIT_ACTIONS.CREATE,
      tableName: TABLE_NAMES.USER,
      recordId: user.id,
      newData: { fullName, email, phone, gender, roleId, status: status || "active" },
      ipAddress: getClientIp(req),
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Failed to create user" });
  }
};

/* =========================
   GET ALL USERS
========================= */
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true, employee: true },
      orderBy: { id: "asc" },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User ID missing from token payload" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Current user profile not found in database" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Internal server error while fetching profile", error: error.message });
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
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/* =========================
   UPDATE USER
========================= */
export const updateUser = async (req, res) => {
  try {
    const hasPermission = await checkUserPermission(req, 'update');
    if (!hasPermission) {
      return res.status(403).json({ message: "You do not have permission to update users." });
    }

    const id = Number(req.params.id);
    const { fullName, email, phone, roleId, status, gender, password } = req.body;

    // Validate roleId if provided
    if (roleId) {
      const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
      if (!role) return res.status(400).json({ message: "Invalid roleId" });
    }

    // Check if file uploaded (Cloudinary returns full URL in path)
    const photo = req.file ? req.file.path : undefined;

    // Fetch old data for photo deletion and audit logging
    const oldUser = await prisma.user.findUnique({ where: { id } });
    if (!oldUser) return res.status(404).json({ message: "User not found" });

    // Prepare update data
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (status) updateData.status = status;
    if (roleId) updateData.roleId = Number(roleId);
    if (photo !== undefined) updateData.photo = photo;

    // Optional: delete old photo if updating with a new one
    if (photo && oldUser.photo) {
      const oldPath = path.join("uploads", oldUser.photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    // Log audit
    await logAudit({
      userId: req.user?.id,
      action: AUDIT_ACTIONS.UPDATE,
      tableName: TABLE_NAMES.USER,
      recordId: id,
      oldData: {
        fullName: oldUser.fullName,
        email: oldUser.email,
        phone: oldUser.phone,
        gender: oldUser.gender,
        roleId: oldUser.roleId,
        status: oldUser.status
      },
      newData: updateData,
      ipAddress: getClientIp(req),
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") return res.status(404).json({ message: "User not found" });
    if (error.code === "P2002") return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Failed to update user" });
  }
};

/* =========================
   DELETE USER
========================= */
export const deleteUser = async (req, res) => {
  try {
    const hasPermission = await checkUserPermission(req, 'delete');
    if (!hasPermission) {
      return res.status(403).json({ message: "You do not have permission to delete users." });
    }

    const id = Number(req.params.id);

    // 1️⃣ Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        employee: true,
        idsCreated: { take: 1 },
        idsPrinted: { take: 1 },
        transfersPerformed: { take: 1 },
        auditLogs: { take: 1 }
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Check for related records (Foreign Key Constraints)
    const relatedRecords = [];
    if (user.employee) relatedRecords.push("Shaqaale (Employee)");
    if (user.idsCreated.length > 0 || user.idsPrinted.length > 0) relatedRecords.push("ID Cards");
    if (user.transfersPerformed.length > 0) relatedRecords.push("Wareejin (Transfers)");
    if (user.auditLogs.length > 0) relatedRecords.push("Logs");

    if (relatedRecords.length > 0) {
      const tableList = relatedRecords.join(", ");
      return res.status(400).json({
        message: `Ma tirtiri kartid isticmaalahan sababtoo ah waxaa jira ${tableList} ku xiran. Fadlan marka hore tirtir xogtaas ama ka dhig isticmaalaha mid aan firfirconayn (Inactive).`
      });
    }

    // 3️⃣ Delete user photo if exists
    if (user.photo) {
      const photoPath = path.join("uploads", user.photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    // 4️⃣ Perform Delete
    await prisma.user.delete({ where: { id } });

    // Log audit
    await logAudit({
      userId: req.user?.id,
      action: AUDIT_ACTIONS.DELETE,
      tableName: TABLE_NAMES.USER,
      recordId: id,
      oldData: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        roleId: user.roleId,
        status: user.status
      },
      ipAddress: getClientIp(req),
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE_USER_ERROR:", error);

    // Prisma Foreign Key Constraint error
    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Ma tirtiri kartid isticmaalahan sababtoo ah waxaa jira xog kale oo ku xiran database-ka."
      });
    }

    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};
