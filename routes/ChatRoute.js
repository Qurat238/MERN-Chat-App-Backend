import express from "express";
const router = express.Router();
import { isAuthenticatedUser } from "../utils/auth.js";
import { addNewMember, chat, createGroup, getAllChats, removeMember, renameGroup } from "../controllers/ChatController.js";

router.route("/").post(isAuthenticatedUser, chat);
router.route("/").get(isAuthenticatedUser, getAllChats);
router.route("/group").post(isAuthenticatedUser, createGroup);
router.route("/rename").put(isAuthenticatedUser, renameGroup);
router.route("/add").put(isAuthenticatedUser, addNewMember);
router.route("/remove").put(isAuthenticatedUser, removeMember);

export default router;