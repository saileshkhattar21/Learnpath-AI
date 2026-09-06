import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TrackDetailPage from "./pages/TrackDetailPage";
import QuizPage from "./pages/QuizPage";
import StudyPage from "./pages/StudyPage";
import SectionQuizPage from "./pages/SectionQuixPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracks/:slug"
        element={
          <ProtectedRoute>
            <TrackDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracks/:slug/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracks/:slug/study"
        element={
          <ProtectedRoute>
            <StudyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracks/:slug/sections/:sectionId/quiz"
        element={
          <ProtectedRoute>
            <SectionQuizPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
