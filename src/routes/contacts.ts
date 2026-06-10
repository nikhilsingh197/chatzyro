import { Router } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import prisma from "../lib/prisma";

const router = Router();

const upload = multer({
  dest: "uploads/",
});

const workspaceId = "387d644a-2b20-422f-86e1-6e1942cd8d88";

// Create Contact
router.post("/", async (req, res) => {
  try {
    const { name, phone } = req.body;

    const existing = await prisma.contact.findFirst({
      where: {
        phone: row.phone,
        workspaceId,
      },
    });

    if (!existing) {
      await prisma.contact.create({
        data: {
          name: row.name,
          phone: row.phone,
          workspaceId,
        },
      });
    }

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

// Get All Contacts
router.get("/", async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json({
      success: true,
      contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Import CSV
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    const contacts: any[] = [];

    fs.createReadStream(req.file!.path)
      .pipe(csv())
      .on("data", (row) => {
        contacts.push(row);
      })
      .on("end", async () => {
        let imported = 0;

        for (const row of contacts) {
          let phone = String(row.phone).replace(/\D/g, "");

          // Convert 10 digit Indian numbers to 91xxxxxxxxxx
          if (phone.length === 10) {
            phone = "91" + phone;
          }

          await prisma.contact.upsert({
            where: {
              phone,
            },
            update: {
              name: row.name?.trim(),
            },
            create: {
              name: row.name?.trim(),
              phone,
              workspaceId,
            },
          });

          imported++;
        }

        // Delete uploaded temp file
        fs.unlinkSync(req.file!.path);

        res.json({
          success: true,
          imported,
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Get Single Contact
router.get("/:id", async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: {
        id: req.params.id,
      },
    });

    res.json({
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

// Delete Contact
router.delete("/:id", async (req, res) => {
  try {
    await prisma.contact.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      message: "Contact deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

export default router;
