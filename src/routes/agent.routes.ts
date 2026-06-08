import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, prompt, workspaceId } = req.body;

    const agent = await prisma.agent.create({
      data: {
        name,
        prompt,
        workspaceId,
      },
    });

    res.status(201).json({
      success: true,
      agent,
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
    const agents = await prisma.agent.findMany();

    res.json({
      success: true,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
router.get("/:id", async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    success: true,
    agent,
  });
});
router.patch("/:id", async (req, res) => {
  const { name, prompt } = req.body;

  const agent = await prisma.agent.update({
    where: {
      id: req.params.id,
    },
    data: {
      name,
      prompt,
    },
  });

  res.json({
    success: true,
    agent,
  });
});
router.delete("/:id", async (req, res) => {
  await prisma.agent.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    success: true,
    message: "Agent deleted",
  });
});

export default router;