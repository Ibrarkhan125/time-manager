import { Request, Response, NextFunction } from "express";

export function validateTask(req: Request, res: Response, next: NextFunction) {
  const { title, priority } = req.body;
  if (
    !title ||
    typeof title !== "string" ||
    !priority ||
    typeof priority !== "string"
  ) {
    // return
    res.status(400).json({
      message: "Task title and priority are required and must be strings.",
    });
  }
  next();
}
