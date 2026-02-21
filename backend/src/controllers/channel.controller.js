import Channel from '../models/Channel.js';

const MAX_CHANNELS_PER_TEAM = 10;

/**
 * CREATE CHANNEL
 * Route: POST /api/teams/:teamId/channels/create
 */
export const createChannel = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    // 1. Validate input
    if (!name) {
      return res.status(400).json({ message: 'Channel name is required.' });
    }

    // 2. Enforce per-team channel limit
    const count = await Channel.countDocuments({ teamId });
    if (count >= MAX_CHANNELS_PER_TEAM) {
      return res.status(400).json({
        message: `Channel limit reached. A team can have at most ${MAX_CHANNELS_PER_TEAM} channels.`,
      });
    }

    // 3. Create channel (unique index handles duplicates per team)
    const channel = await Channel.create({
      name,
      teamId,
      createdBy: userId,
    });

    return res.status(201).json({
      message: 'Channel created successfully.',
      channel,
    });
  } catch (err) {
    // Duplicate channel name for the same team
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Channel with this name already exists in the team.',
      });
    }

    console.error('Create channel error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET CHANNELS OF A TEAM
 * Route: GET /api/teams/:teamId/channels
 */
export const getTeamChannels = async (req, res) => {
  try {
    const { teamId } = req.params;

    const channels = await Channel.find({ teamId }).sort({ createdAt: 1 }); // oldest first

    return res.status(200).json({
      message: 'Channels fetched successfully.',
      channels,
    });
  } catch (err) {
    console.error('Get channels error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * RENAME CHANNEL (admin only)
 * Route: PATCH /api/teams/:teamId/channels/:channelId
 */
export const renameChannel = async (req, res) => {
  try {
    const { teamId, channelId } = req.params;
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Channel name is required.' });
    }

    // Sanitize: lowercase, spaces → hyphens, strip non-alphanumeric except hyphens
    name = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (!name) {
      return res
        .status(400)
        .json({ message: 'Channel name contains invalid characters.' });
    }

    const channel = await Channel.findOne({ _id: channelId, teamId });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found.' });
    }

    channel.name = name;
    await channel.save();

    return res.status(200).json({
      message: 'Channel renamed successfully.',
      channel,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'A channel with that name already exists.' });
    }
    console.error('Rename channel error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
