import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { teamService } from "../api/teams/team.service";
import TaskCard, { STATUS_LABEL } from "../components/tasks/TaskCard";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import EditTaskModal from "../components/tasks/EditTaskModal";

// ─── Column ────────────────────────────────────────────────────────────────────

const COLUMN_STYLES = {
  todo: { dot: "bg-gray-500", header: "text-gray-400" },
  in_progress: { dot: "bg-amber-400", header: "text-amber-400" },
  done: { dot: "bg-emerald-400", header: "text-emerald-400" },
};

function Column({ status, tasks, onStatusChange, onEdit, onDelete }) {
  const style = COLUMN_STYLES[status];
  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${style.header}`}
        >
          {STATUS_LABEL[status]}
        </span>
        <span className="text-xs text-gray-600 ml-auto">{tasks.length}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="border border-dashed border-gray-800 rounded-xl py-8 flex items-center justify-center">
            <p className="text-gray-600 text-xs">No tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── TaskBoardPage ─────────────────────────────────────────────────────────────

export default function TaskBoardPage() {
  const { teamId } = useParams();

  const {
    todo,
    inProgress,
    done,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(teamId);

  // Members list — needed for assignee dropdowns
  const [members, setMembers] = useState([]);
  useEffect(() => {
    if (!teamId) return;
    teamService
      .getTeamMembers(teamId)
      .then(({ data }) => {
        setMembers(Array.isArray(data) ? data : (data.members ?? []));
      })
      .catch(() => {});
  }, [teamId]);

  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null); // task object

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch {
      /* silently fail — card stays in place */
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
    } catch {
      /* silently fail */
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    // ── Kanban skeleton — matches 3-column board layout ──────────────────────
    const COLS = [
      { dot: "bg-gray-700", label: "w-10", cards: 2 },
      { dot: "bg-amber-800", label: "w-20", cards: 3 },
      { dot: "bg-emerald-900", label: "w-8", cards: 1 },
    ];
    return (
      <div className="flex flex-col h-full overflow-hidden bg-gray-950">
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-gray-800 rounded-md animate-pulse" />
            <div className="h-3 w-16 bg-gray-800 rounded-md animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-gray-800 rounded-lg animate-pulse" />
        </div>

        {/* Columns */}
        <div className="flex-1 px-6 py-6 overflow-auto">
          <div className="flex gap-5 h-full min-w-[640px]">
            {COLS.map((col, ci) => (
              <div key={ci} className="flex-1 flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-1 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse ${col.dot}`}
                  />
                  <div
                    className={`h-2.5 ${col.label} bg-gray-800 rounded-md animate-pulse`}
                  />
                </div>
                {/* Card skeletons */}
                {Array.from({ length: col.cards }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3 animate-pulse"
                  >
                    <div className="h-3.5 w-4/5 bg-gray-800 rounded-md" />
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full bg-gray-800 rounded-md" />
                      <div className="h-2.5 w-3/5 bg-gray-800 rounded-md" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="h-5 w-16 bg-gray-800 rounded-full" />
                      <div className="w-6 h-6 bg-gray-800 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden bg-gray-950 animate-page-in">
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg">Task Board</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {todo.length + inProgress.length + done.length} tasks total
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New task
          </button>
        </div>

        {/* Kanban board */}
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="flex gap-5 h-full min-w-[640px]">
            <Column
              status="todo"
              tasks={todo}
              onStatusChange={handleStatusChange}
              onEdit={setEditTask}
              onDelete={handleDelete}
            />
            <Column
              status="in_progress"
              tasks={inProgress}
              onStatusChange={handleStatusChange}
              onEdit={setEditTask}
              onDelete={handleDelete}
            />
            <Column
              status="done"
              tasks={done}
              onStatusChange={handleStatusChange}
              onEdit={setEditTask}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateTaskModal
          teamId={teamId}
          members={members}
          onCreated={createTask}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTask && (
        <EditTaskModal
          task={editTask}
          members={members}
          onSave={updateTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </>
  );
}
