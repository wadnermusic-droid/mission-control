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

  if (!user) {
    console.error('User not found');
    return;
  }

  const tasks = [
    {
      title: 'CP-001: Film IG Reels (AI Demos)',
      description: 'Film 3-5 short reels on AI tools (target: 15-30sec each). Follow content pillars: AI demos, quick tips, healthcare angles. Equipment: iPhone + natural lighting. Output: 5-8 raw clips for editing.',
      dueDate: new Date('2026-04-08'),
      priority: 'high',
      status: 'inbox',
      tags: JSON.stringify(['content-pipeline', 'filming', 'instagram']),
      userId: user.id
    },
    {
      title: 'CP-002: Edit & Schedule IG Posts',
      description: 'Edit Tuesday clips in CapCut. Add captions, subtitles, CTAs. Batch schedule to Later.com (post 3x this week). Track: follower growth, engagement rate.',
      dueDate: new Date('2026-04-09'),
      priority: 'high',
      status: 'inbox',
      tags: JSON.stringify(['content-pipeline', 'editing', 'instagram']),
      userId: user.id
    },
    {
      title: 'CP-003: Content Audit & Planning',
      description: 'Review week performance (views, saves, shares). Document what worked/didn\'t work. Plan next batch (topics, angles, formats). Update content bank.',
      dueDate: new Date('2026-04-11'),
      priority: 'medium',
      status: 'inbox',
      tags: JSON.stringify(['content-pipeline', 'planning', 'analytics']),
      userId: user.id
    },
    {
      title: 'CP-004: Extended Session (Optional Buffer)',
      description: 'Secondary filming if needed. Backup editing time. Thumbnail/cover design for posts.',
      dueDate: new Date('2026-04-12'),
      priority: 'low',
      status: 'inbox',
      tags: JSON.stringify(['content-pipeline', 'buffer']),
      userId: user.id
    }
  ];

  for (const task of tasks) {
    try {
      const created = await prisma.task.create({ data: task });
      console.log(`✅ Created: ${created.title}`);
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
