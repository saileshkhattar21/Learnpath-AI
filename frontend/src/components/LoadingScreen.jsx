export default function LoadingScreen({ label = "Preparing your workspace…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--ink)] px-6 text-center">
      <span
        className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--waypoint)]"
        aria-hidden="true"
      />
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
