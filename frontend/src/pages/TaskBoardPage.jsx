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
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
      <div className="flex flex-col h-full overflow-hidden bg-gray-950">
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
