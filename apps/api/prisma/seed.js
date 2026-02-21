import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma.service.js';
async function main() {
    const prisma = new PrismaService();
    try {
        await prisma.$connect();
        console.log('🏃 Seeding database...');
        await prisma.article.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('🧹 Existing data cleared');
        const hashedPassword = await bcrypt.hash('eprx_v3_pass', 10);
        const masterUser = await prisma.user.create({
            data: {
                email: 'runner@eprx.com',
                username: 'ELITE_RUNNER_01',
                password: hashedPassword,
                firstName: 'ELITE',
                lastName: 'RUNNER',
                mobile: '0917-000-0000',
            },
        });
        console.log(`✅ Master Runner Created: ${masterUser.email}`);
        await prisma.article.create({
            data: {
                title: 'BEYOND THE MILE: RECOVERY PROTOCOLS',
                content: 'Optimizing downtime is just as important as the run itself...',
                category: 'PERFORMANCE',
                authorId: masterUser.id,
                image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070',
            },
        });
        console.log('✅ Article seeded successfully');
    }
    catch (err) {
        console.error('❌ SEED ERROR:', err);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
