import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

// Empty state shown when no channel is selected
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-white font-semibold text-lg mb-1">
        No channel selected
      </h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Pick a team from the left rail, then select a channel to start chatting.
      </p>
    </div>
  );
}

export default function AppLayout({
  teams = [],
  activeTeamId = null,
  onSelectTeam = () => {},
  onCreateTeam = () => {},
  channels = [],
  activeChannelId = null,
  onSelectChannel = () => {},
  onCreateChannel = () => {},
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      {/* Sidebar: team rail + channel list */}
      <Sidebar
        teams={teams}
        activeTeamId={activeTeamId}
        onSelectTeam={onSelectTeam}
        onCreateTeam={onCreateTeam}
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={onSelectChannel}
        onCreateChannel={onCreateChannel}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
        {!activeChannelId && <EmptyState />}
      </main>
    </div>
  );
}
