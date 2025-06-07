import { Router } from "express";
import { authenticateJwt } from "../middleware/auth";
import { validateTask } from "../middleware/validate";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
  logPomodoroSession,
  getTaskSummary,
} from "../controllers/taskController";

const router = Router();

router.post("/", authenticateJwt, validateTask, createTask);
router.put("/:id", authenticateJwt, validateTask, updateTask);
router.delete("/:id", authenticateJwt, deleteTask);
router.post("/:id/pomodoro", authenticateJwt, logPomodoroSession);
router.get("/summary", authenticateJwt, getTaskSummary);
router.get("/:id", authenticateJwt, getTask);
router.get("/", authenticateJwt, getTasks);

export default router;
