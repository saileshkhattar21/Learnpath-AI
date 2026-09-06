export default function LoadingScreen({ message = "Loading…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[var(--ink)]">
      <div className="flex items-end gap-2" role="status" aria-label={message}>
        <span
          className="loading-dot h-2.5 w-2.5 rounded-full bg-[var(--waypoint)]"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="loading-dot h-2.5 w-2.5 rounded-full bg-[var(--waypoint)]"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="loading-dot h-2.5 w-2.5 rounded-full bg-[var(--waypoint)]"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}
