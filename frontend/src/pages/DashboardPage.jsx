import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { getTracks } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

const CARD_STYLES = [
  { border: "#7062e8", glow: "rgba(112, 98, 232, 0.22)", tag: "#aaa1ff" },
  { border: "#25b99a", glow: "rgba(37, 185, 154, 0.20)", tag: "#74e2c9" },
  { border: "#db7a55", glow: "rgba(219, 122, 85, 0.20)", tag: "#ffae8b" },
  { border: "#4b9fe1", glow: "rgba(75, 159, 225, 0.20)", tag: "#8dcbff" },
  { border: "#c77ac4", glow: "rgba(199, 122, 196, 0.20)", tag: "#efafeb" },
  { border: "#d6a542", glow: "rgba(214, 165, 66, 0.20)", tag: "#f4cf7d" },
];

export default function DashboardPage() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTracks = async () => {
      if (!isLoaded || !isSignedIn || !userId) return;
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
  }, [getToken, isLoaded, isSignedIn, userId]);

  if (!isLoaded || !isSignedIn || !userId) {
    return <LoadingScreen label="Preparing your learning space…" />;
  }

  return (
    <div className="min-h-screen bg-[var(--ink)]">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-8 py-5">
        <span className="font-display text-lg font-medium text-[var(--text-ink-strong)]">
          LearnPath AI
        </span>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <section className="relative overflow-hidden rounded-2xl border border-[#39355b] bg-[#24243b] px-6 py-9 sm:px-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7062e8]/25 blur-3xl" />
          <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-[var(--waypoint)]/15 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#aaa1ff]">
              Your adaptive learning workspace
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium text-[var(--text-ink-strong)] sm:text-4xl">
          Welcome, {user?.firstName || "there"}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#bab8cf]">
              Choose a direction and let AI shape a learning path around what you already know.
            </p>
          </div>
        </section>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-medium text-[var(--text-ink-strong)]">Explore your next skill</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Start with a track that matches your goals.</p>
          </div>
          <span className="hidden rounded-full border border-[var(--line)] bg-[var(--ink-raised)] px-3 py-1.5 text-xs text-[var(--text-muted)] sm:block">
            {tracks.length} learning tracks
          </span>
        </div>

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
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {tracks.map((track, index) => {
              const style = CARD_STYLES[index % CARD_STYLES.length];
              return (
              <button
                key={track.id}
                onClick={() => navigate(`/tracks/${track.slug}${track.hasLearningPath ? "/study" : ""}`)}
                style={{ borderColor: style.border, boxShadow: `inset 0 1px 0 rgba(255,255,255,.05), 0 14px 32px ${style.glow}` }}
                className="group flex min-h-56 flex-col items-start rounded-xl border bg-[var(--ink-raised)] p-6 text-left transition duration-200 hover:-translate-y-1 hover:bg-[#272d41]"
              >
                <span style={{ color: style.tag }} className="rounded-full bg-black/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide">
                  AI-guided track
                </span>
                <h2 className="mt-4 font-display text-lg font-medium text-[var(--text-ink-strong)]">
                  {track.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] text-justify">
                  {track.description}
                </p>
                <span className="mt-4 text-xs text-[var(--text-muted)]">
                  {track._count?.courses ?? 0} course levels
                </span>
                <span style={{ color: style.tag }} className="mt-auto pt-5 text-sm font-medium">
                  Build my path →
                </span>
              </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
