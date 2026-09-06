import { getAuth } from "@clerk/express";
import { findOrCreateUser } from "../services/user.service.js";
import {
  buildSectionQuiz,
  gradeSectionQuiz,
} from "../services/section-quiz.service.js";

export const getSectionQuiz = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const questions = await buildSectionQuiz(sectionId);
    res.json({ sectionId, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postSectionQuizSubmit = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { responses } = req.body;
    const clerkUserId = getAuth(req).userId;
    const user = await findOrCreateUser(clerkUserId);

    const result = await gradeSectionQuiz({
      userId: user.id,
      sectionId,
      responses,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
