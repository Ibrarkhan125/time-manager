import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma/";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  try {
    const tasks = await prisma.task.findMany({ where: { userId } });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks", error: err });
  }
};

export const getTask = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const { id } = req.params;
  try {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task", error: err });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  // @ts-ignore
  const userId = req.user?.id;
  const { title, description, notes, dueDate, priority, category } = req.body;
  try {
    const task = await prisma.task.create({
      data: { title, description, notes, dueDate, priority, category, userId },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task", error: err });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const { id } = req.params;
  const { title, description, notes, dueDate, priority, category, completed } =
    req.body;
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        notes,
        dueDate,
        priority,
        category,
        completed,
      },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task", error: err });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task", error: err });
  }
};

export const logPomodoroSession = async (req: Request, res: Response) => {
  const { id } = req.params; // taskId
  const { startTime, endTime, completed } = req.body;
  try {
    const session = await prisma.pomodoroSession.create({
      data: { taskId: id, startTime, endTime, completed },
    });
    res.status(201).json(session);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to log Pomodoro session", error: err });
  }
};

export const getTaskSummary = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const { range } = req.query; // 'daily' or 'weekly'
  const now = new Date();
  let from: Date;
  if (range === "weekly") {
    from = new Date(now);
    from.setDate(now.getDate() - 6); // last 7 days
  } else {
    from = new Date(now);
    from.setHours(0, 0, 0, 0); // today only
  }
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        completed: true,
        updatedAt: { gte: from, lte: now },
      },
    });
    const total = await prisma.task.count({ where: { userId } });
    const completed = tasks.length;
    res.json({ range: range || "daily", completed, total });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch summary", error: err });
  }
};
