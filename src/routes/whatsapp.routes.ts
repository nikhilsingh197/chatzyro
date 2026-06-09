import { Router } from "express";
import prisma from "../lib/prisma";
import { sendWhatsAppMessage } from "../services/whatsapp.service";
const workspaceId = "387d644a-2b20-422f-86e1-6e1942cd8d88";
const router = Router();

// Replace with your real workspace ID


router.post("/send", async (req, res) => {
  try {
    const { phone, message } = req.body;

    const result = await sendWhatsAppMessage(phone, message);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Meta verification
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("MODE:", mode);
  console.log("TOKEN:", token);

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Incoming WhatsApp messages
router.post("/webhook", async (req, res) => {
  try {
    console.log("WEBHOOK HIT");

    const value = req.body?.entry?.[0]?.changes?.[0]?.value;

    // Ignore status updates
    if (value?.statuses) {
      console.log("STATUS:", value.statuses[0]?.status);

      return res.sendStatus(200);
    }

    const incomingMessage = value?.messages?.[0];

    if (!incomingMessage) {
      return res.sendStatus(200);
    }

    const phone = incomingMessage.from;
    const content = incomingMessage.text?.body || "";

    const profileName = value?.contacts?.[0]?.profile?.name || "Unknown";

    console.log("PHONE:", phone);
    console.log("MESSAGE:", content);

    // Find contact
   const workspace = await prisma.workspace.findFirst();

if (!workspace) {
  console.error("No workspace found");
  return res.sendStatus(200);
}

let contact = await prisma.contact.create({
  data: {
    phone,
    name: profileName,
    workspaceId: workspace.id,
  },
});

    // Find conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: contact.id,
      },
    });

    // Create conversation if missing
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
        },
      });
    }

    // Save message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        direction: "incoming",
      },
    });

    console.log("Message saved successfully");

    res.sendStatus(200);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

export default router;
