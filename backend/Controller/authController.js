import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                menus: {
                  include: {
                    menu: true,
                    subMenus: {
                      include: {
                        subMenu: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(401).json({ message: "User account is inactive" });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Log successful login
    await logAudit({
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN,
      tableName: TABLE_NAMES.USER,
      recordId: user.id,
      newData: { email: user.email, role: user.role.name },
      ipAddress: getClientIp(req),
    });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.name,
      photo: user.photo,
      permissions: user.role.rolePermissions, // Send permissions to frontend
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   GET CURRENT USER
========================= */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                menus: {
                  include: {
                    menu: true,
                    subMenus: {
                      include: {
                        subMenu: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.name,
      photo: user.photo,
      permissions: user.role.rolePermissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};