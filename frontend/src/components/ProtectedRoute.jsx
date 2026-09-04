import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

// Gate for authenticated-only pages. While Clerk is still figuring out
// whether a session exists, render nothing rather than flashing sign-in.
export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  return children;
}
