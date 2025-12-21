import { Outlet } from 'react-router-dom';
import TeamSwitcher from '../../features/teams/components/TeamSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTeams } from '../../context/TeamContext';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const { activeTeam } = useTeams();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* 1. Workspace Bar (Narrowest) */}
      <div className="w-16 flex-shrink-0">
        <TeamSwitcher />
      </div>

      {/* 2. Sidebar Area (Channels/Project List) */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200 font-bold text-gray-800">
          {activeTeam?.name || 'Select Team'}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Channel list or Task categories go here later */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Channels</p>
          <div className="mt-2 space-y-1">
            <button className="w-full text-left px-2 py-1 rounded bg-gray-200 text-gray-900"># general</button>
          </div>
        </div>
        
        {/* User Profile / Logout section */}
        <div className="p-4 border-t border-gray-200 bg-gray-100 flex items-center justify-between">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-gray-900 truncate">{user?.name}</span>
            <span className="text-xs text-gray-500 truncate">{user?.email}</span>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-600">
             Logout
          </button>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        <Outlet /> 
      </main>
    </div>
  );
};

export default DashboardLayout;