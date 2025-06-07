import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma/";

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    // return
    res.status(500).json({ message: "Failed to fetch profile", error: err });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const { name, email, password } = req.body;
  try {
    const data: any = { name, email };
    if (password) {
      const bcrypt = await import("bcrypt");
      data.password = await bcrypt.default.hash(password, 10);
    }
    const user = await prisma.user.update({ where: { id: userId }, data });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err });
  }
};
