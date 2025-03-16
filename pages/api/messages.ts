import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Message from '@/models/Message';
import { connectMongo } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions) as any;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      await connectMongo();
      const userId = (session.user as any).id || session.user?.email;

      if (!userId) {
        return res.status(400).json({ error: 'User ID not found in session' });
      }

      // Get messages for the current user, sorted by timestamp
      const messages = await Message.find({ userId })
        .sort({ timestamp: 1 })
        .limit(50); // Limit to the last 50 messages

      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
