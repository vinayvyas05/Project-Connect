import TeamMember from '../models/TeamMember.js';

/**
 * Check if user is part of the team
 * Usage: any route with :teamId
 */
export const isTeamMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required.' });
    }

    const membership = await TeamMember.findOne({ teamId, userId });

    if (!membership) {
      return res
        .status(403)
        .json({ message: 'You are not a member of this team.' });
    }

    req.teamRole = membership.role; // store role for next middleware

    next();
  } catch (err) {
    console.error('Team member check error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Check if user is admin of the team
 * Must be used AFTER isTeamMember
 */
export const isTeamAdmin = (req, res, next) => {
  if (req.teamRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
};
