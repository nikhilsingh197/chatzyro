import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { contactId } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        contactId,
      },
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
router.get("/", async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        contact: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        contact: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
router.get("/conversations/count", async (req, res) => {
  const count = await prisma.conversation.count();

  res.json({
    success: true,
    count,
  });
});
router.get("/:id/messages", async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: req.params.id,
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
