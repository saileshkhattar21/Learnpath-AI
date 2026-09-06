import express from "express";
import { requireAuthJson } from "../middlewares/auth.middleware.js";
import { getTrackDetail, getTrackCatalog } from "../services/track.service.js";
import {
  getBreakdownForAttempt,
  getFullContextForAttempt,
} from "../services/track-assessment.service.js";
import { getAuth } from "@clerk/express";
import { buildAiContext } from "../services/ai-context.service.js";
import { findOrCreateUser } from "../services/user.service.js";

const router = express.Router();

router.get("/tracks/:slug/catalog", requireAuthJson, async (req, res) => {
  try {
    const { slug } = req.params;
    const track = await getTrackDetail(slug);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const catalog = await getTrackCatalog(track.id);
    res.json({ trackId: track.id, catalog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/quiz-attempts/:attemptId/breakdown",
  requireAuthJson,
  async (req, res) => {
    try {
      const { attemptId } = req.params;
      const breakdown = await getBreakdownForAttempt(attemptId);
      if (!breakdown)
        return res.status(404).json({ error: "Attempt not found" });

      res.json({ breakdown });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.get(
  "/quiz-attempts/:attemptId/full-context",
  requireAuthJson,
  async (req, res) => {
    try {
      const { attemptId } = req.params;
      const context = await getFullContextForAttempt(attemptId);
      if (!context) return res.status(404).json({ error: "Attempt not found" });

      res.json({ context });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.get("/tracks/:slug/ai-context", requireAuthJson, async (req, res) => {
  try {
    const { slug } = req.params;
    const { attemptId } = req.query;
    const clerkUserId = getAuth(req).userId;
    const user = await findOrCreateUser(clerkUserId);

    const context = await buildAiContext({ userId: user.id, slug, attemptId });
    if (!context) return res.status(404).json({ error: "Track not found" });

    res.json({ context });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
