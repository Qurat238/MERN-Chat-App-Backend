import express from "express";
const router = express.Router();
import { sendMessage, allMessages } from "../controllers/MessageController.js";
import { isAuthenticatedUser } from "../utils/auth.js";

router.route("/").post(isAuthenticatedUser, sendMessage);
router.route("/:chatId").get(isAuthenticatedUser, allMessages);

export default router;