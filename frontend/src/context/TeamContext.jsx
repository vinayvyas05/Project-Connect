import { createContext, useContext, useState, useEffect } from 'react';
import { teamService } from '../features/teams/services/teamService';
import { useAuth } from './AuthContext';

const TeamContext = createContext(null);

export const TeamProvider = ({ children }) => {
  const { status } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTeams();
    }
  }, [status]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await teamService.getMyTeams();
      setTeams(data);
      // Auto-select the first team if none is selected
      if (data.length > 0 && !activeTeam) {
        setActiveTeam(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeamContext.Provider value={{ teams, activeTeam, setActiveTeam, loading, refreshTeams: fetchTeams }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => useContext(TeamContext);