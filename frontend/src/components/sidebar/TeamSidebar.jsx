// ─── Helpers ─────────────────────────────────────────────────────────────────

export function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── TeamSidebar ──────────────────────────────────────────────────────────────

export default function TeamSidebar({
  teams,
  activeTeamId,
  onSelect,
  onCreateTeam,
}) {
  return (
    <nav className="w-16 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-3 gap-2 shrink-0">
      {/* App logo */}
      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-2 shrink-0">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>

      <div className="w-8 h-px bg-gray-800 mb-1" />

      {/* One button per team */}
      {teams.map((team) => (
        <button
          key={team._id}
          onClick={() => onSelect(team._id)}
          title={team.name}
          className={`w-10 h-10 font-semibold text-sm transition-all duration-150 shrink-0
            ${
              activeTeamId === team._id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 rounded-2xl"
                : "bg-gray-800 text-gray-300 hover:bg-indigo-600/20 hover:text-indigo-300 hover:rounded-2xl rounded-xl"
            }`}
        >
          {initials(team.name)}
        </button>
      ))}

      {/* Create / join team */}
      <button
        onClick={onCreateTeam}
        title="Create or join a team"
        className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 hover:bg-emerald-600/20 hover:text-emerald-400 hover:rounded-2xl transition-all duration-150 flex items-center justify-center shrink-0"
      >
        <svg
          className="w-5 h-5"
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

      <div className="flex-1" />
    </nav>
  );
}
