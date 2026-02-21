import { useState, useEffect, useCallback } from "react";
import { channelService } from "../api/channels/channel.service";

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
      const { data } = await channelService.getTeamChannels(teamId);
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
