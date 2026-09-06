import PathTrail from "../components/PathTrail";

// Shared split-screen frame for sign-in / sign-up: the path illustration
// on one side, the Clerk form on the other. `children` is the form.
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[380px] shrink-0 flex-col justify-between bg-[var(--ink-raised)] px-10 py-12 lg:flex">
        <div>
          <span className="font-display text-lg font-medium text-[var(--text-ink-strong)]">
            LearnPath AI
          </span>
          <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-[var(--text-muted)]">
            A focused, AI-guided path built around what you already know.
          </p>
        </div>
        <div className="flex-1 py-8">
          <PathTrail />
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-[var(--paper)] px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-display text-lg font-medium text-[var(--text-paper)]">
              LearnPath AI
            </span>
          </div>
          <h1 className="font-display text-2xl font-medium text-[var(--text-paper)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[var(--text-paper-muted)]">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
