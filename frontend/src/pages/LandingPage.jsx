import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import PathTrail from "../components/PathTrail";

export default function LandingPage() {
  return (
    <>
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      <SignedOut>
        <div className="flex min-h-screen">
          <div className="flex flex-1 flex-col justify-center px-8 py-16 sm:px-16">
            <span className="font-display text-lg font-medium text-[var(--text-ink-strong)]">
              LearnPath AI
            </span>
            <h1 className="mt-6 max-w-lg font-display text-4xl font-medium leading-tight text-[var(--text-ink-strong)] sm:text-5xl">
              Learn what you don't know yet.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--text-muted)]">
              Pick a track, tell us what you already know, and get a path
              built from real course material — not a generic syllabus.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/sign-up"
                className="rounded-md bg-[var(--waypoint)] px-5 py-2.5 text-sm font-medium text-[#1c1a12] hover:bg-[var(--waypoint-strong)]"
              >
                Get started
              </Link>
              <Link
                to="/sign-in"
                className="rounded-md border border-[var(--line)] px-5 py-2.5 text-sm font-medium text-[var(--text-ink-strong)] hover:bg-[var(--ink-raised)]"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="hidden w-[320px] shrink-0 bg-[var(--ink-raised)] py-16 lg:block">
            <PathTrail />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
