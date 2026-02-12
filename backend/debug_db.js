import { prisma } from "./lib/prisma.js";

async function main() {
    console.log("--- USERS ---");
    const users = await prisma.user.findMany({ take: 10 });
    console.log(JSON.stringify(users, null, 2));

    console.log("\n--- ID TEMPLATES ---");
    const templates = await prisma.idCardTemplate.findMany({ take: 10 });
    console.log(JSON.stringify(templates, null, 2));

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
