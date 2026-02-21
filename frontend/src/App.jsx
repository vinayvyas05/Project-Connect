import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateTeamPage from "./pages/CreateTeamPage";
import JoinTeamPage from "./pages/JoinTeamPage";
import MembersPage from "./pages/MembersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useTeams } from "./hooks/useTeams";
import { useChannels } from "./hooks/useChannels";

function AuthenticatedApp() {
  const navigate = useNavigate();

  // ── Teams ──────────────────────────────────────────────────────────────────
  const { teams, refetch: refetchTeams } = useTeams();
  const [activeTeamId, setActiveTeamId] = useState(null);

  // ── Channels ───────────────────────────────────────────────────────────────
  const { channels, refetch: refetchChannels } = useChannels(activeTeamId);
  const [activeChannelId, setActiveChannelId] = useState(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectTeam = (teamId) => {
    setActiveTeamId(teamId);
    setActiveChannelId(null);
  };

  const handleSelectChannel = (channelId) => {
    setActiveChannelId(channelId);
    navigate(`/channels/${channelId}`);
  };

  const handleCreateTeam = () => navigate("/teams/new");

  const handleJoined = () => {
    refetchTeams();
    navigate("/");
  };

  const handleCreateChannel = () => {
    // TODO: open create-channel modal in Phase 3
    console.log("Create channel clicked for team:", activeTeamId);
  };

  // Refetch after returning from CreateTeamPage
  const handleTeamCreated = () => {
    refetchTeams();
    navigate("/");
  };

  return (
    <Routes>
      {/* Create team — rendered inside the protected shell but outside AppLayout */}
      <Route
        path="/teams/new"
        element={
          <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
            <CreateTeamPage onCreated={handleTeamCreated} />
          </div>
        }
      />

      <Route
        path="/join/:token"
        element={<JoinTeamPage onJoined={handleJoined} />}
      />

      {/* Main shell — all other protected routes */}
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
      >
        {/* Nested routes render inside AppLayout's <Outlet /> */}
        <Route path="teams/:teamId/members" element={<MembersPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
