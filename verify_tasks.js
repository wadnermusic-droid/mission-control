const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: 'asc' }
  });

  console.log('\n📋 Your Tasks:');
  tasks.forEach(t => {
    if (t.title.startsWith('CP-')) {
      console.log(`✅ ${t.title}`);
      console.log(`   Due: ${t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'No date'}`);
      console.log(`   Priority: ${t.priority}`);
    }
  });

  await prisma.$disconnect();
}

main().catch(console.error);
