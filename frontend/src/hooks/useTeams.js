import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/**
 * Fetches the list of teams the logged-in user belongs to.
 * Endpoint: GET /api/teams/my
 *
 * @returns {{ teams: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/teams/my");
      setTeams(data.teams ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refetch: fetchTeams };
}
