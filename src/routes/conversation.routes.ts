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
  const conversations = await prisma.conversation.findMany();

  res.json({
    success: true,
    conversations,
  });
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
export default router;
