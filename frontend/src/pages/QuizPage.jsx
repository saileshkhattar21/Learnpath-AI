import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  getTrackQuiz,
  submitTrackQuiz,
  regenerateLearningPath,
} from "../lib/api";
import QuizRunner from "../components/QuizRunner";
import LoadingScreen from "../components/LoadingScreen";

export default function QuizPage() {
  const { slug } = useParams();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReassess = searchParams.get("reassess") === "1";

  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState(null);

  if (!isLoaded || !isSignedIn || !userId) return <LoadingScreen label="Preparing your assessment…" />;

  const handleUpdatePath = async () => {
    try {
      setRegenerating(true);
      console.log("[quiz] reassess: regenerating path with new attempt");
      await regenerateLearningPath(slug, getToken);
      console.log("[quiz] regenerated, going to study page");
      navigate(`/tracks/${slug}/study`);
    } catch (err) {
      console.error("[quiz] regenerateLearningPath failed:", err);
      setRegenError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <QuizRunner
      fetchQuestions={async () =>
        (await getTrackQuiz(slug, getToken)).questions
      }
      onSubmit={(responses) => submitTrackQuiz(slug, responses, getToken)}
      backLabel="← Back to track"
      onBack={() => navigate(`/tracks/${slug}`)}
      renderResult={(result) => (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--ink)] px-6 text-center">
          <h1 className="font-display text-3xl font-medium text-[var(--text-ink-strong)]">
            {result.correctAnswers} / {result.totalQuestions}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {result.score.toFixed(0)}% — this feeds into your personalized path.
          </p>

          {regenError && (
            <p className="mt-4 text-sm text-[#e08a8a]">
              Couldn't update your path: {regenError}
            </p>
          )}

          {isReassess ? (
            <button
              onClick={handleUpdatePath}
              disabled={regenerating}
              className="mt-8 rounded-md bg-[var(--waypoint)] px-5 py-2.5 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)] disabled:opacity-60"
            >
              {regenerating ? "Updating your path…" : "Update my path"}
            </button>
          ) : (
            <button
              onClick={() => navigate(`/tracks/${slug}`)}
              className="mt-8 rounded-md bg-[var(--waypoint)] px-5 py-2.5 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)]"
            >
              Back to track
            </button>
          )}
        </div>
      )}
    />
  );
}
