import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { getTrackQuiz, submitTrackQuiz } from "../lib/api";

export default function QuizPage() {
  const { slug } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadQuiz = async () => {
      try {
        console.log("[quiz] fetching quiz for track:", slug);
        const data = await getTrackQuiz(slug, getToken);
        console.log(`[quiz] got ${data.questions.length} questions`);
        if (!cancelled) setQuestions(data.questions);
      } catch (err) {
        console.error("[quiz] getTrackQuiz failed:", err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadQuiz();
    return () => {
      cancelled = true;
    };
  }, [slug, getToken]);

  const selectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const responses = Object.entries(answers).map(
        ([questionId, optionId]) => ({
          questionId,
          optionId,
        }),
      );
      console.log(
        `[quiz] submitting ${responses.length}/${questions.length} answers`,
      );
      const data = await submitTrackQuiz(slug, responses, getToken);
      console.log("[quiz] result:", data);
      setResult(data);
    } catch (err) {
      console.error("[quiz] submitTrackQuiz failed:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ink)] text-sm text-[var(--text-muted)]">
        Loading quiz…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--ink)] px-6 text-center">
        <p className="text-sm text-[#e08a8a]">
          Couldn't load the quiz: {error}
        </p>
        <button
          onClick={() => navigate(`/tracks/${slug}`)}
          className="text-sm font-medium text-[var(--waypoint)]"
        >
          ← Back to track
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--ink)] px-6 text-center">
        <h1 className="font-display text-3xl font-medium text-[var(--text-ink-strong)]">
          {result.correctAnswers} / {result.totalQuestions}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {result.score.toFixed(0)}% — this feeds into your personalized path.
        </p>
        <button
          onClick={() => navigate(`/tracks/${slug}`)}
          className="mt-8 rounded-md bg-[var(--waypoint)] px-5 py-2.5 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)]"
        >
          Back to track
        </button>
      </div>
    );
  }

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[var(--ink)] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            Question {current + 1} of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>

        <div className="mt-2 h-1 w-full rounded-full bg-[var(--ink-raised)]">
          <div
            className="h-1 rounded-full bg-[var(--waypoint)] transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <h1 className="mt-8 font-display text-xl font-medium text-[var(--text-ink-strong)]">
          {question.question}
        </h1>

        <div className="mt-6 space-y-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => selectOption(question.id, opt.id)}
              className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                answers[question.id] === opt.id
                  ? "border-[var(--waypoint)] bg-[var(--ink-raised)] text-[var(--text-ink-strong)]"
                  : "border-[var(--line)] text-[var(--text)] hover:border-[var(--waypoint)]"
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-ink-strong)] disabled:opacity-40"
          >
            ← Previous
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || answeredCount !== questions.length}
              className="rounded-md bg-[var(--waypoint)] px-5 py-2 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)] disabled:opacity-60"
            >
              {submitting
                ? "Submitting…"
                : answeredCount !== questions.length
                  ? `Answer all ${questions.length} questions`
                  : "Submit quiz"}
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrent((c) => Math.min(questions.length - 1, c + 1))
              }
              className="text-sm font-medium text-[var(--waypoint)]"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
