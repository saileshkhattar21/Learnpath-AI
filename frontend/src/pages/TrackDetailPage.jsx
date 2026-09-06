import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";
import {
  generateLearningPath,
  getTrack,
  saveTrackSkillRatings,
} from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";
import LearningPathModal from "../components/LearningPathModal";

export default function TrackDetailPage() {
  const { slug } = useParams();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
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
      if (!isLoaded || !isSignedIn || !userId) return;
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
  }, [slug, getToken, isLoaded, isSignedIn, userId]);
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
  if (!isLoaded || !isSignedIn || !userId)
    return <LoadingScreen label="Preparing your track…" />;
  if (loading) return <LoadingScreen message="Loading track…" />;
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
                  ? "Generate my path with AI"
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
        <LearningPathModal
          path={path}
          onClose={() => setShowPath(false)}
          onStartStudying={() => navigate(`/tracks/${slug}/study`)}
        />
      )}
    </div>
  );
}
