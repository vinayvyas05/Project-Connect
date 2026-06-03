import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

// ─── Welcome screen shown when no team or no channel is selected ──────────────

function WelcomeState({
  hasTeam,
  hasChannels,
  onCreateChannel,
  onCreateTeam,
  isAdmin,
}) {
  if (!hasTeam) {
    // ── Step 1: Pick a team ────────────────────────────────────────────────
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent)",
            top: "20%",
            left: "30%",
          }}
        />

        {/* Arrow pointing left at the team rail */}
        <div className="absolute left-20 top-1/2 -translate-y-1/2 flex items-center gap-2 animate-bounce-x">
          <svg
            className="w-6 h-6 text-indigo-500 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-xs text-indigo-400 opacity-60 font-medium">
            start here
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-sm">
          {/* Icon */}
          <img 
            src="/kanvo.svg" 
            alt="Kanvo Logo" 
            className="w-20 h-20 mb-6 shrink-0 rounded-3xl shadow-xl"
          />

          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Welcome to Kanvo
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Select a team from the left rail to get started, or create a new
            one.
          </p>

          {/* Steps */}
          <div className="w-full space-y-3 mb-8 text-left">
            {[
              {
                n: "1",
                label: "Pick a team",
                sub: "Click a team icon on the far left",
              },
              {
                n: "2",
                label: "Choose a channel",
                sub: "Select a channel from the sidebar",
              },
              {
                n: "3",
                label: "Start collaborating",
                sub: "Chat, manage tasks, and invite members",
              },
            ].map(({ n, label, sub }) => (
              <div
                key={n}
                className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
              >
                <span
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5 bg-primary"
                >
                  {n}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onCreateTeam}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all bg-primary hover:bg-primary-hover shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create a new team
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Pick a channel ───────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="flex flex-col items-center max-w-xs">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-sm">
          <svg
            className="w-8 h-8 text-primary"
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

        <h3 className="text-text-primary font-semibold text-lg mb-1">
          {hasChannels ? "Pick a channel" : "No channels yet"}
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          {hasChannels
            ? "Select a channel from the sidebar to start chatting with your team."
            : "Your team doesn't have any channels yet. Create one to get the conversation started."}
        </p>

        {!hasChannels && isAdmin && (
          <button
            onClick={onCreateChannel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create first channel
          </button>
        )}
      </div>
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
  onRenameChannel = () => {},
  onDeleteTeam,
  onRenameTeam,
  isAdmin = false,
  channelsLoading = false,
}) {
  const location = useLocation();
  // Show WelcomeState only on the bare "/" path — any nested route hides it
  const isRootPath = location.pathname === "/";
  const hasTeam = !!activeTeamId;
  const hasChannels = channels.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-background)] relative">

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
        onRenameChannel={onRenameChannel}
        onDeleteTeam={onDeleteTeam}
        onRenameTeam={onRenameTeam}
        isAdmin={isAdmin}
        channelsLoading={channelsLoading}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Outlet />
        {isRootPath && (
          <WelcomeState
            hasTeam={hasTeam}
            hasChannels={hasChannels}
            onCreateTeam={onCreateTeam}
            onCreateChannel={onCreateChannel}
            isAdmin={isAdmin}
          />
        )}
      </main>
    </div>
  );
}

