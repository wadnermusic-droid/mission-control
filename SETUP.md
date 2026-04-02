# Mission Control Setup

## Quick Start

```bash
cd /Users/just-add-wadner/.openclaw/workspace/mission-control

# 1. Install dependencies
npm install

# 2. Set up database and seed sample data
npm run db:migrate
npm run db:seed

# 3. Run development server
npm run dev
```

Then open: **http://localhost:3000**

## What You Get

✅ **Full-stack Next.js app** with kanban board
✅ **SQLite database** (local file-based, no external DB)
✅ **Drag-drop task management** with 4 columns (Inbox, Assigned, In Progress, Done)
✅ **Custom tools framework** (Time Tracker, Notes, Calendar, Analytics, Pomodoro Timer)
✅ **Dark mode support**
✅ **Search and filtering**
✅ **Real-time task updates**

## File Structure

All the files from the Claude Opus prompt need to be created. Because of complexity, recommend using this approach:

1. Copy all `.ts`, `.tsx`, `package.json`, config files from the output
2. Create the directory structure as specified
3. Run `npm install` to let Prisma generate client
4. Run `npm run db:migrate && npm run db:seed`

## Next Steps

Once running:
- Create your own custom tools in `src/components/tools/`
- Modify the Prisma schema in `prisma/schema.prisma` for new features
- Update the Tools Registry in `src/lib/tools.ts` to register new tools

## Troubleshooting

**Error: `prisma: command not found`**
→ Run `npm install` first, then `npx prisma migrate dev`

**Port 3000 already in use?**
→ Use `npm run dev -- -p 3001` to run on different port

**Database errors?**
→ Delete `prisma/dev.db` and run `npm run db:migrate && npm run db:seed` again

---

**Status:** Ready to build. All component files are in the output above. Need them organized into the proper directory structure.
