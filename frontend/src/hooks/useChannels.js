import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/**
 * Fetches channels for a given team.
 * Endpoint: GET /api/teams/:teamId/channels
 * Re-fetches automatically whenever teamId changes.
 *
 * @param {string|null} teamId
 * @returns {{ channels: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useChannels(teamId) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChannels = useCallback(async () => {
    if (!teamId) {
      setChannels([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/teams/${teamId}/channels`);
      setChannels(data.channels ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load channels.");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return { channels, loading, error, refetch: fetchChannels };
}
