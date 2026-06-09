import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, phone, workspaceId } = req.body;

    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        workspaceId,
      },
    });

    res.status(201).json({
      success: true,
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
router.get("/", async (req, res) => {
  const workspaces = await prisma.workspace.findMany();

  res.json({
    success: true,
    workspaces,
  });
});

export default router;
