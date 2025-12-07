import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", register);

router.post("/login", login);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Authorized", userId: req.userId });
});

export default router;
