import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import CreateTeamPage from "../pages/CreateTeamPage";
import JoinTeamPage from "../pages/JoinTeamPage";
import JoinWithInputPage from "../pages/JoinWithInputPage";
import MembersPage from "../pages/MembersPage";
import ChannelPage from "../pages/ChannelPage";
import TaskBoardPage from "../pages/TaskBoardPage";
import CreateChannelModal from "../components/CreateChannelModal";

// ─── AuthRoutes ────────────────────────────────────────────────────────────────
// All routes rendered while authenticated. Receives state + handlers from App.jsx
// so the route tree stays declarative and the logic stays in one place.

export default function AuthRoutes({
  // Teams
  teams,
  activeTeamId,
  onSelectTeam,
  onCreateTeam,
  handleTeamCreated,
  handleJoined,
  // Channels
  channels,
  channelsLoading,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onRenameChannel,
  // Channel modal
  showChannelModal,
  activeChannelCreated,
  onCloseChannelModal,
  // Misc
  isAdmin,
  refetchTeams,
  refetchChannels,
  onDeleteTeam,
  onRenameTeam,
}) {
  return (
    <>
      <Routes>
        {/* ── Team management (outside AppLayout) ─────────────────────────── */}
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

        {/* ── Main shell: AppLayout + nested content ───────────────────────── */}
        <Route
          path="/*"
          element={
            <AppLayout
              teams={teams}
              activeTeamId={activeTeamId}
              onSelectTeam={onSelectTeam}
              onCreateTeam={onCreateTeam}
              channels={channels}
              activeChannelId={activeChannelId}
              onSelectChannel={onSelectChannel}
              onCreateChannel={onCreateChannel}
              onRenameChannel={onRenameChannel}
              onDeleteTeam={onDeleteTeam}
              onRenameTeam={onRenameTeam}
              isAdmin={isAdmin}
              channelsLoading={channelsLoading}
              refetchTeams={refetchTeams}
              refetchChannels={refetchChannels}
            />
          }
        >
          {/* These render inside AppLayout's <Outlet /> */}
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

      {/* Create Channel modal — outside Routes so it overlays everything */}
      {showChannelModal && activeTeamId && (
        <CreateChannelModal
          teamId={activeTeamId}
          onCreated={activeChannelCreated}
          onClose={onCloseChannelModal}
        />
      )}
    </>
  );
}
