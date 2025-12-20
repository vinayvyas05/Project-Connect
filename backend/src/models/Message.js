import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },

    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// indexes for fast chat queries
messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ teamId: 1 });

export default model("Message", messageSchema);
