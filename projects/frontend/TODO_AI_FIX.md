# TODO_AI_FIX.md - Project AI Bot Fixes

## Progress Tracker

### [ ] 1. Create this TODO.md (IN PROGRESS)
### [x] 2. Read and analyze vite.config.ts for proxy setup ✅
### [x] 3. Fix ProjectAIBot.tsx:
   - Assign fetch response properly ✅
   - Change API endpoint to /api/project-ai ✅
   - Update request body to match route.ts ✅
   - Fixed corrupted import line ✅
### [x] 4. Add vite proxy if missing (proxy /api/ to local server) ✅
### [ ] 5. Test locally: pnpm dev, use AI bot, check no errors/404
### [ ] 6. Update knowledge.ts fallback if needed
### [ ] 7. Secure API key (move to server-only)
### [ ] 8. Mark complete, update main TODO.md

**Current Status:** Fixing ReferenceError and 404 in ProjectAIBot.tsx

**Files to Edit:** src/features/project-ai/ProjectAIBot.tsx, vite.config.ts (if needed)

**Test Command:** cd projects/frontend && pnpm dev

