# Project AI Gemini Bot - Implementation TODO

Status: In Progress

## Planned Steps (approved plan - no deployment)

**Step 1: Dependencies** [x]
- [x] Edit projects/frontend/package.json: add \"@google/generative-ai\": \"^0.20.0\"
- [x] Run: cd projects/frontend; pnpm install (completed)

**Step 2: Knowledge Base** [x]

- [ ] Create projects/frontend/src/features/project-ai/knowledge.ts (Q&A from README, file summary)

**Step 3: Bot Component** [ ]
- [ ] Create projects/frontend/src/features/project-ai/ProjectAIBot.tsx (fork/modify EscrowAgent.tsx for project bot, API=/api/project-ai)

**Step 4: API Endpoint** [ ]
- [ ] Create projects/frontend/api/project-ai/route.ts (Vercel API: Gemini 1.5-flash, context=project docs)

**Step 5: Integrate App** [ ]
- [ ] Edit projects/frontend/src/App.tsx: add import/render <ProjectAIBot activeTab={location.pathname} walletConnected={...} />

**Step 6: Dev Config** [x]

- [ ] Edit vite.config.ts: proxy '/api/*'
- [ ] Create .env.example: GEMINI_API_KEY=

**Step 7: Test** [ ]
- [ ] pnpm dev
- [ ] Test project queries

Provide GEMINI_API_KEY in projects/frontend/.env.local when ready.

