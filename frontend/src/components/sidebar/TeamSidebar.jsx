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
    <nav className="w-18 flex flex-col items-center py-4 gap-4 shrink-0 glass-panel border-r-0 my-3 ml-3 rounded-2xl relative z-30">
      {/* App logo */}
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-2 shrink-0 shadow-lg shadow-indigo-500/20">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>

      <div className="w-8 h-px bg-white/10 mb-1" />

      {/* One button per team */}
      <div className="flex flex-col gap-3">
        {teams.map((team) => (
          <div key={team._id} className="relative group">
            {activeTeamId === team._id && (
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
            )}
            <button
              onClick={() => onSelect(team._id)}
              title={team.name}
              className={`w-11 h-11 font-bold text-sm transition-all duration-300 shrink-0 btn-press flex items-center justify-center
                ${
                  activeTeamId === team._id
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 rounded-2xl scale-105"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:rounded-2xl hover:scale-110 rounded-xl border border-white/5"
                }`}
            >
              {initials(team.name)}
            </button>
          </div>
        ))}

        {/* Create / join team */}
        <button
          onClick={onCreateTeam}
          title="Create or join a team"
          className="w-11 h-11 rounded-xl bg-white/5 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 hover:rounded-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0 btn-press border border-white/5 shadow-inner"
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
      </div>

      <div className="flex-1" />
    </nav>
  );
}

