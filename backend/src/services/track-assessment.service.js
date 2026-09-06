import {
  findQuestionsForTrackByLevel,
  findQuestionsByIds,
  createAttempt,
  findAttemptWithFullContext,
  findAttemptWithAnswers,
} from "../models/track-assessment.model.js";

const TIER_COUNTS = {
  level_beginner: 7,
  level_intermediate: 7,
  level_advanced: 6,
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sanitizeQuestion(q) {
  return {
    id: q.id,
    question: q.question,
    levelId: q.levelId,
    options: shuffle(q.options).map((o) => ({ id: o.id, text: o.text })),
  };
}

export const buildQuizForTrack = async (trackId) => {
  console.log("[track-assessment.service] building quiz for track:", trackId);
  const selected = [];

  for (const [levelId, count] of Object.entries(TIER_COUNTS)) {
    const pool = await findQuestionsForTrackByLevel(trackId, levelId);
    console.log(
      `[track-assessment.service] ${levelId}: pool ${pool.length}, need ${count}`,
    );
    if (pool.length < count) {
      console.warn(
        `[track-assessment.service] not enough questions for ${levelId}, using all ${pool.length}`,
      );
    }
    selected.push(...shuffle(pool).slice(0, count));
  }

  const shuffled = shuffle(selected);
  console.log(`[track-assessment.service] total selected: ${shuffled.length}`);
  return shuffled.map(sanitizeQuestion);
};

export const gradeAndSaveAttempt = async ({ userId, trackId, responses }) => {
  if (!Array.isArray(responses) || responses.length === 0) {
    throw new Error("Answer at least one quiz question before submitting.");
  }
  if (new Set(responses.map((r) => r.questionId)).size !== responses.length) {
    throw new Error("Each quiz question can only be answered once.");
  }
  console.log(
    `[track-assessment.service] grading ${responses.length} responses, user:`,
    userId,
  );

  const questionIds = responses.map((r) => r.questionId);
  const questions = await findQuestionsByIds(questionIds);
  if (questions.length !== questionIds.length) {
    throw new Error("One or more quiz questions are invalid.");
  }
  if (questions.some((question) => question.section.course?.trackId !== trackId)) {
    throw new Error("Quiz questions must belong to this track.");
  }

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
  console.log(
    `[track-assessment.service] score: ${correctAnswers}/${totalQuestions} (${score.toFixed(1)}%)`,
  );

  const attempt = await createAttempt({
    userId,
    trackId,
    score,
    totalQuestions,
    correctAnswers,
    answers,
  });
  console.log("[track-assessment.service] attempt saved:", attempt.id);

  return { attemptId: attempt.id, score, correctAnswers, totalQuestions };
};

export const getFullContextForAttempt = async (attemptId) => {
  console.log("[track-assessment.service] building full context:", attemptId);
  const attempt = await findAttemptWithFullContext(attemptId);
  if (!attempt) return null;

  const questionDetails = attempt.answers.map((answer) => {
    const correctOption = answer.question.options.find((o) => o.isCorrect);
    return {
      question: answer.question.question,
      tier: answer.question.levelId,
      section: answer.question.section.title,
      skills: answer.question.section.skills.map((s) => s.skill.name),
      selectedAnswer: answer.option.text,
      correctAnswer: correctOption?.text ?? null,
      isCorrect: answer.isCorrect,
    };
  });

  console.log(
    `[track-assessment.service] built context for ${questionDetails.length} questions`,
  );

  return {
    trackId: attempt.trackId,
    score: attempt.score,
    correctAnswers: attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    questionDetails,
  };
};

export const getBreakdownForAttempt = async (attemptId) => {
  console.log("[track-assessment.service] building breakdown:", attemptId);
  const attempt = await findAttemptWithAnswers(attemptId);
  if (!attempt) return null;

  const breakdown = {};
  for (const answer of attempt.answers) {
    const tier = answer.question.levelId;
    if (!breakdown[tier]) breakdown[tier] = { correct: 0, total: 0 };
    breakdown[tier].total += 1;
    if (answer.isCorrect) breakdown[tier].correct += 1;
  }

  console.log("[track-assessment.service] breakdown:", breakdown);
  return breakdown;
};
