import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    // which team this task belongs to
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    // short task title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // optional task details
    description: {
      type: String,
      default: "",
    },

    // who created the task
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // who is responsible for the task
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // progress status
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },

    // optional deadline
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// index for fast task listing per team
taskSchema.index({ teamId: 1, createdAt: -1 });

export default mongoose.model("Task", taskSchema);
