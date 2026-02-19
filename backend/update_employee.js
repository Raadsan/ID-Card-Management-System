import { prisma } from "./lib/prisma.js";

async function main() {
    console.log("🛠️  Updating Employee table columns...");

    try {
        // Add missing columns if they don't exist
        const columns = await prisma.$queryRaw`SHOW COLUMNS FROM Employee`;
        const fieldNames = columns.map(c => c.Field);

        const additions = [
            { name: 'fullName', type: 'VARCHAR(191) NOT NULL' },
            { name: 'email', type: 'VARCHAR(191) NOT NULL' },
            { name: 'phone', type: 'VARCHAR(191)' },
            { name: 'address', type: 'VARCHAR(191)' },
            { name: 'dob', type: 'DATETIME(3)' },
            { name: 'nationality', type: 'VARCHAR(191)' },
            { name: 'photo', type: 'VARCHAR(191)' },
            { name: 'gender', type: 'VARCHAR(191)' }
        ];

        for (const add of additions) {
            if (!fieldNames.includes(add.name)) {
                console.log(`Adding ${add.name}...`);
                await prisma.$executeRawUnsafe(`ALTER TABLE Employee ADD COLUMN ${add.name} ${add.type}`);
            }
        }

        // Add unique constraint for email if not present
        console.log("Ensuring unique index on Employee(email)...");
        try {
            await prisma.$executeRaw`CREATE UNIQUE INDEX Employee_email_key ON Employee(email)`;
        } catch (e) {
            console.log("ℹ️ Email index might already exist or failed, but continuing.");
        }

        // Remove userId if it exists
        if (fieldNames.includes('userId')) {
            console.log("Removing userId column from Employee (Destructive action)...");
            try {
                // Drop foreign key first
                await prisma.$executeRaw`ALTER TABLE Employee DROP FOREIGN KEY Employee_userId_fkey`;
            } catch (e) {
                console.log("ℹ️ Could not drop foreign key Employee_userId_fkey (might not exist).");
            }
            await prisma.$executeRaw`ALTER TABLE Employee DROP COLUMN userId`;
        }

        console.log("✅ Employee table updated!");

        // Also ensure DepartmentSection exists (from previous user change)
        console.log("Checking DepartmentSection table...");
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS DepartmentSection (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        departmentId INT NOT NULL,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT DepartmentSection_departmentId_fkey FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;
        console.log("✅ DepartmentSection table ensured.");

    } catch (error) {
        console.error("❌ Failed to update tables:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
