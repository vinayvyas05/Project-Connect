import { useState, useRef } from "react";

export default function MessageInput({ onSend, channelName }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    textareaRef.current?.focus();
  };

  // Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow up to ~5 lines
  const handleChange = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="px-6 pb-6 pt-2 select-none">
      <div className="flex items-end gap-3 bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:bg-white/[0.03] transition-all duration-200 shadow-lg">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={`Message #${channelName ?? "channel"}`}
          className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-[14px] resize-none focus:outline-none py-1 leading-relaxed max-h-32 scrollbar-none font-normal"
          style={{ height: "36px" }}
        />
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 btn-press
            disabled:bg-white/[0.02] disabled:text-slate-600 disabled:cursor-not-allowed
            enabled:bg-gradient-to-tr enabled:from-indigo-500 enabled:to-indigo-600 enabled:hover:from-indigo-600 enabled:hover:to-indigo-700 enabled:text-white enabled:shadow-md enabled:shadow-indigo-500/10"
        >
          <svg
            className="w-4 h-4 transform rotate-45 -translate-x-0.5 translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      <p className="text-slate-500/70 text-[11px] mt-2 pl-1 flex items-center gap-1">
        <span>Press</span>
        <kbd className="text-slate-400 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-[10px] font-mono">
          Enter
        </kbd>
        <span>to send ·</span>
        <kbd className="text-slate-400 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-[10px] font-mono">
          Shift + Enter
        </kbd>
        <span>for new line</span>
      </p>
    </div>
  );
}
