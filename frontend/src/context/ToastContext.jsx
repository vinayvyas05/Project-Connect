import { createContext, useCallback, useContext, useState } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Icons ────────────────────────────────────────────────────────────────────
const ICONS = {
  success: (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  ),
};

// Per-variant colour tokens
const STYLES = {
  success: {
    bar: "bg-emerald-500",
    icon: "text-emerald-400",
    ring: "ring-emerald-500/30",
  },
  error: {
    bar: "bg-red-500",
    icon: "text-red-400",
    ring: "ring-red-500/30",
  },
  info: {
    bar: "bg-indigo-500",
    icon: "text-indigo-400",
    ring: "ring-indigo-500/30",
  },
  warning: {
    bar: "bg-amber-400",
    icon: "text-amber-400",
    ring: "ring-amber-400/30",
  },
};

const DURATION = 4000; // ms

// ─── Single Toast ─────────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  const s = STYLES[toast.type] ?? STYLES.info;

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80 max-w-full
        bg-gray-900 border border-gray-800 ring-1 ${s.ring}
        rounded-xl shadow-2xl overflow-hidden
        animate-toast-in
      `}
    >
      {/* Accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-l-xl`}
      />

      {/* Icon */}
      <div className={`mt-3 ml-4 ${s.icon}`}>{ICONS[toast.type]}</div>

      {/* Body */}
      <div className="flex-1 py-3 pr-3 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-white leading-tight mb-0.5">
            {toast.title}
          </p>
        )}
        <p className="text-sm text-gray-400 leading-snug break-words">
          {toast.message}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="mt-2.5 mr-3 text-gray-600 hover:text-gray-300 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${s.bar} opacity-40`}
        style={{ animation: `toast-progress ${DURATION}ms linear forwards` }}
      />
    </div>
  );
}

// ─── ToastProvider ────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, title, type = "info", duration = DURATION }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-4), { id, message, title, type }]); // max 5 toasts
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  // Convenience shorthands
  const toast = {
    success: (message, title) => showToast({ message, title, type: "success" }),
    error: (message, title) => showToast({ message, title, type: "error" }),
    info: (message, title) => showToast({ message, title, type: "info" }),
    warning: (message, title) => showToast({ message, title, type: "warning" }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* ── Toast container ── fixed bottom-right ── */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
