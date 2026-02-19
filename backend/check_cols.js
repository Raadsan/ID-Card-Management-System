import { prisma } from "./lib/prisma.js";

async function check() {
    try {
        const columns = await prisma.$queryRaw`SHOW COLUMNS FROM Employee`;
        console.log(JSON.stringify(columns, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
