import { prisma } from "../lib/prisma.js";

/* =========================
   CREATE MENU
========================= */
export const createMenu = async (req, res) => {
  try {
    const { title, icon, url, isCollapsible, subMenus } = req.body;

    // check title
    if (!title) return res.status(400).json({ message: "Title is required" });

    const menu = await prisma.menu.create({
      data: {
        title,
        icon,
        url,
        isCollapsible: isCollapsible || false,
        subMenus: {
          create: subMenus?.map((sm) => ({
            title: sm.title,
            url: sm.url,
          })),
        },
      },
      include: { subMenus: true },
    });

    res.status(201).json(menu);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Menu title already exists" });
    }
    res.status(500).json({ message: "Failed to create menu" });
  }
};

/* =========================
   GET ALL MENUS
========================= */
export const getMenus = async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      include: { subMenus: true },
      orderBy: { id: "asc" },
    });
    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch menus" });
  }
};

/* =========================
   GET MENU BY ID
========================= */
export const getMenuById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: { subMenus: true },
    });
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};


//    UPDATE MENU

export const updateMenu = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, icon, url, isCollapsible, subMenus } = req.body;

    // If subMenus array is provided, we need to replace existing submenus
    if (subMenus !== undefined) {
      // First, get all existing submenus for this menu
      const existingSubMenus = await prisma.subMenu.findMany({
        where: { menuId: id },
        select: { id: true },
      });

      const subMenuIds = existingSubMenus.map((sm) => sm.id);

      // Delete role-submenu access records first (to avoid foreign key constraint)
      if (subMenuIds.length > 0) {
        await prisma.roleSubMenuAccess.deleteMany({
          where: { subMenuId: { in: subMenuIds } },
        });
      }

      // Now delete the submenus
      await prisma.subMenu.deleteMany({
        where: { menuId: id },
      });
    }

    // Update the menu and create new submenus
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        title,
        icon,
        url,
        isCollapsible,
        ...(subMenus !== undefined && subMenus.length > 0 && {
          subMenus: {
            create: subMenus.map((sm) => ({
              title: sm.title,
              url: sm.url,
              // Only extract title and url, ignore id, menuId, createdAt, updatedAt
            })),
          },
        }),
      },
      include: { subMenus: true },
    });

    res.json(menu);
  } catch (error) {
    console.error("Update menu error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Menu title already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(500).json({ message: "Failed to update menu", error: error.message });
  }
};


//    DELETE MENU
export const deleteMenu = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.menu.delete({ where: { id } });
    res.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(500).json({ message: "Failed to delete menu" });
  }
};

/* =========================
   GET MY MENUS (Based on Role)
========================= */
export const getUserMenus = async (req, res) => {
  try {
    console.log("getUserMenus called");
    console.log("Req User:", req.user);
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const roleId = user.roleId;
    console.log("User Role ID:", roleId);

    // Fetch Role Permissions
    const rolePermissions = await prisma.rolePermissions.findUnique({
      where: { roleId },
      include: {
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
      console.log("No role permissions found for Role ID:", roleId);
      // If no permissions defined, return empty array
      return res.json([]);
    }

    // Transform to match Menu structure
    const formattedMenus = rolePermissions.menus.map((roleMenu) => {
      const menu = roleMenu.menu;

      // Get allowed submenus for this menu
      const allowedSubMenus = roleMenu.subMenus.map((roleSubMenu) => roleSubMenu.subMenu);

      return {
        ...menu,
        subMenus: allowedSubMenus,
      };
    });

    // Sort by Menu ID
    formattedMenus.sort((a, b) => a.id - b.id);

    console.log("Returning menus count:", formattedMenus.length);
    res.json(formattedMenus);

  } catch (error) {
    console.error("Get my menus error:", error);
    res.status(500).json({ message: "Failed to fetch user menus" });
  }
};
