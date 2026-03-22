import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { title } = req.body;

    const todo = await prisma.todo.create({
      data: {
        title,
        completed: false
      }
    });

    res.status(200).json(todo);
  } catch (e) {
    res.status(400).json(e);
  }
}