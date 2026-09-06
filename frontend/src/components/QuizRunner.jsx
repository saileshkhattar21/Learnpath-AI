import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function QuizRunner({
  fetchQuestions,
  onSubmit,
  renderResult,
  backLabel,
  onBack,
}) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        console.log("[quiz-runner] fetching questions");
        const data = await fetchQuestions();
        console.log(`[quiz-runner] got ${data.length} questions`);
        if (!cancelled) setQuestions(data);
      } catch (err) {
        console.error("[quiz-runner] fetchQuestions failed:", err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const responses = Object.entries(answers).map(
        ([questionId, optionId]) => ({ questionId, optionId }),
      );
      console.log(
        `[quiz-runner] submitting ${responses.length}/${questions.length}`,
      );
      const data = await onSubmit(responses);
      console.log("[quiz-runner] result:", data);
      setResult(data);
    } catch (err) {
      console.error("[quiz-runner] onSubmit failed:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading quiz…" />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--ink)] px-6 text-center">
        <p className="text-sm text-[#e08a8a]">
          Couldn't load the quiz: {error}
        </p>
        <button
          onClick={onBack}
          className="text-sm font-medium text-[var(--waypoint)]"
        >
          {backLabel}
        </button>
      </div>
    );
  }

  if (result) {
    return renderResult(result, { onBack });
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
              disabled={submitting || answeredCount === 0}
              className="rounded-md bg-[var(--waypoint)] px-5 py-2 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)] disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit quiz"}
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
