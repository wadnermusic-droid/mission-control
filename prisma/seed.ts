import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Delete in order of dependencies
  await prisma.timeEntry.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.toolRegistration.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
      name: 'Black Platinum',
      role: 'user',
      isActive: true,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create tasks
  const tasksData = [
    {
      userId: user.id,
      title: 'CP-002: 3 AI Tools for Parents Script',
      description: 'Write and record Instagram reel script about AI tools parents need for their kids education.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: 'urgent',
      status: 'in_progress',
      tags: JSON.stringify(['content', 'cp-002', 'script']),
      assignee: 'Rendaw',
    },
    {
      userId: user.id,
      title: 'Create 5-Tool Freebie PDF',
      description: 'Design a Canva PDF guide: "5 AI Tools Every Parent Needs" with tool descriptions and opt-in link to Stan Store.',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: 'high',
      status: 'inbox',
      tags: JSON.stringify(['freebie', 'design', 'canva']),
      assignee: 'Rendaw',
    },
    {
      userId: user.id,
      title: 'Set up Stan Store + IG Bio Link',
      description: 'Wire Stan Store payment link into Instagram bio. Test checkout flow for ACA bundle ($597) and freebie opt-in.',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      priority: 'high',
      status: 'inbox',
      tags: JSON.stringify(['sales', 'integration']),
      assignee: 'Rendaw',
    },
    {
      userId: user.id,
      title: 'Record 3 Reels (Batch)',
      description: 'Film voiceovers and edit CP-001, CP-002, CP-003 reels. Schedule: Tue AM, Wed PM, Sat PM.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'high',
      status: 'inbox',
      tags: JSON.stringify(['production', 'video']),
      assignee: 'Rendaw',
    },
    {
      userId: user.id,
      title: 'Brand Kit in Canva',
      description: 'Create brand colors, fonts, logo placement for Instagram. Design 3 reel templates for consistency.',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      priority: 'high',
      status: 'done',
      tags: JSON.stringify(['branding', 'design']),
      assignee: 'Rendaw',
    },
  ];

  for (const taskData of tasksData) {
    const createdTask = await prisma.task.create({ data: taskData });

    if (taskData.status === 'in_progress') {
      await prisma.note.create({
        data: {
          userId: user.id,
          taskId: createdTask.id,
          content: 'Using Northwell AI Hub (Claude Opus 4.6) to generate script. Ready to record.',
        },
      });
    }

    if (taskData.status === 'done' || taskData.status === 'in_progress') {
      await prisma.timeEntry.create({
        data: {
          userId: user.id,
          taskId: createdTask.id,
          duration: Math.floor(Math.random() * 7200) + 1800,
          description: 'Content creation work',
        },
      });
    }
  }

  // Create tools
  const tools = [
    { name: 'time-tracker', displayName: 'Time Tracker', description: 'Track time spent on tasks' },
    { name: 'notes-panel', displayName: 'Notes Panel', description: 'Take and manage task notes' },
    { name: 'calendar-view', displayName: 'Calendar View', description: 'View tasks in calendar format' },
    { name: 'analytics', displayName: 'Analytics', description: 'View productivity analytics' },
    { name: 'pomodoro-timer', displayName: 'Pomodoro Timer', description: 'Focus timer for deep work' },
  ];

  for (const tool of tools) {
    await prisma.toolRegistration.create({ data: tool });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
