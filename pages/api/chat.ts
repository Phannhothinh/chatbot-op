import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import OpenAI from 'openai';
import Message from '@/models/Message';
import { connectMongo } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      await connectMongo();
      const { message } = req.body;
      const userId = (session.user as any).id || session.user?.email;

      if (!userId) {
        return res.status(400).json({ error: 'User ID not found in session' });
      }

      // Save user message to database
      await Message.create({
        content: message,
        sender: session.user?.name || session.user?.email,
        isUser: true,
        userId,
      });

      let aiResponse = '';

      // Check if OpenAI API key is configured
      if (process.env.OPENAI_API_KEY) {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Get previous messages for context (limit to last 10)
        const previousMessages = await Message.find({ userId })
          .sort({ timestamp: -1 })
          .limit(10);
        
        // Reverse to get chronological order
        const contextMessages = previousMessages
          .reverse()
          .map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content,
          }));

        // Add system message at the beginning
        contextMessages.unshift({
          role: 'system',
          content: 'You are a helpful assistant. Provide concise and accurate responses.',
        });

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: contextMessages,
        });

        aiResponse = completion.choices[0].message.content || 'Sorry, I could not generate a response.';
      } else {
        // Fallback if no API key is configured
        aiResponse = `I'm sorry, but the AI service is not configured. Please add your OpenAI API key to the .env.local file.`;
      }

      // Save assistant response to database
      await Message.create({
        content: aiResponse,
        sender: 'Assistant',
        isUser: false,
        userId,
      });

      return res.status(200).json({ response: aiResponse });
    } catch (error) {
      console.error('Error processing chat request:', error);
      return res.status(500).json({ error: 'Failed to process chat request' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
