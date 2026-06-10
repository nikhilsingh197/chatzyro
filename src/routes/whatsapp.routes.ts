
import { Router } from "express";
import prisma from "../lib/prisma";
import { sendWhatsAppMessage } from "../services/whatsapp.service";
import { generateReply } from "../services/ai.service";

const router = Router();

const workspaceId =
  "387d644a-2b20-422f-86e1-6e1942cd8d88";

// Send message manually
router.post("/send", async (req, res) => {
  try {
    const { phone, message } = req.body;

    const result = await sendWhatsAppMessage(
      phone,
      message
    );

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

// Meta Verification
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Incoming WhatsApp Webhook
router.post("/webhook", async (req, res) => {
  try {
    console.log("WEBHOOK HIT");

    const value =
      req.body?.entry?.[0]?.changes?.[0]?.value;

    // Ignore status updates
    if (value?.statuses) {
      console.log(
        "STATUS:",
        value.statuses[0]?.status
      );

      return res.sendStatus(200);
    }

    const incomingMessage =
      value?.messages?.[0];

    if (!incomingMessage) {
      return res.sendStatus(200);
    }

    const phone = incomingMessage.from;

    const content =
      incomingMessage.text?.body || "";

    const profileName =
      value?.contacts?.[0]?.profile?.name ||
      "Unknown";

    console.log("PHONE:", phone);
    console.log("MESSAGE:", content);

    // Find Workspace
    const workspace =
      await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
      });

    if (!workspace) {
      console.log("Workspace not found");

      return res.sendStatus(200);
    }

    // Find Contact
    let contact =
      await prisma.contact.findFirst({
        where: {
          phone,
        },
      });

    // Create Contact
    if (!contact) {
      contact =
        await prisma.contact.create({
          data: {
            phone,
            name: profileName,
            workspaceId: workspace.id,
          },
        });
    }

    // Find Conversation
    let conversation =
      await prisma.conversation.findFirst({
        where: {
          contactId: contact.id,
        },
      });

    // Create Conversation
    if (!conversation) {
      conversation =
        await prisma.conversation.create({
          data: {
            contactId: contact.id,
          },
        });
    }

    // Save Incoming Message
    await prisma.message.create({
      data: {
        conversationId:
          conversation.id,
        content,
        direction: "incoming",
      },
    });

    let aiReply = "";

    const lowerMessage =
      content.toLowerCase();

    // Smart Business Replies

    if (
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hello")
    ) {
      aiReply = `
👋 Welcome to Nikhil Marketing Agency

How can we help you?

• Services
• Pricing
• Demo
• Support
`;
    } else if (
      lowerMessage.includes("services")
    ) {
      aiReply = `
Our Services:

✅ WhatsApp Marketing

✅ Lead Generation

✅ CRM Automation

✅ Bulk Messaging

✅ AI Chatbots

Reply "pricing" for pricing details.
`;
    } else if (
      lowerMessage.includes("pricing")
    ) {
      aiReply = `
Our plans start from ₹999/month.

Would you like a callback from our team?
`;
    } else if (
      lowerMessage.includes("demo")
    ) {
      aiReply = `
We can arrange a live demo of our platform.

Please share:

1. Your Name
2. Business Name
3. Preferred Time
`;
    } else {

      // Gemini AI
      aiReply =
        await generateReply(content);
    }

    console.log(
      "AI REPLY:",
      aiReply
    );

    // Send WhatsApp Reply
    await sendWhatsAppMessage(
      phone,
      aiReply
    );

    // Save Outgoing Message
    await prisma.message.create({
      data: {
        conversationId:
          conversation.id,
        content: aiReply,
        direction: "outgoing",
      },
    });

    console.log(
      "Message saved successfully"
    );

    return res.sendStatus(200);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// Test AI
router.get("/test-ai", async (req, res) => {
  try {
    const reply =
      await generateReply("Hello");

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

export default router;

