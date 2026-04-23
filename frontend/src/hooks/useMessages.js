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
  const { socketRef, isConnected } = useSocket();
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
          const history = Array.isArray(data) ? data : (data.messages ?? []);
          
          setMessages((current) => {
            // merge history with current state, prioritizing current items to avoid overwriting socket msgs
            const merged = [...history];
            
            current.forEach(msg => {
              if (!merged.find(m => String(m._id) === String(msg._id))) {
                merged.push(msg);
              }
            });

            // sort by date to keep them in order
            return merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });
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
    if (!socket || !isConnected || !teamId || !channelId) return;

    // Leave previous room if switching channels
    if (joinedRef.current && joinedRef.current !== channelId) {
      socket.emit("channel:leave", { channelId: joinedRef.current });
    }

    console.log(`[Socket] Joining room channel:${channelId}`);
    socket.emit("channel:join", { teamId, channelId });
    joinedRef.current = channelId;

    const handleNew = (msg) => {
      setMessages((prev) => {
        // IMPORTANT: Ensure we compare IDs as strings! (Mongoose ObjectId vs String)
        const exists = prev.some((m) => String(m._id) === String(msg._id));
        
        if (exists) {
          console.log("[Socket] Message already exists, skipping...");
          return prev;
        }

        const next = [...prev, msg];
        console.log("[Socket] Message added! New total:", next.length);
        return next;
      });
    };

    socket.on("message:new", handleNew);

    return () => {
      console.log(`[Socket] Cleaning up listener for:${channelId}`);
      socket.off("message:new", handleNew);
      socket.emit("channel:leave", { channelId });
      joinedRef.current = null;
    };
  }, [socketRef, isConnected, teamId, channelId]);



  // ── Send via socket ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (text) => {
      const socket = socketRef?.current;
      if (!socket || !isConnected || !text.trim()) return;
      socket.emit("message:send", { teamId, channelId, text: text.trim() });
    },
    [socketRef, isConnected, teamId, channelId],
  );

  return { messages, loading, error, sendMessage };
}

