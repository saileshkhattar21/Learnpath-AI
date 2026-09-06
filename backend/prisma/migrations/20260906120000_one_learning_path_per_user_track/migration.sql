-- A learner has one active AI-generated path for a track. This also makes
-- concurrent generation requests safe at the database level.
DROP INDEX IF EXISTS "learning_paths_userId_trackId_idx";
CREATE UNIQUE INDEX "learning_paths_userId_trackId_key" ON "learning_paths"("userId", "trackId");

ALTER TABLE "learning_paths" ADD COLUMN "summary" TEXT;
ALTER TABLE "learning_paths" ADD COLUMN "recommendedStartingPoint" TEXT;
