import { useNavigate, useParams } from "react-router-dom";

export default function StudyStubPage() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--ink)] px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--waypoint)]">
        Learning path ready
      </p>
      <h1 className="mt-3 font-display text-3xl font-medium text-[var(--text-ink-strong)]">
        Study experience coming next
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
        Your personalized path has been saved. Course content, resources, and
        progress quizzes will live here soon.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="mt-8 rounded-md bg-[var(--waypoint)] px-5 py-2.5 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)]"
      >
        ← Back to my path
      </button>
      <span className="mt-5 text-xs text-[var(--text-muted)]">
        Path {pathId}
      </span>
    </main>
  );
}
