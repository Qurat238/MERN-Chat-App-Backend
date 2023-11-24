import express from "express";
import { registerUser, loginUser, logout, allUsers } from "../controllers/UserController.js";
const router = express.Router();
import { isAuthenticatedUser } from "../utils/auth.js";

router.route("/").post(registerUser).get(isAuthenticatedUser, allUsers);
router.post("/login", loginUser);
router.get("/logout", logout);

export default router;