import { prisma } from "./lib/prisma.js";

async function main() {
    const template = await prisma.idCardTemplate.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true, name: true, frontBackground: true, backBackground: true }
    });

    if (template) {
        console.log("Latest Template Info:");
        console.log(`ID: ${template.id}`);
        console.log(`Name: ${template.name}`);
        console.log(`Front Background: "${template.frontBackground}"`);
        console.log(`Back Background: "${template.backBackground}"`);
    } else {
        console.log("No templates found.");
    }

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
