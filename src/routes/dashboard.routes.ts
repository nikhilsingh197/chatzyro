import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const contacts = await prisma.contact.count();
    const conversations = await prisma.conversation.count();
    const messages = await prisma.message.count();
    const agents = await prisma.agent.count();

    res.json({
      success: true,
      stats: {
        contacts,
        conversations,
        messages,
        agents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

export default router;
