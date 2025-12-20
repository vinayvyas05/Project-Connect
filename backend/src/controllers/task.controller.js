import Task from "../models/Task.js";
import TeamMember from "../models/TeamMember.js";
import { notifyTask } from "../utils/taskNotifier.js";

/**
 * CREATE TASK
 */
export const createTask = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // if assignedTo exists, ensure user is team member
    if (assignedTo) {
      const isMember = await TeamMember.findOne({
        teamId,
        userId: assignedTo,
      });

      if (!isMember) {
        return res
          .status(400)
          .json({ message: "Assigned user is not a team member" });
      }
    }

    const task = await Task.create({
      teamId,
      title,
      description,
      assignedTo,
      dueDate,
      createdBy: req.user.id,
    });

    await notifyTask(teamId, `📝 Task created: ${task.title}`);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task" });
  }
};

/**
 * GET ALL TASKS OF A TEAM
 */
export const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;

    const tasks = await Task.find({ teamId })
      .sort({ createdAt: -1 })
      .populate("assignedTo", "email");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/**
 * UPDATE TASK
 */
export const updateTask = async (req, res) => {
  try {
    const { teamId, taskId } = req.params;
    const { title, description, status, assignedTo, dueDate } = req.body;

    const task = await Task.findOne({ _id: taskId, teamId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // only creator or assigned user can update
    if (
      task.createdBy.toString() !== req.user.id &&
      task.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // check assigned user membership
    if (assignedTo) {
      const isMember = await TeamMember.findOne({
        teamId,
        userId: assignedTo,
      });

      if (!isMember) {
        return res
          .status(400)
          .json({ message: "Assigned user is not a team member" });
      }
    }

    let sendUpdateNotification = true;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;

    if (status !== undefined) {
      task.status = status;

      if (status === "done") {
        await notifyTask(teamId, `✅ Task completed: ${task.title}`);
        sendUpdateNotification = false;
      }
    }

    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    if (sendUpdateNotification) {
      await notifyTask(teamId, `✏️ Task updated: ${task.title}`);
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
};

/**
 * DELETE TASK
 */
export const deleteTask = async (req, res) => {
  try {
    const { teamId, taskId } = req.params;

    const task = await Task.findOne({ _id: taskId, teamId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // only creator can delete
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await notifyTask(teamId, `🗑️ Task deleted: ${task.title}`);

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
};
