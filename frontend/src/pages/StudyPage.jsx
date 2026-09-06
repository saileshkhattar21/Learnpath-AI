import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { getTrackStudy } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";
import LearningPathModal from "../components/LearningPathModal";

function YoutubeCard({ video }) {
  if (!video.youtubeId) {
    return (
      <a
        href={video.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-md border border-[var(--line)] p-4 text-sm text-[var(--text)] hover:border-[var(--waypoint)]"
      >
        {video.title}
      </a>
    );
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden rounded-md border border-[var(--line)]"
    >
      <img
        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
        alt={video.title}
        className="aspect-video w-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--waypoint)]/90 text-[#1c1a12] shadow-lg">
          <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="bg-[var(--ink-raised)] px-4 py-3">
        <p className="text-sm font-medium text-[var(--text-ink-strong)]">
          {video.title}
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          {video.channel}
        </p>
      </div>
    </a>
  );
}

export default function StudyPage() {
  const { slug } = useParams();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const navigate = useNavigate();

  const [study, setStudy] = useState(null);
  const [path, setPath] = useState(null);
  const [showPath, setShowPath] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeRank, setActiveRank] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);

  const loadStudy = async () => {
    if (!isLoaded || !isSignedIn || !userId) return;
    try {
      console.log("[study] fetching study view:", slug);
      const data = await getTrackStudy(slug, getToken);
      console.log(
        "[study] levels:",
        data.study.levels.map((l) => l.levelName),
      );
      setStudy(data.study);
      setPath(data.path);

      const firstUnlocked =
        data.study.levels.find((l) => l.unlocked) ?? data.study.levels[0];
      setActiveRank((prev) => prev ?? firstUnlocked?.rank);
      setActiveItemId((prev) => prev ?? firstUnlocked?.items[0]?.id);
    } catch (err) {
      console.error("[study] getTrackStudy failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isLoaded, isSignedIn, userId]);

  const handleReassess = () => {
    console.log("[study] sending user to retake diagnostic before reassessing");
    navigate(`/tracks/${slug}/quiz?reassess=1`);
  };

  if (!isLoaded || !isSignedIn || !userId)
    return <LoadingScreen label="Preparing your learning path…" />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ink)] text-sm text-[var(--text-muted)]">
        Loading your path…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--ink)] text-center px-6">
        <p className="text-sm text-[#e08a8a]">
          Couldn't load your path: {error}
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

  const activeLevel = study.levels.find((l) => l.rank === activeRank);
  const activeItem = activeLevel?.items.find((i) => i.id === activeItemId);

  return (
    <div className="min-h-screen bg-[var(--ink)]">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-8 py-5">
        <button
          onClick={() => navigate("/dashboard")}
          className="font-display text-lg font-medium text-[var(--text-ink-strong)]"
        >
          LearnPath AI
        </button>
      </header>

      {/* Level tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-4 sm:px-8">
        <div className="flex max-w-full gap-2 overflow-x-auto">
          {study.levels.map((level) => (
            <button
              key={level.rank}
              disabled={!level.unlocked}
              onClick={() => {
                setActiveRank(level.rank);
                setActiveItemId(level.items[0]?.id);
              }}
              className={`flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeRank === level.rank
                  ? "border-b-2 border-[var(--waypoint)] text-[var(--text-ink-strong)]"
                  : level.unlocked
                    ? "text-[var(--text-muted)] hover:text-[var(--text-ink-strong)]"
                    : "cursor-not-allowed text-[var(--text-muted)] opacity-40"
              }`}
            >
              {!level.unlocked && (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                  <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3H9z" />
                </svg>
              )}

              {level.levelName}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowPath(true)} className="rounded-md border border-[var(--line)] bg-[var(--ink-raised)] px-4 py-2.5 text-sm font-medium text-[var(--text-ink-strong)] hover:border-[var(--waypoint)]">
            See my path
          </button>
          <button onClick={handleReassess} className="text-sm font-medium text-[var(--waypoint)] hover:text-[var(--waypoint-strong)]">
            Reassess path →
          </button>
        </div>
      </div>
      {showPath && <LearningPathModal path={path} onClose={() => setShowPath(false)} />}

      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_260px] gap-8 px-8 py-10">
        {/* Section content */}
        <main>
          {activeItem?.section ? (
            <>
              <h1 className="font-display text-2xl font-medium text-[var(--text-ink-strong)]">
                {activeItem.section.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {activeItem.section.description}
              </p>

              {Array.isArray(activeItem.section.learningObjectives) &&
                activeItem.section.learningObjectives.length > 0 && (
                  <div className="mt-6 rounded-md border border-[var(--line)] bg-[var(--ink-raised)] p-5">
                    <h2 className="font-display text-sm font-medium text-[var(--text-ink-strong)]">
                      You'll learn to
                    </h2>
                    <ul className="mt-3 space-y-2">
                      {activeItem.section.learningObjectives.map((obj, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-sm text-[var(--text)]"
                        >
                          <span className="text-[var(--waypoint)]">›</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {activeItem.section.videos.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-sm font-medium text-[var(--text-ink-strong)]">
                    Videos
                  </h2>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {activeItem.section.videos.map((v) => (
                      <YoutubeCard key={v.id} video={v} />
                    ))}
                  </div>
                </div>
              )}

              {activeItem.section.resources.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-sm font-medium text-[var(--text-ink-strong)]">
                    Resources
                  </h2>
                  <div className="mt-3 space-y-2">
                    {activeItem.section.resources.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-md border border-[var(--line)] px-4 py-3 text-sm hover:border-[var(--waypoint)]"
                      >
                        <div>
                          <p className="font-medium text-[var(--text-ink-strong)]">
                            {r.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                            {r.source}
                          </p>
                        </div>
                        <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                          {r.type}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={() =>
                    navigate(
                      `/tracks/${slug}/sections/${activeItem.section.id}/quiz`,
                    )
                  }
                  className="rounded-md bg-[var(--waypoint)] px-5 py-2.5 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)]"
                >
                  Take section quiz
                </button>
                {activeItem.progress.completed && (
                  <span className="text-sm text-[var(--mint)]">
                    ✓ Passed
                    {activeItem.progress.bestScore
                      ? ` — best ${Math.round(activeItem.progress.bestScore)}%`
                      : ""}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-md border border-[var(--line)] bg-[var(--ink-raised)] p-6">
              <h1 className="font-display text-xl font-medium text-[var(--text-ink-strong)]">
                {activeItem?.course.title}
              </h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {activeItem?.reason}
              </p>
            </div>
          )}
        </main>

        <aside className="h-fit rounded-md border border-[var(--line)] bg-[var(--ink-raised)] p-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Sections
          </h2>
          <ul className="mt-3 space-y-1">
            {activeLevel?.items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItemId(item.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                    activeItemId === item.id
                      ? "bg-[var(--ink)] text-[var(--text-ink-strong)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-ink-strong)]"
                  }`}
                >
                  <span
                    className={
                      item.progress.completed
                        ? "text-[var(--mint)]"
                        : "text-[var(--text-muted)]"
                    }
                  >
                    {item.progress.completed ? "✓" : "○"}
                  </span>
                  {item.section?.title ?? item.course.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
