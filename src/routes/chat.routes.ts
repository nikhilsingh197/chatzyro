import { Router } from "express";
import prisma from "../lib/prisma";
import { generateReply } from "../services/ai.service";

const router = Router();

router.post("/reply", async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          agent: true,
        },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
      });
    }

 const conversations= await prisma.conversation.findUnique({
  where: { id: conversationId },
  include: { agent: true },
});

if (!conversation || !conversation.agent) {
  return res.status(404).json({
    success: false,
    error: "Conversation or agent not found",
  });
}

    await prisma.message.create({
      data: {
        conversationId,
        content: aiReply,
        direction: "outgoing",
      },
    });

    res.json({
      success: true,
      reply: aiReply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

export default router;