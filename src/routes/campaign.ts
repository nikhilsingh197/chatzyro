import { Router } from "express";
import prisma from "../lib/prisma";
import { sendWhatsAppMessage } from "../services/whatsapp.service";

const router = Router();

// Create Campaign
router.post("/", async (req, res) => {
  try {
    const { name, message, workspaceId } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        message,
        workspaceId,
      },
    });

    res.status(201).json({
      success: true,
      campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Get All Campaigns
router.get("/", async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      campaigns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Get Single Campaign
router.get("/:id", async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Delete Campaign
router.delete("/:id", async (req, res) => {
  try {
    await prisma.campaign.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      message: "Campaign deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Add One Contact To Campaign
router.post("/:id/contacts", async (req, res) => {
  try {
    const { contactId } = req.body;

    const campaignContact = await prisma.campaignContact.create({
      data: {
        campaignId: req.params.id,
        contactId,
      },
    });

    res.status(201).json({
      success: true,
      campaignContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Get Campaign Contacts
router.get("/:id/contacts", async (req, res) => {
  try {
    const contacts = await prisma.campaignContact.findMany({
      where: {
        campaignId: req.params.id,
      },
      include: {
        contact: true,
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

// Campaign Stats
router.get("/:id/stats", async (req, res) => {
  try {
    const campaignId = req.params.id;

    const pending = await prisma.campaignContact.count({
      where: {
        campaignId,
        status: "pending",
      },
    });

    const sent = await prisma.campaignContact.count({
      where: {
        campaignId,
        status: "sent",
      },
    });

    const failed = await prisma.campaignContact.count({
      where: {
        campaignId,
        status: "failed",
      },
    });

    res.json({
      success: true,
      stats: {
        pending,
        sent,
        failed,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Send Campaign
router.post("/:id/send", async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const campaignContacts = await prisma.campaignContact.findMany({
      where: {
        campaignId: campaign.id,
      },
    });

    for (const item of campaignContacts) {
      const contact = await prisma.contact.findUnique({
        where: {
          id: item.contactId,
        },
      });

      if (!contact) continue;

      try {
        await sendWhatsAppMessage(
          contact.phone,
          campaign.message.replace("{{name}}", contact.name || "Customer"),
        );

        let conversation = await prisma.conversation.findFirst({
          where: {
            contactId: contact.id,
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              contactId: contact.id,
            },
          });
        }

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: campaign.message,
            direction: "outgoing",
          },
        });

        await prisma.campaignContact.update({
          where: {
            id: item.id,
          },
          data: {
            status: "sent",
          },
        });
      } catch (error) {
        console.error(error);

        await prisma.campaignContact.update({
          where: {
            id: item.id,
          },
          data: {
            status: "failed",
          },
        });
      }
    }

    res.json({
      success: true,
      sent: campaignContacts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Add All Contacts To Campaign
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
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});
router.get("/campaigns/count", async (req, res) => {
  const count = await prisma.campaign.count();

  res.json({
    success: true,
    count,
  });
});
export default router;
