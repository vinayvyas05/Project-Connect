import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { initials } from "./TeamSidebar";
import { channelService } from "../../api/channels/channel.service";
import { teamService } from "../../api/teams/team.service";

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

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirmModal({ teamName, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-page-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Delete team</h3>
            <p className="text-gray-500 text-xs">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to delete <strong className="text-white">{teamName}</strong>?
          All channels, messages, tasks, and members will be permanently removed.
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete team"}
          </button>
        </div>
      </div>
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
  onRenameChannel, // () => void  — triggers refetchChannels in parent
  onDeleteTeam,    // () => void  — called after team is deleted
  onRenameTeam,    // () => void  — called after team is renamed (refetchTeams)
  isAdmin, // bool — only admins can rename
  channelsLoading, // bool — shows skeleton while channels are fetching
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isOwner = !!(
    team &&
    user &&
    String(team.ownerId) === String(user._id)
  );

  useEffect(() => {
    console.log("ChannelList debug:", {
      teamId: team?._id,
      teamOwner: team?.ownerId,
      userId: user?._id,
      isOwner
    });
  }, [team, user, isOwner]);

  const MAX_CHANNELS = 10;
  const atLimit = channels.length >= MAX_CHANNELS;

  const [renamingTeam, setRenamingTeam] = useState(false);
  const [teamRenameValue, setTeamRenameValue] = useState("");
  const [teamRenameError, setTeamRenameError] = useState("");
  const [teamRenameLoading, setTeamRenameLoading] = useState(false);
  const teamInputRef = useRef(null);

  // ── Team delete state ───────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const startTeamRename = () => {
    setRenamingTeam(true);
    setTeamRenameValue(team?.name || "");
    setTeamRenameError("");
    setTimeout(() => teamInputRef.current?.select(), 30);
  };

  const cancelTeamRename = () => {
    setRenamingTeam(false);
    setTeamRenameError("");
  };

  const commitTeamRename = async () => {
    const trimmed = teamRenameValue.trim();
    if (!trimmed || trimmed === team?.name) {
      cancelTeamRename();
      return;
    }
    setTeamRenameLoading(true);
    setTeamRenameError("");
    try {
      await teamService.renameTeam(team._id, trimmed);
      setRenamingTeam(false);
      onRenameTeam?.();
    } catch (err) {
      setTeamRenameError(err?.response?.data?.message ?? "Could not rename team.");
    } finally {
      setTeamRenameLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    setDeleteLoading(true);
    try {
      await teamService.deleteTeam(team._id);
      setShowDeleteConfirm(false);
      navigate("/");
      onDeleteTeam?.();
    } catch (err) {
      console.error("Delete team error:", err);
      setDeleteLoading(false);
    }
  };

  // ── Inline channel rename state ─────────────────────────────────────────
  const [renamingId, setRenamingId] = useState(null); // channel _id being renamed
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const inputRef = useRef(null);

  const startRename = (ch, e) => {
    e.stopPropagation();
    setRenamingId(ch._id);
    setRenameValue(ch.name);
    setRenameError("");
    setTimeout(() => inputRef.current?.select(), 30);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameError("");
  };

  const commitRename = async (ch) => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === ch.name) {
      cancelRename();
      return;
    }
    setRenameLoading(true);
    setRenameError("");
    try {
      await channelService.renameChannel(team._id, ch._id, trimmed);
      setRenamingId(null);
      onRenameChannel?.(); // refetch sidebar channels
    } catch (err) {
      setRenameError(
        err?.response?.data?.message ?? "Could not rename channel.",
      );
    } finally {
      setRenameLoading(false);
    }
  };

  const membersPath = team ? `/teams/${team._id}/members` : null;
  const membersActive = membersPath && location.pathname === membersPath;

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      {/* Team name header */}
      <div className="px-4 py-4 border-b border-gray-800">
        {renamingTeam ? (
          <div>
            <input
              ref={teamInputRef}
              value={teamRenameValue}
              onChange={(e) => setTeamRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTeamRename();
                if (e.key === "Escape") cancelTeamRename();
              }}
              onBlur={() => commitTeamRename()}
              disabled={teamRenameLoading}
              placeholder="Team name"
              className="w-full bg-gray-800 border border-indigo-500 rounded-md px-2 py-1 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            {teamRenameError && (
              <p className="text-xs text-red-400 mt-1 px-1">{teamRenameError}</p>
            )}
            <p className="text-xs text-gray-600 mt-1 px-1">
              Enter to save · Esc to cancel
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="min-w-0">
              <h2 className="font-semibold text-white truncate text-base">
                {team ? team.name : "Select a team"}
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                {team ? "Workspace" : "—"}
              </p>
            </div>

            {/* Owner action buttons */}
            {isOwner && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={startTeamRename}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md transition-colors text-xs font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                  </svg>
                  Rename Team
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-md transition-colors text-xs font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Team
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {team ? (
          channelsLoading ? (
            // ── Channel list skeleton ──────────────────────────────────────
            <div className="px-2 space-y-5">
              <div>
                <div className="h-2.5 w-16 bg-gray-800 rounded animate-pulse mb-3" />
                <div className="space-y-1">
                  {[75, 55, 85, 65].map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-1.5"
                    >
                      <div className="w-3 h-3 bg-gray-800 rounded-full animate-pulse shrink-0" />
                      <div
                        className="h-3 bg-gray-800 rounded-md animate-pulse"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-2.5 w-10 bg-gray-800 rounded animate-pulse mb-3" />
                <div className="space-y-1">
                  {[70, 60].map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-1.5"
                    >
                      <div className="w-4 h-4 bg-gray-800 rounded animate-pulse shrink-0" />
                      <div
                        className="h-3 bg-gray-800 rounded-md animate-pulse"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Channels section */}
              <div>
                <div className="flex items-center justify-between px-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Channels
                    </span>
                    {/* Count badge */}
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        atLimit
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {channels.length}/{MAX_CHANNELS}
                    </span>
                  </div>
                  <button
                    onClick={atLimit ? undefined : onCreateChannel}
                    disabled={atLimit}
                    title={
                      atLimit
                        ? `Channel limit reached (${MAX_CHANNELS}/${MAX_CHANNELS})`
                        : "New channel"
                    }
                    className={`p-0.5 rounded transition-colors ${
                      atLimit
                        ? "text-gray-700 cursor-not-allowed"
                        : "text-gray-500 hover:text-gray-200"
                    }`}
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
                    <div key={ch._id} className="group/ch relative">
                      {renamingId === ch._id ? (
                        // ── Inline rename input ──────────────────────────────
                        <div className="px-2 py-1">
                          <input
                            ref={inputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename(ch);
                              if (e.key === "Escape") cancelRename();
                            }}
                            onBlur={() => commitRename(ch)}
                            disabled={renameLoading}
                            placeholder="channel-name"
                            className="w-full bg-gray-800 border border-indigo-500 rounded-md px-2 py-1 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                          />
                          {renameError && (
                            <p className="text-xs text-red-400 mt-1 px-1">
                              {renameError}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-1 px-1">
                            Enter to save · Esc to cancel
                          </p>
                        </div>
                      ) : (
                        // ── Normal channel row ───────────────────────────────
                        <button
                          onClick={() => onSelectChannel(ch._id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors duration-100 text-left
                          ${
                            activeChannelId === ch._id
                              ? "bg-indigo-600/20 text-indigo-300"
                              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                          }`}
                        >
                          <span className="text-gray-500">#</span>
                          <span className="truncate flex-1">{ch.name}</span>

                          {/* Pencil — admin only, appears on hover */}
                          {isAdmin && (
                            <span
                              role="button"
                              tabIndex={0}
                              title="Rename channel"
                              onClick={(e) => startRename(ch, e)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && startRename(ch, e)
                              }
                              className="opacity-0 group-hover/ch:opacity-100 transition-opacity p-0.5 rounded hover:text-white text-gray-500 shrink-0"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z"
                                />
                              </svg>
                            </span>
                          )}
                        </button>
                      )}
                    </div>
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
          )
        ) : (
          <p className="text-gray-600 text-xs px-2 py-2">
            Pick a team from the left rail.
          </p>
        )}
      </div>

      <UserFooter />

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          teamName={team?.name}
          onConfirm={handleDeleteTeam}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleteLoading}
        />
      )}
    </aside>
  );
}

