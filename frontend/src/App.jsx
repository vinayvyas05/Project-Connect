import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateTeamPage from "./pages/CreateTeamPage";
import JoinTeamPage from "./pages/JoinTeamPage";
import JoinWithInputPage from "./pages/JoinWithInputPage";
import MembersPage from "./pages/MembersPage";
import ChannelPage from "./pages/ChannelPage";
import TaskBoardPage from "./pages/TaskBoardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useTeams } from "./hooks/useTeams";
import { useChannels } from "./hooks/useChannels";
import CreateChannelModal from "./components/CreateChannelModal";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";

function AuthenticatedApp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  // ── Teams ──────────────────────────────────────────────────────────────────
  const { teams, refetch: refetchTeams } = useTeams();
  const [activeTeamId, setActiveTeamId] = useState(null);

  // Derive admin status: team owner = admin
  const activeTeam = teams.find((t) => t._id === activeTeamId) ?? null;
  const isAdmin = !!(activeTeam && user && activeTeam.ownerId === user._id);

  // ── Channels ───────────────────────────────────────────────────────────────
  const {
    channels,
    loading: channelsLoading,
    refetch: refetchChannels,
  } = useChannels(activeTeamId);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [showChannelModal, setShowChannelModal] = useState(false);

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

  const MAX_CHANNELS = 10;

  const handleCreateChannel = () => {
    if (!activeTeamId) return;
    if (channels.length >= MAX_CHANNELS) return; // already at limit; button is disabled in sidebar
    setShowChannelModal(true);
  };

  const handleChannelCreated = (newChannel) => {
    refetchChannels();
    setActiveChannelId(newChannel._id);
    navigate(`/channels/${newChannel._id}`);
    toast.success(`#${newChannel.name} is ready`, "Channel created");
  };

  // Refetch after returning from CreateTeamPage
  const handleTeamCreated = () => {
    refetchTeams();
    navigate("/");
  };

  return (
    <>
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

        <Route
          path="/join"
          element={
            <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
              <JoinWithInputPage onJoined={handleJoined} />
            </div>
          }
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
              onRenameChannel={refetchChannels}
              isAdmin={isAdmin}
              channelsLoading={channelsLoading}
              refetchTeams={refetchTeams}
              refetchChannels={refetchChannels}
            />
          }
        >
          {/* Nested routes render inside AppLayout's <Outlet /> */}
          <Route path="teams/:teamId/members" element={<MembersPage />} />
          <Route
            path="channels/:channelId"
            element={
              <ChannelPage channels={channels} activeTeamId={activeTeamId} />
            }
          />
          <Route path="teams/:teamId/tasks" element={<TaskBoardPage />} />
        </Route>
      </Routes>

      {/* Create Channel modal — rendered outside Routes so it overlays everything */}
      {showChannelModal && activeTeamId && (
        <CreateChannelModal
          teamId={activeTeamId}
          onCreated={handleChannelCreated}
          onClose={() => setShowChannelModal(false)}
        />
      )}
    </>
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
