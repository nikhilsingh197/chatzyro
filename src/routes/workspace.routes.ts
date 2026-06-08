
import { Router } from "express";
import prisma from "../lib/prisma";
import {
  authMiddleware,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { name } = req.body;

      const workspace = await prisma.workspace.create({
        data: {
          name,
        },
      });

      await prisma.workspaceMember.create({
        data: {
          userId: req.user!.userId,
          workspaceId: workspace.id,
          role: "owner",
        },
      });

      return res.status(201).json({
        success: true,
        workspace,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error: String(error),
      });
    }
  }
);

export default router;