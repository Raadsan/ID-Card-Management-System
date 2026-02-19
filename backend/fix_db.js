import { prisma } from "./lib/prisma.js";

async function main() {
    console.log("🛠️  Manually applying database changes...");

    try {
        // 1. Create Category table
        console.log("Creating Category table...");
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS Category (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        description TEXT,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;
        console.log("✅ Category table ensured.");

        // 2. Add categoryId to Employee if it doesn't exist
        console.log("Checking Employee table for categoryId...");
        const columns = await prisma.$queryRaw`SHOW COLUMNS FROM Employee LIKE 'categoryId'`;
        if (Array.isArray(columns) && columns.length === 0) {
            console.log("Adding categoryId column to Employee...");
            await prisma.$executeRaw`ALTER TABLE Employee ADD COLUMN categoryId INT;`;
            await prisma.$executeRaw`ALTER TABLE Employee ADD CONSTRAINT Employee_categoryId_fkey FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE SET NULL ON UPDATE CASCADE;`;
            console.log("✅ categoryId column and foreign key added.");
        } else {
            console.log("ℹ️ categoryId column already exists.");
        }

        console.log("🚀 All manual updates completed!");
    } catch (error) {
        console.error("❌ Failed to apply manual updates:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
