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
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={`Message #${channelName ?? "channel"}`}
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm resize-none focus:outline-none py-1.5 leading-relaxed max-h-32"
          style={{ height: "36px" }}
        />
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
            disabled:text-gray-600 disabled:cursor-not-allowed
            enabled:bg-indigo-600 enabled:hover:bg-indigo-500 enabled:text-white"
        >
          <svg
            className="w-4 h-4"
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
      <p className="text-gray-600 text-xs mt-1.5 pl-1">
        Press{" "}
        <kbd className="text-gray-500 bg-gray-800 px-1 py-0.5 rounded text-xs">
          Enter
        </kbd>{" "}
        to send ·{" "}
        <kbd className="text-gray-500 bg-gray-800 px-1 py-0.5 rounded text-xs">
          Shift + Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
}
