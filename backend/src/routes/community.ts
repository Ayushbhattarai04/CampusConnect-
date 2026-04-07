import { Router } from "express";
import {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityMembershipStatus,
  getCommunityJoinRequestStatus,
  listCommunityJoinRequests,
  acceptCommunityJoinRequest,
  rejectCommunityJoinRequest,
  listCommunityMembers,
  kickCommunityMember,
  setCommunityMemberRole,
} from "../controllers/community";
const router = Router();

router.post("/", createCommunity);
router.get("/", getAllCommunities);
// User-level helpers
router.get("/user/:userId/communities", getUserCommunities);
router.get("/:id", getCommunityById);
router.put("/:id", updateCommunity);
router.delete("/:id", deleteCommunity);
router.post("/:id/join", joinCommunity);
router.delete("/:id/leave", leaveCommunity);
router.get("/:id/membership/:userId", getCommunityMembershipStatus);

// Community management (owner/admin)
router.get("/:id/members", listCommunityMembers);
router.delete("/:id/members/:memberUserId", kickCommunityMember);
router.put("/:id/members/:memberUserId/role", setCommunityMemberRole);

// Join requests (private communities)
router.get("/:id/join-requests/status/:userId", getCommunityJoinRequestStatus);
router.get("/:id/join-requests", listCommunityJoinRequests);
router.put("/:id/join-requests/:requestId/accept", acceptCommunityJoinRequest);
router.put("/:id/join-requests/:requestId/reject", rejectCommunityJoinRequest);

export default router;
