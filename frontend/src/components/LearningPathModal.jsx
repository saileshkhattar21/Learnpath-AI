export default function LearningPathModal({ path, onClose, onStartStudying }) {
  if (!path) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="learning-path-title">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--ink-raised)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-[var(--waypoint)]">Your AI learning path</p>
            <h2 id="learning-path-title" className="mt-2 font-display text-2xl font-medium text-[var(--text-ink-strong)]">A focused route forward</h2>
          </div>
          <button onClick={onClose} aria-label="Close path" className="text-lg text-[var(--text-muted)]">×</button>
        </div>
        {path.summary && <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">{path.summary}</p>}
        {path.recommendedStartingPoint && <p className="mt-4 rounded-md border border-[var(--line)] p-3 text-sm text-[var(--text-ink-strong)]">Start with: <span className="text-[var(--waypoint)]">{path.recommendedStartingPoint}</span></p>}
        <ol className="mt-6 space-y-3">
          {path.items?.map((item) => (
            <li key={item.id} className="rounded-md border border-[var(--line)] p-4">
              <p className="text-xs text-[var(--waypoint)]">Step {item.position} · {item.course?.level?.name}</p>
              <h3 className="mt-1 text-sm font-medium text-[var(--text-ink-strong)]">{item.section?.title || item.course?.title}</h3>
              {item.section && <p className="mt-1 text-xs text-[var(--text-muted)]">{item.course?.title}</p>}
              {item.reason && <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.reason}</p>}
            </li>
          ))}
        </ol>
        {onStartStudying && <button onClick={onStartStudying} className="mt-6 w-full rounded-md bg-[var(--waypoint)] px-5 py-3 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)]">Start studying →</button>}
      </div>
    </div>
  );
}
