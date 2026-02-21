import { useAuth } from "../../context/AuthContext";

const STATUS_NEXT = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const STATUS_LABEL = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_NEXT_LABEL = {
  todo: "Start",
  in_progress: "Complete",
  done: "Reopen",
};

// ── Due-date badge ─────────────────────────────────────────────────────────────

function DueBadge({ dueDate }) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

  let colour = "text-gray-400 bg-gray-800";
  if (diffDays < 0) colour = "text-red-400 bg-red-500/10";
  else if (diffDays <= 2) colour = "text-amber-400 bg-amber-500/10";

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colour}`}>
      {diffDays < 0
        ? `${Math.abs(diffDays)}d overdue`
        : diffDays === 0
          ? "Due today"
          : `${diffDays}d left`}
    </span>
  );
}

// ── Assignee chip ──────────────────────────────────────────────────────────────

function AssigneeChip({ assignedTo }) {
  if (!assignedTo) return null;
  const email = assignedTo.email ?? assignedTo;
  const initial = (email[0] ?? "?").toUpperCase();
  return (
    <div
      className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs text-white font-semibold shrink-0"
      title={email}
    >
      {initial}
    </div>
  );
}

// ── TaskCard ───────────────────────────────────────────────────────────────────

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const { user } = useAuth();

  const isCreator = task.createdBy?.toString() === user?._id;
  const isAssignee =
    task.assignedTo?._id === user?._id || task.assignedTo === user?._id;
  const canEdit = isCreator || isAssignee;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3 hover:border-gray-700 transition-colors group">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-100 leading-snug flex-1">
          {task.title}
        </p>
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-500 hover:text-gray-200 transition-colors rounded"
              title="Edit"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            {isCreator && (
              <button
                onClick={() => onDelete(task._id)}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors rounded"
                title="Delete"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <DueBadge dueDate={task.dueDate} />
          <AssigneeChip assignedTo={task.assignedTo} />
        </div>

        {/* Status cycle button */}
        <button
          onClick={() => onStatusChange(task._id, STATUS_NEXT[task.status])}
          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-indigo-600/20 hover:text-indigo-300 text-gray-400 transition-colors shrink-0"
        >
          {STATUS_NEXT_LABEL[task.status]} →
        </button>
      </div>
    </div>
  );
}

export { STATUS_LABEL };
