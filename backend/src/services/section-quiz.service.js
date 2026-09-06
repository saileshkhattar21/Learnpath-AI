import {
  findQuestionsForSection,
  findQuestionsByIds,
  createQuizAttempt,
} from "../models/section-quiz.model.js";
import {
  findSectionProgress,
  upsertSectionProgress,
} from "../models/user-section-progress.model.js";

const QUIZ_SIZE = 10;
const PASS_RATIO = 0.7; // 7/10, per your design doc

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const buildSectionQuiz = async (sectionId) => {
  const pool = await findQuestionsForSection(sectionId);

  return shuffle(pool)
    .slice(0, QUIZ_SIZE)
    .map((q) => ({
      id: q.id,
      question: q.question,
      options: shuffle(q.options).map((o) => ({ id: o.id, text: o.text })),
    }));
};

export const gradeSectionQuiz = async ({ userId, sectionId, responses }) => {

  const questions = await findQuestionsByIds(
    responses.map((r) => r.questionId),
  );

  let correctAnswers = 0;
  const answers = responses.map((r) => {
    const question = questions.find((q) => q.id === r.questionId);
    const correctOption = question?.options.find((o) => o.isCorrect);
    const isCorrect = Boolean(correctOption && correctOption.id === r.optionId);
    if (isCorrect) correctAnswers++;
    return { questionId: r.questionId, optionId: r.optionId, isCorrect };
  });

  const totalQuestions = responses.length;
  const score =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const passed =
    totalQuestions > 0 && correctAnswers / totalQuestions >= PASS_RATIO;

  await createQuizAttempt({
    userId,
    sectionId,
    score,
    totalQuestions,
    correctAnswers,
    passed,
    answers,
  });

  const existing = await findSectionProgress(userId, sectionId);
  const bestScore = Math.max(score, existing?.bestScore ?? 0);
  const completed = passed || Boolean(existing?.completed);
  await upsertSectionProgress({ userId, sectionId, completed, bestScore });
  return { passed, score, correctAnswers, totalQuestions };
};
