import { useState, useEffect, useCallback } from "react";
import { taskService } from "../api/tasks/task.service";

/**
 * Manages task state for a team.
 * Returns tasks split by status + CRUD helpers.
 */
export function useTasks(teamId) {
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
      setError(err.response?.data?.message ?? "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── CRUD helpers ─────────────────────────────────────────────────────────────

  const createTask = useCallback(
    async (payload) => {
      const { data } = await taskService.createTask(teamId, payload);
      setTasks((prev) => [data, ...prev]);
      return data;
    },
    [teamId],
  );

  const updateTask = useCallback(
    async (taskId, payload) => {
      const { data } = await taskService.updateTask(teamId, taskId, payload);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
      return data;
    },
    [teamId],
  );

  const deleteTask = useCallback(
    async (taskId) => {
      await taskService.deleteTask(teamId, taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    },
    [teamId],
  );

  // ── Derived lists by status ───────────────────────────────────────────────────
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
