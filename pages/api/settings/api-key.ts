import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectMongo } from '@/lib/db';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // @ts-expect-error - Session user type from NextAuth
  const userId = session.user?.id || session.user?.email;

  if (!userId) {
    return res.status(400).json({ error: 'User ID not found in session' });
  }

  await connectMongo();

  if (req.method === 'POST') {
    try {
      const { provider, model, apiKey } = req.body;

      if (!provider || !model || !apiKey || 
          typeof provider !== 'string' || 
          typeof model !== 'string' || 
          typeof apiKey !== 'string') {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      // Find user and update or create API config
      await User.findOneAndUpdate(
        { id: userId },
        { 
          $set: { 
            [`apiConfigs.${provider}`]: { apiKey, model },
            activeProvider: provider
          } 
        },
        { new: true, upsert: true }
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving API key:', error);
      return res.status(500).json({ error: 'Failed to save API key' });
    }
  } else if (req.method === 'GET') {
    try {
      const user = await User.findOne({ id: userId });
      
      if (!user || !user.apiConfigs || user.apiConfigs.size === 0) {
        return res.status(200).json({ 
          hasApiKey: false,
          configs: {},
          activeProvider: null
        });
      }

      // Convert Map to plain object for JSON response
      const configs: Record<string, { model: string }> = {};
      // Use type assertion to handle mongoose Map type
      user.apiConfigs.forEach((value, key: string) => {
        if (value && typeof value.model === 'string') {
          configs[key] = { model: value.model };
        }
      });
      
      return res.status(200).json({ 
        hasApiKey: true,
        configs,
        activeProvider: user.activeProvider
      });
    } catch (error) {
      console.error('Error checking API key:', error);
      return res.status(500).json({ error: 'Failed to check API key' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
