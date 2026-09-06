import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

// Gate for authenticated-only pages. While Clerk is still figuring out
// whether a session exists, keep the app in a loading state. This prevents
// API-backed pages from mounting before Clerk can provide a session token.
export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();

  if (!isLoaded) return <LoadingScreen label="Signing you in securely…" />;
  if (!isSignedIn || !userId) return <Navigate to="/sign-in" replace />;

  return children;
}
