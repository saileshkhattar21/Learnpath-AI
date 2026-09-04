import { useEffect, useState } from "react";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { getCurrentUser } from "../lib/api";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [backendUser, setBackendUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser(getToken)
      .then((data) => {
        if (!cancelled) setBackendUser(data.user);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

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

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-medium text-[var(--text-ink-strong)]">
          Welcome, {user?.firstName || "there"}.
        </h1>

        <div className="mt-10 rounded-md border border-[var(--line)] bg-[var(--ink-raised)] p-6">
          <h2 className="font-display text-base font-medium text-[var(--text-ink-strong)]">
            Account sync
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            This confirms the backend recognizes your Clerk session and has
            a matching record in the users table.
          </p>

          {loading && (
            <p className="mt-4 text-sm text-[var(--text-muted)]">Checking with the backend…</p>
          )}

          {error && (
            <p className="mt-4 text-sm text-[#e08a8a]">
              Couldn't reach the backend: {error}
            </p>
          )}

          {backendUser && (
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-[var(--text-muted)]">User ID</dt>
              <dd className="text-[var(--text)]">{backendUser.id}</dd>
              <dt className="text-[var(--text-muted)]">Clerk ID</dt>
              <dd className="text-[var(--text)]">{backendUser.auth_provider_id}</dd>
              <dt className="text-[var(--text-muted)]">Email</dt>
              <dd className="text-[var(--text)]">{backendUser.email || "—"}</dd>
            </dl>
          )}
        </div>

        <p className="mt-10 text-sm text-[var(--text-muted)]">
          Track selection and your personalized path land here next.
        </p>
      </main>
    </div>
  );
}
