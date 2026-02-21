import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { teamService } from "../api/teams/team.service";

// Extracts the token from either a full URL or a raw token string
function extractToken(input) {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    // e.g. http://localhost:5173/join/<token>
    const parts = url.pathname.split("/").filter(Boolean);
    const joinIdx = parts.indexOf("join");
    if (joinIdx !== -1 && parts[joinIdx + 1]) {
      return parts[joinIdx + 1];
    }
  } catch {
    // Not a URL — treat the whole thing as a raw token
  }
  return trimmed;
}

export default function JoinWithInputPage({ onJoined }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = extractToken(input);
    if (!token) {
      setError("Please paste an invite link or token.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await teamService.joinTeam(token);
      if (onJoined) {
        onJoined();
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ?? "Invalid or expired invite link.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 mb-4">
            <svg
              className="w-7 h-7 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Join a team</h1>
          <p className="text-gray-400 text-sm mt-1">
            Paste the invite link or token shared with you
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Invite link or token
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                autoFocus
                rows={3}
                placeholder="https://yourdomain.com/join/eyJhbGci…  or just the token"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
              <p className="text-gray-600 text-xs mt-1.5">
                You can paste the full URL or just the token part
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg py-3 text-sm transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isLoading ? "Joining…" : "Join team"}
              </button>
            </div>
          </form>
        </div>

        {/* Create instead */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don&apos;t have an invite?{" "}
          <button
            onClick={() => navigate("/teams/new")}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Create a new team
          </button>
        </p>
      </div>
    </div>
  );
}
