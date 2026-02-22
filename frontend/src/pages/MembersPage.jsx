import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { teamService } from "../api/teams/team.service";
import { useAuth } from "../context/AuthContext";
import InviteLinkModal from "../components/InviteLinkModal";

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const styles = {
    admin: "bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
    member: "bg-gray-700/50 text-gray-400 border-gray-600/50",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${styles[role] ?? styles.member}`}
    >
      {role}
    </span>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({ member, isYou }) {
  // Backend populates 'userId' field (not 'user')
  const person = member.userId;
  const colours = [
    "bg-indigo-600",
    "bg-violet-600",
    "bg-sky-600",
    "bg-emerald-600",
    "bg-rose-600",
  ];
  const colour = colours[(person?.name?.charCodeAt(0) || 0) % colours.length];
  const initials = (person?.name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-colors">
      <div
        className={`w-9 h-9 ${colour} rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-200 truncate">
            {person?.name}
          </p>
          {isYou && <span className="text-xs text-gray-500">(you)</span>}
        </div>
        <p className="text-xs text-gray-500 truncate">{person?.email}</p>
      </div>
      <RoleBadge role={member.role} />
    </div>
  );
}

// ─── MembersPage ──────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { teamId } = useParams();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  // Backend returns flat array — check if logged-in user is admin
  const isAdmin = members.some(
    (m) => m.userId?._id === user?._id && m.role === "admin",
  );

  useEffect(() => {
    if (!teamId) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await teamService.getTeamMembers(teamId);
        // Backend returns a flat array directly, not { members: [] }
        setMembers(Array.isArray(data) ? data : (data.members ?? []));
      } catch (err) {
        setError(err.response?.data?.message ?? "Failed to load members.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teamId]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-950 px-6 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-gray-800 rounded-md animate-pulse" />
            <div className="h-3 w-16 bg-gray-800 rounded-md animate-pulse" />
          </div>
          <div className="h-9 w-20 bg-gray-800 rounded-lg animate-pulse" />
        </div>

        {/* Member rows skeleton */}
        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 animate-pulse"
            >
              <div className="w-9 h-9 bg-gray-800 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-gray-800 rounded-md" />
                <div className="h-2.5 w-40 bg-gray-800 rounded-md" />
              </div>
              <div className="h-5 w-14 bg-gray-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-gray-950 px-6 py-8 animate-page-in">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-white">Members</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors btn-press"
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
              Invite
            </button>
          )}
        </div>

        {/* Members list */}
        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {members.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">
              No members found.
            </p>
          ) : (
            <div className="divide-y divide-gray-800">
              {members.map((m) => (
                <MemberRow
                  key={m.userId?._id ?? m._id}
                  member={m}
                  isYou={m.userId?._id === user?._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteLinkModal teamId={teamId} onClose={() => setShowInvite(false)} />
      )}
    </>
  );
}
