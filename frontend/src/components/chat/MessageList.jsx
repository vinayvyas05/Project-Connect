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
    <div className="flex items-center gap-4 my-6 px-6 select-none">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <span className="text-[10px] text-slate-400/80 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.06] shadow-sm backdrop-blur-sm">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const colours = [
    "from-indigo-500 to-indigo-600 border-indigo-400/20 shadow-indigo-500/10",
    "from-violet-500 to-violet-600 border-violet-400/20 shadow-violet-500/10",
    "from-sky-500 to-sky-600 border-sky-400/20 shadow-sky-500/10",
    "from-emerald-500 to-emerald-600 border-emerald-400/20 shadow-emerald-500/10",
    "from-rose-500 to-rose-600 border-rose-400/20 shadow-rose-500/10",
    "from-amber-500 to-amber-600 border-amber-400/20 shadow-amber-500/10",
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
      className={`w-8 h-8 bg-gradient-to-tr ${colour} rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5 border shadow-sm select-none`}
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
      <div className="flex items-center gap-4 px-6 py-2 my-2 select-none group">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.01] border border-white/[0.04] shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">{message.text}</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>
    );
  }

  const sender = message.senderId;
  const name = sender?.name ?? "Unknown";

  return (
    <div className={`flex gap-3 px-6 py-1.5 transition-colors duration-150 hover:bg-white/[0.015] rounded-lg group relative ${showHeader ? "mt-3" : ""}`}>
      {/* Avatar — only on first message of a group */}
      <div className="w-8 shrink-0 select-none">
        {showHeader ? (
          <Avatar name={name} />
        ) : (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] text-slate-500 font-medium block text-right pr-2 mt-1">
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + timestamp — only on header message */}
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-1 select-none">
            <span
              className={`text-sm font-semibold tracking-tight transition-colors duration-150 ${isOwn ? "text-indigo-400" : "text-slate-200 hover:text-indigo-400 cursor-pointer"}`}
            >
              {isOwn ? "You" : name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}
        {/* Text */}
        <p className="text-[14px] text-slate-300/90 leading-relaxed break-words tracking-wide">
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
    console.log("[UI] MessageList rendered with", messages.length, "messages");
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-xl bg-rose-500/5 border border-rose-500/10 shadow-sm max-w-sm text-center">
          <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 select-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-rose-400 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center mb-2 shadow-lg shadow-indigo-500/5">
          <svg
            className="w-8 h-8 text-indigo-400"
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
        <div className="space-y-1">
          <p className="text-slate-200 font-semibold text-base tracking-tight">No messages yet</p>
          <p className="text-slate-500 text-sm max-w-xs">Be the first to start the conversation in this channel!</p>
        </div>
      </div>
    );
  }

  // Group consecutive messages from the same sender IF within GROUP_GAP_MS
  let lastDate = null;
  let lastSenderId = null;
  let lastCreatedAt = null; // track the timestamp of the previous message

  return (
    <div className="flex-1 overflow-y-auto py-6 px-2 space-y-0.5 scrollbar-thin">
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
          <div
            key={msg._id ?? i}
            className="animate-msg-in"
            style={{ animationDelay: `${Math.min(i, 5) * 18}ms` }}
          >
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
