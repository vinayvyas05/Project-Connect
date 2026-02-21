import { useState, useEffect, useCallback } from "react";
import { teamService } from "../api/teams/team.service";

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await teamService.getMyTeams();
      setTeams(data.teams ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams };
}
