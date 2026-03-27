import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, completed } = req.body;

    const todo = await prisma.todo.update({
      where: { id },
      data: { completed }
    });

    res.status(200).json(todo);
  } catch (e) {
    res.status(400).json(e);
  }
}