import { useState } from "react";
import { teamService } from "../api/teams/team.service";

export default function InviteLinkModal({ teamId, onClose }) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await teamService.generateInviteLink(teamId);
      setLink(data.inviteLink);
    } catch (err) {
      setError(
        err.response?.data?.message ?? "Failed to generate invite link.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Please copy manually.");
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-backdrop-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-text-primary font-semibold text-lg">Invite members</h2>
            <p className="text-text-secondary text-sm mt-0.5">
              Generate a link valid for 7 days
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded"
          >
            <svg
              className="w-5 h-5"
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
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* No link yet */}
        {!link && (
          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2 btn-press shadow-sm"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Generating…" : "Generate invite link"}
          </button>
        )}

        {/* Link generated */}
        {link && (
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-text-secondary shrink-0"
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
              <span className="text-text-primary text-xs truncate flex-1">
                {link}
              </span>
            </div>
            <button
              onClick={copyToClipboard}
              className={`w-full font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2 shadow-sm
                ${
                  copied
                    ? "bg-success/10 border border-success/30 text-success"
                    : "bg-primary hover:bg-primary-hover text-white"
                }`}
            >
              {copied ? (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
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
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy link
                </>
              )}
            </button>
            <button
              onClick={generate}
              className="w-full text-text-secondary hover:text-text-primary text-xs py-1 transition-colors"
            >
              Generate new link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
