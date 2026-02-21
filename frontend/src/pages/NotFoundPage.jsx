import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 select-none overflow-hidden relative">
      {/* ── Ambient glow blobs ───────────────────────────────────────────────── */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #6366f1, transparent)",
          top: "10%",
          left: "15%",
        }}
      />
      <div
        className="absolute w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #8b5cf6, transparent)",
          bottom: "15%",
          right: "10%",
        }}
      />

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Glitchy 404 */}
        <div className="relative mb-2">
          <p
            className="text-[9rem] font-black leading-none tracking-tighter select-none"
            style={{
              background:
                "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: "drop-shadow(0 0 40px rgba(99,102,241,0.4))",
            }}
          >
            404
          </p>
          {/* Subtle echo behind */}
          <p
            className="absolute inset-0 text-[9rem] font-black leading-none tracking-tighter select-none opacity-10 blur-sm"
            style={{ color: "#6366f1" }}
          >
            404
          </p>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-6 shadow-xl">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Copy */}
        <h1 className="text-2xl font-bold text-white mb-3">Lost in the void</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
          The page you're looking for doesn't exist, was moved, or you may have
          mistyped the URL.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-200 transition-colors bg-gray-900"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Go back
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 30px rgba(99,102,241,0.5)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 20px rgba(99,102,241,0.3)")
            }
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go home
          </button>
        </div>

        {/* Tiny hint */}
        <p className="mt-10 text-xs text-gray-700">
          DevPulse · Project Connect
        </p>
      </div>

      {/* ── Decorative grid ──────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
