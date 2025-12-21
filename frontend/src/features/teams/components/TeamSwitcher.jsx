import { useTeams } from '../../../context/TeamContext';

const TeamSwitcher = () => {
  const { teams, activeTeam, setActiveTeam, loading } = useTeams();

  if (loading) return <div className="p-4 animate-pulse bg-gray-100 rounded">...</div>;

  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-900 h-full text-white">
      <h2 className="text-xs font-bold uppercase text-gray-400 px-2">Workspaces</h2>
      {teams.map((team) => (
        <button
          key={team._id}
          onClick={() => setActiveTeam(team)}
          className={`p-3 rounded-lg transition-all ${
            activeTeam?._id === team._id 
              ? 'bg-blue-600 border-2 border-white' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
          title={team.name}
        >
          {/* Simple Initial for UI */}
          {team.name.charAt(0).toUpperCase()}
        </button>
      ))}
      <button className="p-3 rounded-lg bg-gray-800 border-2 border-dashed border-gray-600 hover:border-white text-gray-400">
        +
      </button>
    </div>
  );
};

export default TeamSwitcher;