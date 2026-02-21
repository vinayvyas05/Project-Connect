import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// ─── Date Divider ─────────────────────────────────────────────────────────────
function DateDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-gray-800" />
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const colours = [
    "bg-indigo-600",
    "bg-violet-600",
    "bg-sky-600",
    "bg-emerald-600",
    "bg-rose-600",
    "bg-amber-600",
  ];
  const colour = colours[(name?.charCodeAt(0) || 0) % colours.length];
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className={`w-8 h-8 ${colour} rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 mt-0.5`}
    >
      {initials}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, isOwn, showHeader }) {
  // System message (task notifications — senderId is null)
  if (!message.senderId) {
    return (
      <div className="flex items-center gap-3 px-4 py-1 my-1">
        <div className="flex-1 h-px bg-gray-800/60" />
        <p className="text-xs text-gray-500 italic shrink-0">{message.text}</p>
        <div className="flex-1 h-px bg-gray-800/60" />
      </div>
    );
  }

  const sender = message.senderId;
  const name = sender?.name ?? "Unknown";

  return (
    <div className={`flex gap-3 px-4 py-0.5 group ${showHeader ? "mt-3" : ""}`}>
      {/* Avatar — only on first message of a group */}
      <div className="w-8 shrink-0">{showHeader && <Avatar name={name} />}</div>

      <div className="flex-1 min-w-0">
        {/* Name + timestamp — only on header message */}
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className={`text-sm font-semibold ${isOwn ? "text-indigo-300" : "text-gray-200"}`}
            >
              {isOwn ? "You" : name}
            </span>
            <span className="text-xs text-gray-600">
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}
        {/* Text */}
        <p className="text-sm text-gray-300 leading-relaxed break-words">
          {message.text}
        </p>
      </div>
    </div>
  );
}

// ─── MessageList ──────────────────────────────────────────────────────────────

// Break message group after 5 minutes even if same sender
const GROUP_GAP_MS = 5 * 60 * 1000;

export default function MessageList({ messages, loading, error }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-white font-medium text-sm">No messages yet</p>
        <p className="text-gray-500 text-xs">Be the first to say something!</p>
      </div>
    );
  }

  // Group consecutive messages from the same sender IF within GROUP_GAP_MS
  let lastDate = null;
  let lastSenderId = null;
  let lastCreatedAt = null; // track the timestamp of the previous message

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {messages.map((msg, i) => {
        const dateLabel = formatDate(msg.createdAt);
        const showDate = dateLabel !== lastDate;

        const senderId = msg.senderId?._id ?? msg.senderId;

        // Time gap since the previous message from this sender
        const msgTime = new Date(msg.createdAt).getTime();
        const timeGapTooLarge =
          lastCreatedAt !== null && msgTime - lastCreatedAt > GROUP_GAP_MS;

        // Show header when: date changes, sender changes, OR time gap > 5 min
        const showHeader =
          showDate || senderId !== lastSenderId || timeGapTooLarge;

        const isOwn = senderId === user?._id;

        if (showDate) lastDate = dateLabel;
        lastSenderId = senderId;
        lastCreatedAt = msgTime;

        return (
          <div key={msg._id ?? i}>
            {showDate && <DateDivider label={dateLabel} />}
            <MessageBubble
              message={msg}
              isOwn={isOwn}
              showHeader={showHeader}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
