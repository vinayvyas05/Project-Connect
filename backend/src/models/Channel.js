import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    teamId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Team',
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure channel name is unique per team
channelSchema.index({ name: 1, teamId: 1 }, { unique: true });

export default model("Channel", channelSchema);