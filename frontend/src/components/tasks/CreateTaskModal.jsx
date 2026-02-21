import { useState } from "react";

export default function CreateTaskModal({
  teamId,
  members = [],
  onCreated,
  onClose,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
      };
      await onCreated(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to create task.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-lg">New task</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Add a task to the board
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
              maxLength={120}
              placeholder="What needs to be done?"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description{" "}
              <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              maxLength={500}
              placeholder="Add more details…"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Assignee + Due date side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Assign to
              </label>
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option
                    key={m.userId?._id ?? m._id}
                    value={m.userId?._id ?? m._id}
                  >
                    {m.userId?.name ?? m.userId?.email ?? "Unknown"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Due date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg py-2.5 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.title.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isLoading ? "Creating…" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
