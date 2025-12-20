import Message from "../models/Message.js";
import Channel from "../models/Channel.js";

/**
 * SEND MESSAGE
 * Route: POST /api/teams/:teamId/channels/:channelId/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const { teamId, channelId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    // 1. Validate input
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required." });
    }

    // 2. Ensure channel belongs to this team
    const channel = await Channel.findOne({ _id: channelId, teamId });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found in this team." });
    }

    // 3. Create message
    const message = await Message.create({
      teamId,
      channelId,
      senderId: userId,
      text
    });

    return res.status(201).json({
      message: "Message sent.",
      data: message
    });

  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
