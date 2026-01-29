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
    const { title, icon, url, isCollapsible } = req.body;

    const menu = await prisma.menu.update({
      where: { id },
      data: { title, icon, url, isCollapsible },
      include: { subMenus: true },
    });

    res.json(menu);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Menu title already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(500).json({ message: "Failed to update menu" });
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
