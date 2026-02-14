import { prisma } from "../lib/prisma.js";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

/* =========================
   CREATE ROLE PERMISSIONS
========================= */
export const createRolePermissions = async (req, res) => {
  try {
    const { roleId, menusAccess } = req.body;

    const rolePermission = await prisma.rolePermissions.create({
      data: {
        roleId: Number(roleId),
        menus: {
          create: menusAccess.map(menu => ({
            menuId: Number(menu.menuId),
            subMenus: {
              create: menu.subMenus.map(sub => ({
                subMenuId: Number(sub.subMenuId)
              }))
            }
          }))
        }
      },
      include: {
        menus: { include: { subMenus: true } }
      }
    });

    // Log audit
    await logAudit({
      userId: req.user?.id,
      action: AUDIT_ACTIONS.CREATE,
      tableName: TABLE_NAMES.ROLE_PERMISSIONS,
      recordId: rolePermission.id,
      newData: { roleId, menusAccess },
      ipAddress: getClientIp(req),
    });

    res.status(201).json(rolePermission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create role permissions", error });
  }
};


/* =========================
   GET ALL ROLE PERMISSIONS
========================= */
export const getAllRolePermissions = async (req, res) => {
  try {
    const roles = await prisma.rolePermissions.findMany({
      include: {
        role: true,
        menus: {
          include: {
            menu: true,
            subMenus: {
              include: { subMenu: true },
            },
          },
        },
      },
    });

    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch role permissions" });
  }
};

/* =========================
   GET ROLE PERMISSIONS BY ROLE ID
========================= */
export const getRolePermissionsByRoleId = async (req, res) => {
  try {
    const roleId = Number(req.params.roleId);

    const rolePermissions = await prisma.rolePermissions.findUnique({
      where: { roleId },
      include: {
        role: true,
        menus: {
          include: {
            menu: true,
            subMenus: {
              include: { subMenu: true },
            },
          },
        },
      },
    });

    if (!rolePermissions) {
      return res.status(404).json({ message: "Role permissions not found" });
    }

    res.json(rolePermissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch role permissions" });
  }
};

/* =========================
   UPDATE ROLE PERMISSIONS
========================= */
export const updateRolePermissions = async (req, res) => {
  try {
    const roleId = Number(req.params.roleId);
    const { menusAccess } = req.body;

    if (!menusAccess || !Array.isArray(menusAccess)) {
      return res.status(400).json({ message: "menusAccess is required" });
    }

    // Check role permissions exist and get old data
    const existingRolePermissions = await prisma.rolePermissions.findUnique({
      where: { roleId },
      include: {
        menus: { include: { subMenus: true } }
      }
    });
    if (!existingRolePermissions) {
      return res.status(404).json({ message: "Role permissions not found" });
    }

    // Delete existing RoleMenuAccess & RoleSubMenuAccess to replace with new
    await prisma.roleSubMenuAccess.deleteMany({
      where: { roleMenuAccess: { rolePermissionsId: existingRolePermissions.id } },
    });

    await prisma.roleMenuAccess.deleteMany({
      where: { rolePermissionsId: existingRolePermissions.id },
    });

    // Recreate menus & submenus
    const updatedRolePermissions = await prisma.rolePermissions.update({
      where: { roleId },
      data: {
        menus: {
          create: menusAccess.map(menu => ({
            menuId: Number(menu.menuId),
            subMenus: {
              create: menu.subMenus.map(sub => ({
                subMenuId: Number(sub.subMenuId),
              })),
            },
          })),
        },
      },
      include: {
        menus: {
          include: {
            menu: true,
            subMenus: { include: { subMenu: true } },
          },
        },
        role: true,
      },
    });

    // Log audit
    await logAudit({
      userId: req.user?.id,
      action: AUDIT_ACTIONS.UPDATE,
      tableName: TABLE_NAMES.ROLE_PERMISSIONS,
      recordId: roleId,
      oldData: { menus: existingRolePermissions.menus },
      newData: { menusAccess },
      ipAddress: getClientIp(req),
    });

    res.json(updatedRolePermissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update role permissions", error: error.message });
  }
};

/* =========================
   DELETE ROLE PERMISSIONS
========================= */
export const deleteRolePermissions = async (req, res) => {
  try {
    const roleId = Number(req.params.roleId);

    const existingRolePermissions = await prisma.rolePermissions.findUnique({
      where: { roleId },
      include: {
        menus: { include: { subMenus: true } }
      }
    });

    if (!existingRolePermissions) {
      return res.status(404).json({ message: "Role permissions not found" });
    }

    // Delete submenus first
    await prisma.roleSubMenuAccess.deleteMany({
      where: { roleMenuAccess: { rolePermissionsId: existingRolePermissions.id } },
    });

    // Delete menus
    await prisma.roleMenuAccess.deleteMany({
      where: { rolePermissionsId: existingRolePermissions.id },
    });

    // Delete rolePermissions
    await prisma.rolePermissions.delete({ where: { id: existingRolePermissions.id } });

    // Log audit
    await logAudit({
      userId: req.user?.id,
      action: AUDIT_ACTIONS.DELETE,
      tableName: TABLE_NAMES.ROLE_PERMISSIONS,
      recordId: roleId,
      oldData: { menus: existingRolePermissions.menus },
      ipAddress: getClientIp(req),
    });

    res.json({ message: "Role permissions deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete role permissions", error: error.message });
  }
};
