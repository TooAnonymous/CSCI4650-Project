import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "@/model/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    try {
        const { id } = req.body;

        await prisma.todo.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Deleted' });
    } catch (e) {
        res.status(400).json(e);
    }
}