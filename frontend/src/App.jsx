import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTeams } from "./hooks/useTeams";
import { useChannels } from "./hooks/useChannels";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import AuthRoutes from "./routes/AuthRoutes";

// ─── App ───────────────────────────────────────────────────────────────────────
// Holds all authenticated state + handlers.
// Route definitions live in src/routes/AuthRoutes.jsx.

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  // ── Teams ────────────────────────────────────────────────────────────────────
  const { teams, refetch: refetchTeams } = useTeams();
  const [activeTeamId, setActiveTeamId] = useState(null);

  // Derive admin status: team owner = admin
  const activeTeam = teams.find((t) => t._id === activeTeamId) ?? null;
  const isAdmin = !!(activeTeam && user && activeTeam.ownerId === user._id);

  // ── Channels ─────────────────────────────────────────────────────────────────
  const {
    channels,
    loading: channelsLoading,
    refetch: refetchChannels,
  } = useChannels(activeTeamId);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [showChannelModal, setShowChannelModal] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSelectTeam = (teamId) => {
    setActiveTeamId(teamId);
    setActiveChannelId(null);
    navigate("/"); // clear any stale channel/page URL
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
    if (channels.length >= MAX_CHANNELS) return; // guard; button is also disabled in sidebar
    setShowChannelModal(true);
  };

  const handleChannelCreated = (newChannel) => {
    refetchChannels();
    setActiveChannelId(newChannel._id);
    navigate(`/channels/${newChannel._id}`);
    toast.success(`#${newChannel.name} is ready`, "Channel created");
  };

  const handleTeamCreated = () => {
    refetchTeams();
    navigate("/");
  };

  const handleDeleteTeam = () => {
    setActiveTeamId(null);
    setActiveChannelId(null);
    refetchTeams();
  };

  const handleRenameTeam = () => {
    refetchTeams();
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <AuthRoutes
      // Teams
      teams={teams}
      activeTeamId={activeTeamId}
      onSelectTeam={handleSelectTeam}
      onCreateTeam={handleCreateTeam}
      handleTeamCreated={handleTeamCreated}
      handleJoined={handleJoined}
      // Channels
      channels={channels}
      channelsLoading={channelsLoading}
      activeChannelId={activeChannelId}
      onSelectChannel={handleSelectChannel}
      onCreateChannel={handleCreateChannel}
      onRenameChannel={refetchChannels}
      // Channel modal
      showChannelModal={showChannelModal}
      activeChannelCreated={handleChannelCreated}
      onCloseChannelModal={() => setShowChannelModal(false)}
      // Misc
      isAdmin={isAdmin}
      refetchTeams={refetchTeams}
      refetchChannels={refetchChannels}
      onDeleteTeam={handleDeleteTeam}
      onRenameTeam={handleRenameTeam}
    />
  );
}
