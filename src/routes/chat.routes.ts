import { Router } from "express";
import prisma from "../lib/prisma";
import { generateReply } from "../services/ai.service";

const router = Router();

router.post("/reply", async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        agent: true,
      },
    });

    const aiReply = await generateReply(
      conversation?.agent?.prompt ||
        "You are a professional sales representative for ABC Company. Your goal is to convert WhatsApp inquiries into paying customers.",
      message,
    );

    await prisma.message.create({
      data: {
        conversationId,
        content: message,
        direction: "incoming",
      },
    });

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
