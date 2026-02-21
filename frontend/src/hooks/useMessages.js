import { useState, useEffect, useCallback, useRef } from "react";
import { messageService } from "../api/messages/message.service";
import { useSocket } from "../context/SocketContext";

/**
 * Fetches message history for a channel and keeps it live via socket.
 *
 * @param {{ teamId: string, channelId: string }} params
 * @returns {{ messages, loading, error, sendMessage }}
 */
export function useMessages({ teamId, channelId }) {
  const socketRef = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track joined room so we can leave on unmount
  const joinedRef = useRef(null);

  // ── Fetch history ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!teamId || !channelId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    messageService
      .getMessages(teamId, channelId)
      .then(({ data }) => {
        if (!cancelled) {
          // Backend returns { messages: [] } or flat array
          setMessages(Array.isArray(data) ? data : (data.messages ?? []));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message ?? "Failed to load messages.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teamId, channelId]);

  // ── Socket: join room + listen for new messages ────────────────────────────
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !teamId || !channelId) return;

    // Leave previous room if switching channels
    if (joinedRef.current && joinedRef.current !== channelId) {
      socket.emit("channel:leave", { channelId: joinedRef.current });
    }

    socket.emit("channel:join", { teamId, channelId });
    joinedRef.current = channelId;

    const handleNew = (msg) => {
      setMessages((prev) => {
        // Deduplicate by _id
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("message:new", handleNew);

    return () => {
      socket.off("message:new", handleNew);
      socket.emit("channel:leave", { channelId });
      joinedRef.current = null;
    };
  }, [socketRef, teamId, channelId]);

  // ── Send via socket ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (text) => {
      const socket = socketRef?.current;
      if (!socket || !text.trim()) return;
      socket.emit("message:send", { teamId, channelId, text: text.trim() });
    },
    [socketRef, teamId, channelId],
  );

  return { messages, loading, error, sendMessage };
}
