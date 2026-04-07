import Community from "../models/Communities";
import { Request, Response } from "express";
import CommunityMember from "../models/CommunityMember";
import CommunityJoinRequest from "../models/CommunityJoinRequest";
import User from "../models/User";
import Profile from "../models/Profile";

const parsePositiveInt = (value: unknown): number | null => {
  const numeric = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(numeric) && numeric > 0 ? Number(numeric) : null;
};

const isCommunityStaff = async (communityId: number, userId: number) => {
  const community = await Community.findByPk(communityId);
  if (!community) return { ok: false as const, reason: "not_found" as const };

  if (community.userId === userId) return { ok: true as const, community };

  const staffMembership = await CommunityMember.findOne({
    where: { communityId, userId },
    attributes: ["role"],
  });

  if (
    staffMembership?.role === "admin" ||
    staffMembership?.role === "moderator"
  ) {
    return { ok: true as const, community };
  }

  return { ok: false as const, reason: "forbidden" as const, community };
};

const isCommunityOwnerOrAdmin = async (communityId: number, userId: number) => {
  const community = await Community.findByPk(communityId);
  if (!community) return { ok: false as const, reason: "not_found" as const };

  if (community.userId === userId) return { ok: true as const, community };

  const adminMembership = await CommunityMember.findOne({
    where: { communityId, userId },
    attributes: ["role"],
  });

  if (adminMembership?.role === "admin") {
    return { ok: true as const, community };
  }

  return { ok: false as const, reason: "forbidden" as const, community };
};

const normalizeVisibility = (value: unknown): "Public" | "Private" | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === "boolean") return value ? "Public" : "Private";
  if (value === "Public" || value === "Private") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "public") return "Public";
    if (v === "private") return "Private";
  }
  return null;
};

// Create a community
export const createCommunity = async (req: Request, res: Response) => {
  try {
    const { userId, name, description, affiliation, isPublic } = req.body;
    const community = await Community.create({
      userId,
      name,
      description,
      affiliation,
      isPublic: isPublic ? "Public" : "Private",
      membersCount: 1,
    });

    // Add creator as admin in CommunityMember
    await CommunityMember.create({
      communityId: community.communityId,
      userId,
      role: "admin",
    });
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ error: "Failed to create community" });
  }
};

// Get all communities
export const getAllCommunities = async (req: Request, res: Response) => {
  try {
    const communities = await Community.findAll();
    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch communities" });
  }
};

// Get a community by ID
export const getCommunityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const community = await Community.findByPk(id);
    if (!community)
      return res.status(404).json({ error: "Community not found" });
    res.json(community);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community" });
  }
};

// Update a community
export const updateCommunity = async (req: Request, res: Response) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    if (!communityId) {
      return res.status(400).json({ error: "Invalid community id" });
    }

    const actorUserId = parsePositiveInt(
      req.body?.actorUserId ?? req.body?.userId ?? req.query.actorUserId,
    );
    if (!actorUserId) {
      return res.status(400).json({ error: "actorUserId is required" });
    }

    const auth = await isCommunityOwnerOrAdmin(communityId, actorUserId);
    if (!auth.ok) {
      if (auth.reason === "not_found") {
        return res.status(404).json({ error: "Community not found" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    const { name, description, affiliation } = req.body;
    const normalizedVisibility = normalizeVisibility(req.body?.isPublic);

    await auth.community.update({
      ...(typeof name === "string" ? { name } : {}),
      ...(typeof description === "string" ? { description } : {}),
      ...(typeof affiliation === "string" ? { affiliation } : {}),
      ...(normalizedVisibility ? { isPublic: normalizedVisibility } : {}),
    });

    res.json(auth.community);
  } catch (error) {
    res.status(500).json({ error: "Failed to update community" });
  }
};

// Delete a community
export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    if (!communityId) {
      return res.status(400).json({ error: "Invalid community id" });
    }

    const actorUserId = parsePositiveInt(
      req.body?.actorUserId ?? req.body?.userId ?? req.query.actorUserId,
    );
    if (!actorUserId) {
      return res.status(400).json({ error: "actorUserId is required" });
    }

    const auth = await isCommunityOwnerOrAdmin(communityId, actorUserId);
    if (!auth.ok) {
      if (auth.reason === "not_found") {
        return res.status(404).json({ error: "Community not found" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    await auth.community.destroy();
    res.json({ message: "Community deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete community" });
  }
};

export const listCommunityMembers = async (req: Request, res: Response) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    if (!communityId) {
      return res.status(400).json({ error: "Invalid community id" });
    }

    const actorUserId =
      parsePositiveInt(req.query.actorUserId) ??
      parsePositiveInt(req.query.userId) ??
      parsePositiveInt(req.body?.actorUserId) ??
      parsePositiveInt(req.body?.userId);

    if (!actorUserId) {
      return res.status(400).json({ error: "actorUserId is required" });
    }

    const auth = await isCommunityOwnerOrAdmin(communityId, actorUserId);
    if (!auth.ok) {
      if (auth.reason === "not_found") {
        return res.status(404).json({ error: "Community not found" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    const memberships = await CommunityMember.findAll({
      where: { communityId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    const userIds = memberships
      .map((m) => m.userId)
      .filter((id): id is number => Number.isFinite(id));

    const profiles = await Profile.findAll({
      where: { userId: userIds },
      attributes: ["userId", "profilePic"],
    });

    const profilePicByUserId = new Map<number, string | null>();
    for (const p of profiles) {
      profilePicByUserId.set(p.userId, (p as any).profilePic ?? null);
    }

    const members = memberships.map((m) => {
      const user = (m as any).User as
        | { id: number; username: string; email: string }
        | undefined;
      return {
        memberId: m.memberId,
        communityId: m.communityId,
        userId: m.userId,
        role: m.role,
        user,
        profilePic: profilePicByUserId.get(m.userId) ?? null,
      };
    });

    return res.json({ communityId, members });
  } catch (error) {
    res.status(500).json({ error: "Failed to list community members" });
  }
};

export const kickCommunityMember = async (req: Request, res: Response) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    const memberUserId = parsePositiveInt(req.params.memberUserId);
    const actorUserId = parsePositiveInt(
      req.body?.actorUserId ?? req.body?.userId ?? req.query.actorUserId,
    );

    if (!communityId)
      return res.status(400).json({ error: "Invalid community id" });
    if (!memberUserId)
      return res.status(400).json({ error: "Invalid member user id" });
    if (!actorUserId)
      return res.status(400).json({ error: "actorUserId is required" });

    const auth = await isCommunityOwnerOrAdmin(communityId, actorUserId);
    if (!auth.ok) {
      if (auth.reason === "not_found") {
        return res.status(404).json({ error: "Community not found" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    if (memberUserId === auth.community.userId) {
      return res.status(400).json({ error: "Cannot kick the community owner" });
    }

    const membership = await CommunityMember.findOne({
      where: { communityId, userId: memberUserId },
    });

    if (!membership) {
      return res.status(404).json({ error: "Member not found" });
    }

    await membership.destroy();

    const count = await CommunityMember.count({ where: { communityId } });
    await auth.community.update({ membersCount: count });

    return res.json({ message: "Member kicked", membersCount: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to kick member" });
  }
};

export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    const actorUserId = parsePositiveInt(
      req.body?.actorUserId ?? req.body?.userId ?? req.query.actorUserId,
    );

    if (!communityId) {
      return res.status(400).json({ error: "Invalid community id" });
    }
    if (!actorUserId) {
      return res.status(400).json({ error: "actorUserId is required" });
    }

    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    if (community.userId === actorUserId) {
      return res
        .status(400)
        .json({ error: "Community owner cannot leave the community" });
    }

    const membership = await CommunityMember.findOne({
      where: { communityId, userId: actorUserId },
    });

    if (!membership) {
      const count = await CommunityMember.count({ where: { communityId } });
      await community.update({ membersCount: count });
      return res
        .status(200)
        .json({ message: "Not a member", membersCount: count });
    }

    await membership.destroy();

    const count = await CommunityMember.count({ where: { communityId } });
    await community.update({ membersCount: count });

    return res.json({ message: "Left community", membersCount: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to leave community" });
  }
};

export const setCommunityMemberRole = async (req: Request, res: Response) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    const memberUserId = parsePositiveInt(req.params.memberUserId);
    const actorUserId = parsePositiveInt(
      req.body?.actorUserId ?? req.body?.userId ?? req.query.actorUserId,
    );
    const role = req.body?.role as unknown;

    if (!communityId) {
      return res.status(400).json({ error: "Invalid community id" });
    }
    if (!memberUserId) {
      return res.status(400).json({ error: "Invalid member user id" });
    }
    if (!actorUserId) {
      return res.status(400).json({ error: "actorUserId is required" });
    }
    if (role !== "moderator" && role !== "member") {
      return res
        .status(400)
        .json({ error: "role must be 'moderator' or 'member'" });
    }

    const auth = await isCommunityOwnerOrAdmin(communityId, actorUserId);
    if (!auth.ok) {
      if (auth.reason === "not_found") {
        return res.status(404).json({ error: "Community not found" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    if (memberUserId === auth.community.userId) {
      return res
        .status(400)
        .json({ error: "Cannot change the community owner's role" });
    }

    const membership = await CommunityMember.findOne({
      where: { communityId, userId: memberUserId },
    });

    if (!membership) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (membership.role === "admin") {
      return res.status(400).json({ error: "Cannot change an admin's role" });
    }

    await membership.update({ role });

    return res.json({ message: "Role updated", membership });
  } catch (error) {
    res.status(500).json({ error: "Failed to update member role" });
  }
};

// Get all communities a user is a member of
export const getUserCommunities = async (req: Request, res: Response) => {
  try {
    const userId = parsePositiveInt(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const memberships = await CommunityMember.findAll({
      where: { userId },
    });

    const communityIds = memberships
      .map((membership) => membership.communityId)
      .filter(
        (communityId): communityId is number => communityId !== undefined,
      );

    const communities = await Community.findAll({
      where: { communityId: communityIds },
      order: [["name", "ASC"]],
    });

    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user communities" });
  }
};

// Get a community by ID with member count
export const getCommunityDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const community = await Community.findByPk(id, {
      include: [{ model: CommunityMember, attributes: [] }],
      attributes: {
        include: [
          [
            Community.sequelize!.fn(
              "COUNT",
              Community.sequelize!.col("CommunityMembers.memberId"),
            ),
            "membersCount",
          ],
        ],
      },
      group: ["Community.communityId"],
    });
    if (!community)
      return res.status(404).json({ error: "Community not found" });
    res.json(community);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community details" });
  }
};

// Join a community
export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    const userId = parsePositiveInt(req.body?.userId);

    if (!communityId)
      return res.status(400).json({ error: "Invalid community id" });
    if (!userId) return res.status(400).json({ error: "Invalid user id" });

    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    const existing = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (existing) {
      const count = await CommunityMember.count({ where: { communityId } });
      await community.update({ membersCount: count });
      return res.status(200).json({
        message: "Already a member",
        membership: existing,
        membersCount: count,
      });
    }

    // Private communities: create a join request instead of joining immediately
    if (community.isPublic === "Private") {
      const existingRequest = await CommunityJoinRequest.findOne({
        where: { communityId, userId },
      });

      if (existingRequest) {
        if (existingRequest.status === "pending") {
          return res.status(200).json({
            message: "Join request already pending",
            joinRequest: existingRequest,
          });
        }

        // Allow re-requesting after rejection
        await existingRequest.update({
          status: "pending",
          reviewedBy: null,
          reviewedAt: null,
        });
        return res.status(202).json({
          message: "Join request submitted",
          joinRequest: existingRequest,
        });
      }

      const joinRequest = await CommunityJoinRequest.create({
        communityId,
        userId,
        status: "pending",
      });

      return res.status(202).json({
        message: "Join request submitted",
        joinRequest,
      });
    }

    // Public communities: join immediately
    const membership = await CommunityMember.create({
      communityId,
      userId,
      role: "member",
    });

    const count = await CommunityMember.count({ where: { communityId } });
    await community.update({ membersCount: count });

    return res.status(201).json({
      message: "Joined community",
      membership,
      membersCount: count,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to join community" });
  }
};

export const getCommunityJoinRequestStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    const userId = parsePositiveInt(req.params.userId);

    if (!communityId)
      return res.status(400).json({ error: "Invalid community id" });
    if (!userId) return res.status(400).json({ error: "Invalid user id" });

    const joinRequest = await CommunityJoinRequest.findOne({
      where: { communityId, userId },
      attributes: [
        "requestId",
        "communityId",
        "userId",
        "status",
        "createdAt",
        "updatedAt",
      ],
    });

    return res.json({
      hasRequest: Boolean(joinRequest),
      status: joinRequest?.status ?? null,
      joinRequest,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch join request status" });
  }
};

export const listCommunityJoinRequests = async (
  req: Request,
  res: Response,
) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    if (!communityId)
      return res.status(400).json({ error: "Invalid community id" });

    const actorUserId =
      parsePositiveInt(req.query.actorUserId) ??
      parsePositiveInt(req.query.userId) ??
      parsePositiveInt(req.body?.actorUserId) ??
      parsePositiveInt(req.body?.userId);

    if (!actorUserId) {
      return res.status(400).json({ error: "actorUserId is required" });
    }

    const staffCheck = await isCommunityStaff(communityId, actorUserId);
    if (!staffCheck.ok) {
      if (staffCheck.reason === "not_found") {
        return res.status(404).json({ error: "Community not found" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    const status =
      typeof req.query.status === "string" ? req.query.status : "pending";
    const where: Record<string, unknown> = { communityId };
    if (status && status !== "all") where.status = status;

    const requests = await CommunityJoinRequest.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    return res.json({
      communityId,
      requests,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list join requests" });
  }
};

const reviewJoinRequest = async (
  req: Request,
  res: Response,
  action: "accepted" | "rejected",
) => {
  try {
    const communityId = parsePositiveInt(req.params.id);
    const requestId = parsePositiveInt(req.params.requestId);
    const actorUserId = parsePositiveInt(
      req.body?.actorUserId ?? req.body?.userId,
    );

    if (!communityId)
      return res.status(400).json({ error: "Invalid community id" });
    if (!requestId)
      return res.status(400).json({ error: "Invalid request id" });
    if (!actorUserId)
      return res.status(400).json({ error: "actorUserId is required" });

    const staffCheck = await isCommunityStaff(communityId, actorUserId);
    if (!staffCheck.ok) {
      if (staffCheck.reason === "not_found") {
        return res.status(404).json({ error: "Community not found" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    const joinRequest = await CommunityJoinRequest.findOne({
      where: { requestId, communityId },
    });

    if (!joinRequest) {
      return res.status(404).json({ error: "Join request not found" });
    }

    if (joinRequest.status !== "pending") {
      return res.status(409).json({
        error: `Join request already ${joinRequest.status}`,
        joinRequest,
      });
    }

    await joinRequest.update({
      status: action,
      reviewedBy: actorUserId,
      reviewedAt: new Date(),
    });

    let membership = null;
    if (action === "accepted") {
      const existingMembership = await CommunityMember.findOne({
        where: { communityId, userId: joinRequest.userId },
      });
      membership =
        existingMembership ??
        (await CommunityMember.create({
          communityId,
          userId: joinRequest.userId,
          role: "member",
        }));

      const count = await CommunityMember.count({ where: { communityId } });
      await staffCheck.community.update({ membersCount: count });

      return res.json({
        message: "Join request accepted",
        joinRequest,
        membership,
        membersCount: count,
      });
    }

    return res.json({
      message: "Join request rejected",
      joinRequest,
      membership,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to review join request" });
  }
};

export const acceptCommunityJoinRequest = async (
  req: Request,
  res: Response,
) => {
  return reviewJoinRequest(req, res, "accepted");
};

export const rejectCommunityJoinRequest = async (
  req: Request,
  res: Response,
) => {
  return reviewJoinRequest(req, res, "rejected");
};

// Check if a user is a member of a community
export const getCommunityMembershipStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const communityId = Number(req.params.id);
    const userId = Number(req.params.userId);

    if (!Number.isFinite(communityId) || communityId <= 0) {
      return res.status(400).json({ error: "Invalid community id" });
    }
    if (!Number.isFinite(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const membership = await CommunityMember.findOne({
      where: { communityId, userId },
      attributes: ["memberId", "communityId", "userId", "role"],
    });

    return res.json({
      isMember: Boolean(membership),
      role: membership?.role ?? null,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch membership status" });
  }
};
