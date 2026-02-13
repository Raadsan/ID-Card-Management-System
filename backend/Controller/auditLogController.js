import { prisma } from "../lib/prisma.js";

/* =========================
   CREATE AUDIT LOG
========================= */
export const createAuditLog = async (req, res) => {
  try {
    const { userId, action, tableName, recordId, oldData, newData, ipAddress } = req.body;

    if (!userId || !action || !tableName) {
      return res.status(400).json({ message: "Missing required fields: userId, action, tableName" });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: Number(userId),
        action,
        tableName,
        recordId: recordId ? Number(recordId) : null,
        oldData: oldData || null,
        newData: newData || null,
        ipAddress: ipAddress || null,
      },
      include: { user: true },
    });

    res.status(201).json(auditLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create audit log" });
  }
};

/* =========================
   GET ALL AUDIT LOGS
========================= */
export const getAuditLogs = async (req, res) => {
  try {
    const { userId, action, tableName, startDate, endDate, page = 1, limit = 50 } = req.query;

    // Build filter conditions
    const where = {};
    if (userId) where.userId = Number(userId);
    if (action) where.action = action;
    if (tableName) where.tableName = tableName;
    
    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: auditLogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

/* =========================
   GET AUDIT LOG BY ID
========================= */
export const getAuditLogById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!auditLog) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.json(auditLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch audit log" });
  }
};

/* =========================
   GET AUDIT LOGS BY USER
========================= */
export const getAuditLogsByUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where: { userId } }),
    ]);

    res.json({
      data: auditLogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user audit logs" });
  }
};

/* =========================
   GET AUDIT LOGS BY TABLE
========================= */
export const getAuditLogsByTable = async (req, res) => {
  try {
    const { tableName } = req.params;
    const { recordId, page = 1, limit = 50 } = req.query;

    const where = { tableName };
    if (recordId) where.recordId = Number(recordId);

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: auditLogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch table audit logs" });
  }
};

/* =========================
   DELETE AUDIT LOG
========================= */
export const deleteAuditLog = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const auditLog = await prisma.auditLog.findUnique({ where: { id } });
    if (!auditLog) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    await prisma.auditLog.delete({ where: { id } });

    res.json({ message: "Audit log deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete audit log" });
  }
};
