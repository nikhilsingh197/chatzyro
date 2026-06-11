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

/* -----------------------------
   CREATE CONTACT
------------------------------*/
router.post("/", async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "name and phone are required",
      });
    }

    const existing = await prisma.contact.findFirst({
      where: {
        phone,
        workspaceId,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Contact already exists",
      });
    }

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        phone,
        workspaceId,
      },
    });

    return res.status(201).json({
      success: true,
      contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/* -----------------------------
   GET ALL CONTACTS
------------------------------*/
router.get("/", async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.json({
      success: true,
      contacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/* -----------------------------
   IMPORT CSV
------------------------------*/
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const contacts: any[] = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        if (row.name && row.phone) {
          contacts.push(row);
        }
      })
      .on("end", async () => {
        let imported = 0;

        for (const row of contacts) {
          let phone = String(row.phone).replace(/\D/g, "");

          // Convert 10-digit Indian numbers to 91xxxxxxxxxx
          if (phone.length === 10) {
            phone = "91" + phone;
          }

          await prisma.contact.upsert({
            where: {
              phone,
            },
            update: {
              name: row.name.trim(),
            },
            create: {
              name: row.name.trim(),
              phone,
              workspaceId,
            },
          });

          imported++;
        }

        fs.unlinkSync(req.file!.path);

        return res.json({
          success: true,
          imported,
        });
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/* -----------------------------
   GET SINGLE CONTACT
------------------------------*/
router.get("/:id", async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: {
        id: req.params.id,
      },
    });

    return res.json({
      success: true,
      contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/* -----------------------------
   DELETE CONTACT
------------------------------*/
router.delete("/:id", async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { contactid },
    });

    for (const conv of conversations) {
      await prisma.message.deleteMany({
        where: {
          conversationId: conv.id,
        },
      });
    }

    await prisma.conversation.deleteMany({
      where: {
        contactid,
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
router.get("/contacts/count", async (req, res) => {
  const count = await prisma.contact.count();

  res.json({
    success: true,
    count,
  });
});

router.post("/:id/add-all-contacts", async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany();

    let added = 0;

    for (const contact of contacts) {
      const exists = await prisma.campaignContact.findFirst({
        where: {
          campaignId: req.params.id,
          contactId: contact.id,
        },
      });

      if (!exists) {
        await prisma.campaignContact.create({
          data: {
            campaignId: req.params.id,
            contactId: contact.id,
          },
        });

        added++;
      }
    }

    res.json({
      success: true,
      added,
    });
  } catch (error) {
    console.error("ADD CONTACTS ERROR:", error);

    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
export default router;
