# LearnPath AI

An adaptive learning platform that builds a personalized, AI-generated study path for developers across six tracks — rather than handing everyone the same fixed curriculum.

**Live app:** _[https://learnpath-ai-green.vercel.app/]_
**API:** _[https://learnpath-ai-backend-voo1.onrender.com]_

---

## What it does

1. **Sign in** (Clerk — email/OAuth).
2. **Pick a track** — Frontend, Backend (Node/Express), DevOps & Cloud, Relational Databases, AI & ML, or Data Analytics.
3. **Self-rate prerequisite skills** (0–10 confidence) for that track.
4. **Take a 20-question diagnostic quiz** — 7 beginner, 7 intermediate, 6 advanced, randomly sampled from the track's full question pool. Mandatory before a path can be generated.
5. **Get an AI-generated learning path.** The backend assembles the learner's skill ratings, full quiz breakdown (per-question, with tier and topic), and the *entire real course catalog* for that track, and sends it to an LLM (via Groq). The model returns a JSON-only ordered sequence of course/section picks with a reason for each — and every returned ID is validated server-side against the actual catalog before anything is saved, so the AI can only ever recommend content that genuinely exists.
6. **Study**, level by level. Levels are locked until every section in the previous level is completed; sections within an unlocked level are freely navigable. Each section has learning objectives, embedded YouTube videos, and curated resources, plus a 10-question section quiz (70% to pass) that unlocks progress.
7. **Reassess anytime** — retake the full diagnostic, then regenerate the path. The new plan is aware of which sections are already completed and weighs quiz misses by tier (a missed beginner-level question signals a bigger gap than a missed advanced one), so it won't just re-recommend everything from scratch.


## Tech stack

**Frontend**
- Vite + React
- Tailwind CSS (v4)
- Clerk (`@clerk/clerk-react`) for auth — sign-in/sign-up, session tokens, protected routes
- React Router

**Backend**
- Node.js + Express
- Prisma ORM (pinned to v6 — v7 introduced breaking config changes not worth chasing mid-build) + PostgreSQL
- Clerk (`@clerk/express`) — verifies the same session token server-side via middleware
- Groq (`@langchain/groq`, `openai/gpt-oss-120b`) for path generation, called through LangChain
- Zod for validating the LLM's structured JSON output before it ever touches the database

**Data model (Prisma)**
- Content catalog: `Track`, `Level`, `Course`, `Section`, `Skill`, `Resource`, `Video`, `Question`/`QuestionOption` — all seeded, versioned in JSON, and treated as the source of truth the AI is constrained against.
- Learner state: `User`, `UserSkillRating`, `TrackAssessmentAttempt`/`Answer` (the diagnostic), `QuizAttempt`/`Answer` (section quizzes), `UserSectionProgress`, `LearningPath`/`LearningPathItem` (the AI's saved output).

## Architecture notes

- **AI is constrained, not trusted blindly.** The LLM only ever sees IDs from the real catalog and is instructed to use only those. The backend re-validates every `courseId`/`sectionId` in the response against the track's actual catalog before saving — if the model hallucinates an ID, that item is rejected rather than silently saved.
- **Reassess is an overwrite, not a version history.** `LearningPath` has a `@@unique([userId, trackId])` constraint — one active path per user per track. Reassessing deletes and regenerates rather than keeping a full version history. That's a deliberate MVP simplification; a "real" version-history table is a natural next step if needed.
- **Section quizzes vs. the diagnostic are separate models.** The diagnostic (`TrackAssessmentAttempt`) spans many sections across a whole track and doesn't map to Prisma's `QuizAttempt` (which is scoped to one `sectionId`), so it has its own attempt/answer tables mirroring the section-quiz shape.

## Local setup

**Backend**
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, GROQ_API_KEY
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

**Frontend**
```bash
cd frontend
cp .env.example .env   # fill in VITE_CLERK_PUBLISHABLE_KEY, VITE_API_BASE_URL
npm install
npm run dev
```

## Possible next steps

- Real version history for regenerated learning paths, instead of overwrite-in-place.
- Per-user progress dashboard aggregating across tracks.
- Section-level "why this is here" explanations surfaced in the study UI, not just in the initial path summary.
- Swap Render/Neon free tiers for something without cold starts, if this goes past a portfolio piece.
