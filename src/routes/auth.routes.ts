
import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

const router = Router();

import jwt from "jsonwebtoken";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

export default router;
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route works"
  });
});