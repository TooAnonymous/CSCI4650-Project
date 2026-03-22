import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { id: 'asc' }
    });

    res.status(200).json(todos);
  } catch (e) {
    res.status(400).json(e);
  }
}