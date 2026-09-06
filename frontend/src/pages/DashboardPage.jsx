import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { getTracks } from "../lib/api";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTracks = async () => {
      try {
        console.log("[dashboard] fetching tracks");
        const data = await getTracks(getToken);
        console.log(`[dashboard] got ${data.tracks.length} tracks`);
        if (!cancelled) setTracks(data.tracks);
      } catch (err) {
        console.error("[dashboard] getTracks failed:", err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTracks();

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return (
    <div className="min-h-screen bg-[var(--ink)]">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-8 py-5">
        <span className="font-display text-lg font-medium text-[var(--text-ink-strong)]">
          LearnPath AI
        </span>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-3xl font-medium text-[var(--text-ink-strong)]">
          Welcome, {user?.firstName || "there"}.
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Pick a track to rate your existing skills and build a personalized
          path.
        </p>

        {loading && (
          <p className="mt-10 text-sm text-[var(--text-muted)]">
            Loading tracks…
          </p>
        )}

        {error && (
          <p className="mt-10 text-sm text-[#e08a8a]">
            Couldn't load tracks: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => navigate(`/tracks/${track.slug}`)}
                className="group flex flex-col items-start rounded-md border border-[var(--line)] bg-[var(--ink-raised)] p-6 text-left transition-colors hover:border-[var(--waypoint)]"
              >
                <h2 className="font-display text-lg font-medium text-[var(--text-ink-strong)]">
                  {track.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] text-justify">
                  {track.description}
                </p>
                <span className="mt-4 text-xs text-[var(--text-muted)]">
                  {track._count?.courses ?? 0} course levels
                </span>
                <span className="mt-4 text-sm font-medium text-[var(--waypoint)] group-hover:text-[var(--waypoint-strong)]">
                  Start →
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
