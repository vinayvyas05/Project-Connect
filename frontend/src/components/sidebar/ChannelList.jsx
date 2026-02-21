import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { initials } from "./TeamSidebar";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name }) {
  const colours = [
    "bg-indigo-600",
    "bg-violet-600",
    "bg-sky-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
  ];
  const colour = colours[(name?.charCodeAt(0) || 0) % colours.length];
  return (
    <div
      className={`w-7 h-7 ${colour} rounded-full flex items-center justify-center text-xs font-semibold text-white select-none shrink-0`}
    >
      {initials(name)}
    </div>
  );
}

// ─── UserFooter ───────────────────────────────────────────────────────────────

function UserFooter() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="border-t border-gray-800 px-3 py-3 flex items-center gap-2">
      <Avatar name={user?.name} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-200 truncate">
          {user?.name}
        </p>
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
      </div>
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        title="Log out"
        className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── ChannelList ──────────────────────────────────────────────────────────────

export default function ChannelList({
  team,
  channels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const membersPath = team ? `/teams/${team._id}/members` : null;
  const membersActive = membersPath && location.pathname === membersPath;

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      {/* Team name header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <h2 className="font-semibold text-white truncate text-sm">
          {team ? team.name : "Select a team"}
        </h2>
        <p className="text-gray-500 text-xs mt-0.5">
          {team ? "Workspace" : "—"}
        </p>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {team ? (
          <>
            {/* Channels section */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Channels
                </span>
                <button
                  onClick={onCreateChannel}
                  title="New channel"
                  className="text-gray-500 hover:text-gray-200 transition-colors p-0.5 rounded"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
                </button>
              </div>

              {channels.length === 0 ? (
                <p className="text-gray-600 text-xs px-2 py-2">
                  No channels yet.
                </p>
              ) : (
                channels.map((ch) => (
                  <button
                    key={ch._id}
                    onClick={() => onSelectChannel(ch._id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors duration-100 text-left
                      ${
                        activeChannelId === ch._id
                          ? "bg-indigo-600/20 text-indigo-300"
                          : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                      }`}
                  >
                    <span className="text-gray-500">#</span>
                    <span className="truncate">{ch.name}</span>
                  </button>
                ))
              )}
            </div>

            {/* Members shortcut */}
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 block mb-1">
                Team
              </span>
              <button
                onClick={() => navigate(membersPath)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors duration-100 text-left
                  ${
                    membersActive
                      ? "bg-indigo-600/20 text-indigo-300"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Members</span>
              </button>
              <button
                onClick={() => navigate(`/teams/${team._id}/tasks`)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors duration-100 text-left
                  ${
                    location.pathname === `/teams/${team._id}/tasks`
                      ? "bg-indigo-600/20 text-indigo-300"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <span>Tasks</span>
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-600 text-xs px-2 py-2">
            Pick a team from the left rail.
          </p>
        )}
      </div>

      <UserFooter />
    </aside>
  );
}
