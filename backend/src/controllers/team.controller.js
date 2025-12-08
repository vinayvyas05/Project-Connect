import Team from "../models/Team.js";
import TeamMember from "../models/TeamMember.js";
import jwt from "jsonwebtoken";


/**
 * CREATE TEAM (Workspace)
 * Route: POST /api/teams/create
 */
export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId; // comes from auth middleware

    // 1. Validate input
    if (!name) {
      return res.status(400).json({ message: "Team name is required." });
    }

    // 2. Create Team
    const team = await Team.create({
      name,
      ownerId: userId
    });

    // 3. Add creator as ADMIN in TeamMember
    await TeamMember.create({
      teamId: team._id,
      userId,
      role: "admin"
    });

    return res.status(201).json({
      message: "Team created successfully.",
      team
    });

  } catch (err) {
    console.error("Create team error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

export const getMyTeams = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Find all teams user is part of
    const memberships = await TeamMember.find({ userId }).select("teamId");

    const teamIds = memberships.map(m => m.teamId);

    // 2. Get full team details
    const teams = await Team.find({ _id: { $in: teamIds } });

    return res.status(200).json({
      message: "Teams fetched successfully.",
      teams
    });

  } catch (err) {
    console.error("Fetch my teams error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

export const generateInviteLink = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    // 1. Check if the user is admin of this team
    const membership = await TeamMember.findOne({ teamId, userId });

    if (!membership) {
      return res.status(403).json({ message: "You are not part of this team." });
    }

    if (membership.role !== "admin") {
      return res.status(403).json({ message: "Only admins can generate invite links." });
    }

    // 2. Create JWT invite token
    const inviteToken = jwt.sign(
      {
        teamId,
        invitedBy: userId
      },
      process.env.INVITE_TOKEN_SECRET || "default_invite_secret",
      {
        expiresIn: process.env.INVITE_TOKEN_EXPIRES_IN || "7d"
      }
    );

    // 3. Create invite URL (frontend will use this)
    const inviteLink = `${process.env.FRONTEND_URL}/join/${inviteToken}`;

    return res.status(200).json({
      message: "Invite link generated.",
      inviteLink,
      token: inviteToken
    });

  } catch (err) {
    console.error("Invite link error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * JOIN TEAM USING INVITE TOKEN
 * Route: POST /api/teams/join
 */
export const joinTeam = async (req, res) => {
  try {
    const { token } = req.body;     
    const userId = req.userId;      

    if (!token) {
      return res.status(400).json({ message: "Invite token is required." });
    }

    // 1. Verify invite token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.INVITE_TOKEN_SECRET || "default_invite_secret"
      );
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired invite token." });
    }

    const { teamId } = decoded;

    // 2. Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // 3. Check if user is already a member
    const existingMember = await TeamMember.findOne({ teamId, userId });
    if (existingMember) {
      return res.status(200).json({
        message: "You are already a member of this team.",
        team
      });
    }

    // 4. Add user to team as a NORMAL MEMBER
    await TeamMember.create({
      teamId,
      userId,
      role: "member"
    });

    return res.status(200).json({
      message: "Joined team successfully!",
      team
    });

  } catch (err) {
    console.error("Join team error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};