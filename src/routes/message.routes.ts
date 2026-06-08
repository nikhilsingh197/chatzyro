import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { conversationId, content, direction } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        direction,
      },
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
router.get("/conversation/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
export default router;