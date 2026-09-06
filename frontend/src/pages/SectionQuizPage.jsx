import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { getSectionQuiz, submitSectionQuiz } from "../lib/api";
import QuizRunner from "../components/QuizRunner";
import LoadingScreen from "../components/LoadingScreen";

export default function SectionQuizPage() {
  const { slug, sectionId } = useParams();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const navigate = useNavigate();

  if (!isLoaded || !isSignedIn || !userId) return <LoadingScreen label="Preparing your assessment…" />;

  return (
    <QuizRunner
      fetchQuestions={async () =>
        (await getSectionQuiz(slug, sectionId, getToken)).questions
      }
      onSubmit={(responses) =>
        submitSectionQuiz(slug, sectionId, responses, getToken)
      }
      backLabel="← Back to study"
      onBack={() => navigate(`/tracks/${slug}/study`)}
      renderResult={(result, { onBack }) => (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--ink)] px-6 text-center">
          <h1 className="font-display text-3xl font-medium text-[var(--text-ink-strong)]">
            {result.correctAnswers} / {result.totalQuestions}
          </h1>
          <p
            className={`mt-2 text-sm font-medium ${result.passed ? "text-[var(--mint)]" : "text-[#e08a8a]"}`}
          >
            {result.passed
              ? "Passed — next level unlocks once every section here is done."
              : "Not quite — you can retake this anytime."}
          </p>
          <button
            onClick={onBack}
            className="mt-8 rounded-md bg-[var(--waypoint)] px-5 py-2.5 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)]"
          >
            Back to study
          </button>
        </div>
      )}
    />
  );
}
