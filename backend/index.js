import { prisma } from './lib/prisma.js'

async function main() {
    try {
        // Try to perform a simple query to verify connection
        await prisma.$queryRaw`SELECT 1`
        console.log('✅ Database connection successful!')
    } catch (error) {
        console.error('❌ Database connection failed!')
        console.error(error)
        process.exit(1)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })