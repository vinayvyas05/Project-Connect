import TeamMember from '../models/TeamMember.js';
import Channel from '../models/Channel.js';
import Message from '../models/Message.js';

export function channelSocket(io, socket) {
  // JOIN CHANNEL
  socket.on('channel:join', async ({ teamId, channelId }) => {
    try {
      const isMember = await TeamMember.findOne({
        teamId,
        userId: socket.user.id,
      });

      if (!isMember) return;

      socket.join(`channel:${channelId}`);
    } catch (err) {
      console.error('channel:join error:', err.message);
    }
  });

  // LEAVE CHANNEL
  socket.on('channel:leave', ({ channelId }) => {
    try {
      socket.leave(`channel:${channelId}`);
    } catch (err) {
      console.error('channel:leave error:', err.message);
    }
  });

  // SEND MESSAGE
  socket.on('message:send', async ({ teamId, channelId, text }) => {
    try {
      if (!text) return;

      // check team membership
      const isMember = await TeamMember.findOne({
        teamId,
        userId: socket.user.id,
      });

      if (!isMember) return;

      // check channel belongs to team
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
      io.to(`channel:${channelId}`).emit('message:new', {
        _id: message._id,
        teamId,
        channelId,
        senderId: {
          _id: socket.user.id,
          name: socket.user.name,
          email: socket.user.email,
        },
        text: message.text,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error('message:send error:', err.message);
    }
  });
}
