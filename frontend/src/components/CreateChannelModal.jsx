import { useState } from "react";
import { channelService } from "../api/channels/channel.service";

export default function CreateChannelModal({ teamId, onCreated, onClose }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Channel names: lowercase, no spaces (use hyphens like Slack)
  const sanitize = (val) =>
    val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleChange = (e) => setName(sanitize(e.target.value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      const { data } = await channelService.createChannel(teamId, name.trim());
      onCreated?.(data.channel);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to create channel.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-backdrop-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-lg">
              Create a channel
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Channels are where conversations happen
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors p-1 rounded"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Channel name
            </label>
            {/* Hash prefix mimicking Slack */}
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition">
              <span className="pl-3 pr-1 text-gray-500 text-sm select-none">
                #
              </span>
              <input
                type="text"
                value={name}
                onChange={handleChange}
                required
                autoFocus
                maxLength={80}
                placeholder="e.g. general, backend-bugs…"
                className="flex-1 bg-transparent text-white placeholder-gray-500 py-3 pr-4 text-sm focus:outline-none"
              />
            </div>
            <p className="text-gray-600 text-xs mt-1.5">
              Lowercase letters, numbers and hyphens only
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg py-2.5 text-sm transition-colors btn-press"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2 btn-press"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? "Creating…" : "Create channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
