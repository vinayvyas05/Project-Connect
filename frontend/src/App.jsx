import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useTeams } from "./hooks/useTeams";
import { useChannels } from "./hooks/useChannels";

// Inner component so hooks only run when user is authenticated
function AuthenticatedApp() {
  const navigate = useNavigate();

  // ── Teams ──────────────────────────────────────────────────────────────────
  const { teams, refetch: refetchTeams } = useTeams();
  const [activeTeamId, setActiveTeamId] = useState(null);

  // ── Channels (re-fetches whenever active team changes) ────────────────────
  const { channels, refetch: refetchChannels } = useChannels(activeTeamId);
  const [activeChannelId, setActiveChannelId] = useState(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectTeam = (teamId) => {
    setActiveTeamId(teamId);
    setActiveChannelId(null); // reset channel when switching teams
  };

  const handleSelectChannel = (channelId) => {
    setActiveChannelId(channelId);
    navigate(`/channels/${channelId}`);
  };

  // Placeholders — will open modals in Phase 3
  const handleCreateTeam = () => navigate("/teams/new");
  const handleCreateChannel = () => {
    // TODO: open create-channel modal in Phase 3
    console.log("Create channel clicked for team:", activeTeamId);
  };

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <AppLayout
            teams={teams}
            activeTeamId={activeTeamId}
            onSelectTeam={handleSelectTeam}
            onCreateTeam={handleCreateTeam}
            channels={channels}
            activeChannelId={activeChannelId}
            onSelectChannel={handleSelectChannel}
            onCreateChannel={handleCreateChannel}
            refetchTeams={refetchTeams}
            refetchChannels={refetchChannels}
          />
        }
      />
    </Routes>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected — hooks only run inside here */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
