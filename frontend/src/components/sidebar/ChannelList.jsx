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
    <aside className="w-64 flex flex-col shrink-0 glass-panel border-r-0 my-3 mx-3 rounded-2xl relative z-20 overflow-hidden shadow-2xl">
      {/* Team name header */}
      <div className="px-5 py-5 border-b border-white/5 bg-white/[0.02]">
        {renamingTeam ? (
          <div className="animate-fade-in">
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
              className="w-full bg-white/5 border border-indigo-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all font-medium"
            />
            {teamRenameError && (
              <p className="text-[10px] text-red-400 mt-1.5 px-1 font-medium italic">
                {teamRenameError}
              </p>
            )}
            <p className="text-[10px] text-gray-500 mt-1.5 px-1 uppercase tracking-tighter opacity-70">
              Enter to save • Esc to cancel
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col min-w-0">
              <h2 className="font-bold text-white truncate text-base tracking-tight">
                {team ? team.name : "Select a team"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {team ? "Active Workspace" : "Offline"}
                </p>
              </div>
            </div>

            {/* Owner action buttons */}
            {isOwner && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={startTeamRename}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all text-[11px] font-bold border border-white/5 active:scale-95 group"
                >
                  <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                  </svg>
                  Rename
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-red-500/5 hover:bg-red-500/20 text-red-400/80 hover:text-red-400 rounded-xl transition-all text-[11px] font-bold border border-red-500/10 active:scale-95 group"
                >
                  <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto pt-5 pb-3 px-3 space-y-7 custom-scrollbar">
        {team ? (
          channelsLoading ? (
            // ── Channel list skeleton ──────────────────────────────────────
            <div className="px-2 space-y-6">
              <div>
                <div className="h-2 w-16 bg-white/5 rounded-full animate-pulse mb-4" />
                <div className="space-y-3">
                  {[75, 55, 85, 65].map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-white/5 rounded-full animate-pulse shrink-0" />
                      <div className="h-2.5 bg-white/5 rounded-full animate-pulse" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Channels section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                      Channels
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
                      {channels.length}/{MAX_CHANNELS}
                    </span>
                  </div>
                  <button
                    onClick={atLimit ? undefined : onCreateChannel}
                    disabled={atLimit}
                    className={`p-1 rounded-lg transition-all ${
                      atLimit
                        ? "text-gray-700 cursor-not-allowed"
                        : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-0.5">
                  {channels.length === 0 ? (
                    <p className="text-gray-600 text-[11px] font-medium px-3 italic">
                      No channels yet...
                    </p>
                  ) : (
                    channels.map((ch) => (
                      <div key={ch._id} className="group/ch relative px-1">
                        {renamingId === ch._id ? (
                          <div className="px-2 py-2">
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
                              className="w-full bg-white/5 border border-indigo-500/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none font-medium"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => onSelectChannel(ch._id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left border relative group
                            ${
                              activeChannelId === ch._id
                                ? "bg-indigo-500/[0.08] border-indigo-500/20 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                                : "text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/[0.03] hover:border-white/5"
                            }`}
                          >
                            <span className={`transition-colors duration-200 ${
                              activeChannelId === ch._id ? "text-indigo-400" : "text-gray-600 group-hover:text-gray-400"
                            }`}>#</span>
                            <span className="truncate flex-1 font-medium">{ch.name}</span>

                            {isAdmin && (
                              <span
                                role="button"
                                tabIndex={0}
                                title="Rename channel"
                                onClick={(e) => startRename(ch, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:text-white text-gray-500 shrink-0 hover:bg-white/10"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                                </svg>
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Navigation section */}
              <div className="space-y-4 pt-2">
                <div className="px-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                    Collaboration
                  </span>
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => navigate(membersPath)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 text-left border
                    ${
                      membersActive
                        ? "bg-indigo-500/[0.08] border-indigo-500/20 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/[0.03] hover:border-white/5"
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 transition-colors ${membersActive ? 'text-indigo-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Members</span>
                  </button>
                  <button
                    onClick={() => navigate(`/teams/${team._id}/tasks`)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 text-left border
                    ${
                      location.pathname === `/teams/${team._id}/tasks`
                        ? "bg-indigo-500/[0.08] border-indigo-500/20 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/[0.03] hover:border-white/5"
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 transition-colors ${location.pathname === `/teams/${team._id}/tasks` ? 'text-indigo-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="font-medium">Tasks</span>
                  </button>
                </div>
              </div>
            </>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
             </div>
             <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
               Pick a team <br/> to get started
             </p>
          </div>
        )}
      </div>

      {/* User Footer with glass look */}
      <div className="mt-auto p-4 bg-white/[0.02] border-t border-white/5">
        <UserFooter />
      </div>

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


