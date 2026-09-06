import express from "express";
import { requireAuthJson } from "../middlewares/auth.middleware.js";
import {
  getTracks,
  getTrack,
  postTrackSkillRatings,
  postGenerateLearningPath,
  postRegenerateLearningPath,
} from "../controllers/track.controller.js";
import {
  getTrackQuiz,
  postTrackQuizSubmit,
} from "../controllers/track-assessment.controller.js";
import { getTrackStudy } from "../controllers/study.controller.js";
import {
  getSectionQuiz,
  postSectionQuizSubmit,
} from "../controllers/section-quiz.controller.js";

const router = express.Router();

router.get("/", requireAuthJson, getTracks);
router.get("/:slug", requireAuthJson, getTrack);
router.post("/:slug/skills", requireAuthJson, postTrackSkillRatings);
router.post("/:slug/path", requireAuthJson, postGenerateLearningPath);
router.get("/:slug/quiz", requireAuthJson, getTrackQuiz);
router.post("/:slug/quiz/submit", requireAuthJson, postTrackQuizSubmit);
router.get("/:slug/study", requireAuthJson, getTrackStudy);
router.post(
  "/:slug/path/regenerate",
  requireAuthJson,
  postRegenerateLearningPath,
);
router.get("/:slug/sections/:sectionId/quiz", requireAuthJson, getSectionQuiz);
router.post(
  "/:slug/sections/:sectionId/quiz/submit",
  requireAuthJson,
  postSectionQuizSubmit,
);

export default router;
