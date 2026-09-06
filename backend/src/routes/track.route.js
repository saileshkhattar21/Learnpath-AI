import express from "express";
import { requireAuthJson } from "../middlewares/auth.middleware.js";
import {
  getTracks,
  getTrack,
  postTrackSkillRatings,
  postGenerateLearningPath,
} from "../controllers/track.controller.js";
import {
  getTrackQuiz,
  postTrackQuizSubmit,
} from "../controllers/track-assessment.controller.js";

const router = express.Router();

router.get("/", requireAuthJson, getTracks);
router.get("/:slug", requireAuthJson, getTrack);
router.post("/:slug/skills", requireAuthJson, postTrackSkillRatings);
router.post("/:slug/path", requireAuthJson, postGenerateLearningPath);
router.get("/:slug/quiz", requireAuthJson, getTrackQuiz);
router.post("/:slug/quiz/submit", requireAuthJson, postTrackQuizSubmit);

export default router;
