import { useState, useEffect, useCallback } from "react";
import { taskService } from "../api/tasks/task.service";
import { useToast } from "../context/ToastContext";

/**
 * Manages task state for a team.
 * Returns tasks split by status + CRUD helpers.
 */
export function useTasks(teamId) {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await taskService.getTeamTasks(teamId);
      setTasks(Array.isArray(data) ? data : (data.tasks ?? []));
    } catch (err) {
      const msg = err.response?.data?.message ?? "Failed to load tasks.";
      setError(msg);
      toast.error(msg, "Load failed");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── CRUD helpers ──────────────────────────────────────────────────────────

  const createTask = useCallback(
    async (payload) => {
      try {
        const { data } = await taskService.createTask(teamId, payload);
        setTasks((prev) => [data, ...prev]);
        toast.success(`"${data.title}" added to board`, "Task created");
        return data;
      } catch (err) {
        toast.error(
          err.response?.data?.message ?? "Could not create task.",
          "Create failed",
        );
        throw err;
      }
    },
    [teamId],
  );

  const updateTask = useCallback(
    async (taskId, payload) => {
      try {
        const { data } = await taskService.updateTask(teamId, taskId, payload);
        setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
        // Only toast status changes — silent for minor field edits
        if (payload.status) {
          const labels = {
            todo: "To Do",
            in_progress: "In Progress",
            done: "Done",
          };
          toast.info(
            `Moved to "${labels[payload.status] ?? payload.status}"`,
            data.title,
          );
        } else {
          toast.success("Changes saved", "Task updated");
        }
        return data;
      } catch (err) {
        toast.error(
          err.response?.data?.message ?? "Could not update task.",
          "Update failed",
        );
        throw err;
      }
    },
    [teamId],
  );

  const deleteTask = useCallback(
    async (taskId) => {
      try {
        await taskService.deleteTask(teamId, taskId);
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        toast.success("Task removed from board", "Deleted");
      } catch (err) {
        toast.error(
          err.response?.data?.message ?? "Could not delete task.",
          "Delete failed",
        );
        throw err;
      }
    },
    [teamId],
  );

  // ── Derived lists by status ───────────────────────────────────────────────
  const todo = tasks.filter((t) => t.status === "todo");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const done = tasks.filter((t) => t.status === "done");

  return {
    tasks,
    todo,
    inProgress,
    done,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
