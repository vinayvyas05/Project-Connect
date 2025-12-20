import Channel from "../models/Channel.js";
import Message from "../models/Message.js";
import { getIO } from "../sockets/index.js";

export async function notifyTask(teamId, text) {
  // find general channel
  const channel = await Channel.findOne({
    teamId,
    name: "general",
  });

  if (!channel) return;

  // save system message
  const message = await Message.create({
    teamId,
    channelId: channel._id,
    senderId: null, // system message
    text,
  });

  // emit real-time
  const io = getIO();
  if (io) {
    io.to(`channel:${channel._id}`).emit("message:new", {
      _id: message._id,
      teamId,
      channelId: channel._id,
      senderId: null,
      text: message.text,
      createdAt: message.createdAt,
      system: true,
    });
  }
}
