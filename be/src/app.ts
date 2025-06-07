import express from "express";
import cors from "cors";
import passport from "passport";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import taskRoutes from "./routes/task";
import "./middleware/auth"; // initializes passport strategy

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Unified error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

export default app;
