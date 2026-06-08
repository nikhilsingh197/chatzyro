import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { authMiddleware, AuthRequest } from "./middleware/auth.middleware";

const app = express();
import workspaceRoutes from "./routes/workspace.routes";

app.use("/api/workspaces", workspaceRoutes);
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get(
  "/profile",
  authMiddleware,
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});