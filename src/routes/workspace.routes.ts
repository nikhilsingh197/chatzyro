
import { Router } from "express";
import prisma from "../lib/prisma";
import {
  authMiddleware,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const workspaces = await prisma.workspaceMember.findMany({
        where: {
          userId: req.user!.userId,
        },
        include: {
          workspace: true,
        },
      });

      return res.json({
        success: true,
        workspaces,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: String(error),
      });
    }
  }
);
export default router;