import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/ProtectedRoute";
import App from "../App";

// ─── AppRoutes ─────────────────────────────────────────────────────────────────
// Top-level route tree: public pages + the protected authenticated shell.
// Everything inside ProtectedRoute requires a valid JWT token.

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Protected shell ─────────────────────────────────────────────────── */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />

      {/* ── 404 fallback ────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
