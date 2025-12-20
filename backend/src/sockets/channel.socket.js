import TeamMember from "../models/TeamMember.js";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";

export function channelSocket(io, socket) {

  // JOIN CHANNEL
  socket.on("channel:join", async ({ teamId, channelId }) => {
    const isMember = await TeamMember.findOne({
      teamId,
      userId: socket.user.id,
    });

    if (!isMember) return;

    socket.join(`channel:${channelId}`);
  });

  // LEAVE CHANNEL
  socket.on("channel:leave", ({ channelId }) => {
    socket.leave(`channel:${channelId}`);
  });

  // SEND MESSAGE
  socket.on("message:send", async ({ teamId, channelId, text }) => {
    if (!text) return;

    // check team membership
    const isMember = await TeamMember.findOne({
      teamId,
      userId: socket.user.id,
    });

    if (!isMember) return;

    // check channel
    const channel = await Channel.findOne({
      _id: channelId,
      teamId,
    });

    if (!channel) return;

    // save message
    const message = await Message.create({
      teamId,
      channelId,
      senderId: socket.user.id,
      text,
    });

    // emit to channel
    io.to(`channel:${channelId}`).emit("message:new", {
      _id: message._id,
      teamId,
      channelId,
      senderId: socket.user.id,
      text: message.text,
      createdAt: message.createdAt,
    });
  });
}
