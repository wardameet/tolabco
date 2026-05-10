const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://studenthub_user:Studenthub123!@localhost:5432/studenthub_db?schema=public'
    }
  }
});

async function main() {
  console.log('Connecting to database...');
  const count = await prisma.user.count();
  console.log(`Success! User count: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
