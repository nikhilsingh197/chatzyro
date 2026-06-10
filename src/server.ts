import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import workspaceRoutes from "./routes/workspace.routes";
import agentRoutes from "./routes/agent.routes";
import { authMiddleware, AuthRequest } from "./middleware/auth.middleware";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";
import chatRoutes from "./routes/chat.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import campaignRoutes from "./routes/campaign";
import whatsappRoutes from "./routes/whatsapp.routes";
import inboxRoutes from "./routes/inbox.routes";
import contactsRoutes from "./routes/contacts";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/inbox", inboxRoutes);
app.use("/contacts", contactsRoutes);

app.get("/profile", authMiddleware, (req: AuthRequest, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
