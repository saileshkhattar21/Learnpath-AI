import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";
import {
  generateLearningPath,
  getTrack,
  saveTrackSkillRatings,
} from "../lib/api";

function PathModal({ path, close, study }) {
  if (!path) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-md border border-[var(--line)] bg-[var(--ink-raised)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-[var(--waypoint)]">
              Your AI learning path
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium text-[var(--text-ink-strong)]">
              A focused route forward
            </h2>
          </div>
          <button
            onClick={close}
            aria-label="Close path"
            className="text-lg text-[var(--text-muted)]"
          >
            ×
          </button>
        </div>
        {path.summary && (
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
            {path.summary}
          </p>
        )}
        <button
          onClick={study}
          className="mt-6 w-full rounded-md bg-[var(--waypoint)] px-5 py-3 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)]"
        >
          Start studying →
        </button>
        {path.recommendedStartingPoint && (
          <p className="mt-4 rounded-md border border-[var(--line)] p-3 text-sm text-[var(--text-ink-strong)]">
            Start with:{" "}
            <span className="text-[var(--waypoint)]">
              {path.recommendedStartingPoint}
            </span>
          </p>
        )}
        <ol className="mt-6 space-y-3">
          {path.items.map((item) => (
            <li
              key={item.id}
              className="rounded-md border border-[var(--line)] p-4"
            >
              <p className="text-xs text-[var(--waypoint)]">
                Step {item.position} · {item.course?.level?.name}
              </p>
              <h3 className="mt-1 text-sm font-medium text-[var(--text-ink-strong)]">
                {item.section?.title || item.course?.title}
              </h3>
              {item.section && (
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {item.course?.title}
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {item.reason}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function TrackDetailPage() {
  const { slug } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);
  const [ratings, setRatings] = useState({});
  const [path, setPath] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const data = await getTrack(slug, getToken);
        if (canceled) return;
        setTrack(data.track);
        setPath(data.learningPath);
        setShowPath(Boolean(data.learningPath));
        setHasQuiz(data.hasCompletedQuiz);
        const next = {};
        data.track.prerequisites.forEach((p) => {
          const previous = data.ratings.find((r) => r.skillId === p.skillId);
          next[p.skillId] = previous ? previous.rating : 5;
        });
        setRatings(next);
      } catch (err) {
        if (!canceled) setError(err.message);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [slug, getToken]);
  const save = async () => {
    try {
      setSaving(true);
      await saveTrackSkillRatings(
        slug,
        Object.entries(ratings).map(([skillId, rating]) => ({
          skillId,
          rating,
        })),
        getToken,
      );
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const generate = async () => {
    try {
      setGenerating(true);
      setError(null);
      await saveTrackSkillRatings(
        slug,
        Object.entries(ratings).map(([skillId, rating]) => ({
          skillId,
          rating,
        })),
        getToken,
      );
      setSaved(true);
      const data = await generateLearningPath(slug, getToken);
      setPath(data.path);
      setShowPath(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };
  if (loading)
    return (
      <div className="min-h-screen bg-[var(--ink)] px-8 py-16 text-sm text-[var(--text-muted)]">
        Loading track…
      </div>
    );
  if (!track)
    return (
      <div className="min-h-screen bg-[var(--ink)] px-8 py-16 text-sm text-[#e08a8a]">
        Couldn't load this track: {error}
      </div>
    );
  return (
    <div className="min-h-screen bg-[var(--ink)]">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-8 py-5">
        <button
          onClick={() => navigate("/dashboard")}
          className="font-display text-lg font-medium text-[var(--text-ink-strong)]"
        >
          LearnPath AI
        </button>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-[var(--text-muted)]"
        >
          ← All tracks
        </button>
        <h1 className="mt-4 font-display text-3xl font-medium text-[var(--text-ink-strong)]">
          {track.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {track.description}
        </p>
        {error && <p className="mt-5 text-sm text-[#e08a8a]">{error}</p>}
        {!path && (
          <section className="mt-10 rounded-md border border-[var(--line)] bg-[var(--ink-raised)] p-6">
            <h2 className="font-display text-base font-medium text-[var(--text-ink-strong)]">
              Rate your current skills
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              0 = no experience, 10 = very confident using it independently.
            </p>
            <div className="mt-6 space-y-6">
              {track.prerequisites.map(({ skill, importance }) => (
                <div key={skill.id}>
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-[var(--text-ink-strong)]">
                      {skill.name}
                    </label>
                    <span className="text-xs uppercase text-[var(--text-muted)]">
                      {importance}
                    </span>
                  </div>
                  <input
                    className="mt-3 w-full accent-[var(--waypoint)]"
                    type="range"
                    min="0"
                    max="10"
                    value={ratings[skill.id] ?? 5}
                    onChange={(e) => {
                      setRatings((old) => ({
                        ...old,
                        [skill.id]: Number(e.target.value),
                      }));
                      setSaved(false);
                    }}
                  />
                  <div className="mt-1 flex justify-between text-xs text-[var(--text-muted)]">
                    <span>0</span>
                    <span className="font-medium text-[var(--waypoint)]">
                      {ratings[skill.id] ?? 5}
                    </span>
                    <span>10</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              disabled={saving}
              onClick={save}
              className="mt-8 rounded-md bg-[var(--waypoint)] px-5 py-2.5 text-sm font-medium text-[#1c1a12] disabled:opacity-60"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save ratings"}
            </button>
          </section>
        )}
        <div className="mt-6 flex gap-4">
          {!path && (
            <button
              onClick={() => navigate(`/tracks/${slug}/quiz`)}
              className="flex-1 rounded-md border border-[var(--line)] px-5 py-3 text-sm font-medium text-[var(--text-ink-strong)]"
            >
              {hasQuiz ? "Retake quiz" : "Take required quiz"}
            </button>
          )}
          {path ? (
            <button
              onClick={() => setShowPath(true)}
              className="flex-1 rounded-md bg-[var(--waypoint)] px-5 py-3 text-sm font-medium text-[#1c1a12]"
            >
              View my learning path
            </button>
          ) : (
            <button
              disabled={!hasQuiz || generating}
              onClick={generate}
              className="flex-1 rounded-md border border-[var(--line)] px-5 py-3 text-sm font-medium text-[var(--text-ink-strong)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating
                ? "Generating your path…"
                : hasQuiz
                  ? "Generate my path"
                  : "Complete quiz to generate"}
            </button>
          )}
        </div>
        {!path && !hasQuiz && (
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            The quiz is required before your AI path can be generated.
          </p>
        )}
      </main>
      {showPath && (
        <PathModal
          path={path}
          close={() => setShowPath(false)}
          study={() => navigate(`/tracks/${slug}/study`)}
        />
      )}
    </div>
  );
}
