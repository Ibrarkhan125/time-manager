import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController";
import { authenticateJwt } from "../middleware/auth";

const router = Router();

router.get("/profile", authenticateJwt, getProfile);
router.put("/profile", authenticateJwt, updateProfile);

export default router;
