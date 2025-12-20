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


/**
 * GET MESSAGE HISTORY
 * Route: GET /api/teams/:teamId/channels/:channelId/messages
 * Query params:
 *   - limit (number, default 50)
 *   - before (ISO date or messageId cursor)
 */
export const getMessages = async (req, res) => {
  try {
    const { teamId, channelId } = req.params;
    const userId = req.userId;

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const { before } = req.query;

    // 1. Ensure channel belongs to this team
    const channel = await Channel.findOne({ _id: channelId, teamId });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found in this team." });
    }

    // 2. Build query
    const query = { teamId, channelId };

    if (before) {
      // support cursor by date or by message id
      if (before.match(/^[0-9a-fA-F]{24}$/)) {
        const cursorMsg = await Message.findById(before).select("createdAt");
        if (cursorMsg) {
          query.createdAt = { $lt: cursorMsg.createdAt };
        }
      } else {
        const date = new Date(before);
        if (!isNaN(date.getTime())) {
          query.createdAt = { $lt: date };
        }
      }
    }

    // 3. Fetch messages (newest first)
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("senderId", "name email");

    // 4. Return oldest → newest for UI
    messages.reverse();

    return res.status(200).json({
      message: "Messages fetched successfully.",
      messages,
      hasMore: messages.length === limit
    });

  } catch (err) {
    console.error("Get messages error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};