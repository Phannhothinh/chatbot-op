import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import OpenAI from 'openai';
import { CohereClient } from 'cohere-ai';
import Message from '@/models/Message';
import User from '@/models/User';
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
      // @ts-expect-error - Session user type from NextAuth
      const userId = session.user?.id || session.user?.email;

      if (!userId) {
        return res.status(400).json({ error: 'User ID not found in session' });
      }

      // Save user message to database
      await Message.create({
        content: message,
        // @ts-expect-error - Session user type from NextAuth
        sender: session.user?.name || session.user?.email,
        isUser: true,
        userId,
      });

      // Get user's API configuration
      const user = await User.findOne({ id: userId });
      
      if (!user || !user.apiConfigs || user.apiConfigs.size === 0 || !user.activeProvider) {
        // No API configuration found
        const aiResponse = `Please configure an AI provider in your settings to enable AI responses.`;
        
        // Save assistant response to database
        await Message.create({
          content: aiResponse,
          sender: 'Assistant',
          isUser: false,
          userId,
        });
        
        return res.status(200).json({ response: aiResponse });
      }

      // Get active provider config
      const providerConfig = user.apiConfigs.get(user.activeProvider);
      
      if (!providerConfig || !providerConfig.apiKey || !providerConfig.model) {
        const aiResponse = `Your AI provider configuration is incomplete. Please update your settings.`;
        
        // Save assistant response to database
        await Message.create({
          content: aiResponse,
          sender: 'Assistant',
          isUser: false,
          userId,
        });
        
        return res.status(200).json({ response: aiResponse });
      }

      // Get previous messages for context (limit to last 10)
      const previousMessages = await Message.find({ userId })
        .sort({ timestamp: -1 })
        .limit(10);
      
      // Reverse to get chronological order
      const chronologicalMessages = previousMessages.reverse();

      let aiResponse = '';

      // Process based on provider
      switch (user.activeProvider) {
        case 'openai': {
          const openai = new OpenAI({
            apiKey: providerConfig.apiKey,
            dangerouslyAllowBrowser: true,
          });

          // Prepare messages for OpenAI API
          const messages = [
            {
              role: 'system',
              content: 'You are a helpful assistant. Provide concise and accurate responses.'
            }
          ];
          
          // Add conversation history
          chronologicalMessages.forEach(msg => {
            messages.push({
              role: msg.isUser ? 'user' : 'assistant',
              content: msg.content
            });
          });

          // Call OpenAI API
          const completion = await openai.chat.completions.create({
            model: providerConfig.model,
            messages: messages as Array<{
              role: 'system' | 'user' | 'assistant';
              content: string;
            }>,
          });

          aiResponse = completion.choices[0].message.content || 'Sorry, I could not generate a response.';
          break;
        }
        
        case 'cohere': {
          const cohere = new CohereClient({ 
            token: providerConfig.apiKey 
          });

          // Format chat history for Cohere
          const chatHistory = chronologicalMessages.map(msg => ({
            role: msg.isUser ? 'USER' : 'CHATBOT' as 'USER' | 'CHATBOT',
            message: msg.content
          }));

          const response = await cohere.chat({
            model: providerConfig.model,
            message: message,
            chatHistory: chatHistory,
          });

          aiResponse = response.text || 'Sorry, I could not generate a response.';
          break;
        }
        
        case 'anthropic':
        case 'mistral':
          aiResponse = `Support for ${user.activeProvider} is coming soon. Please use OpenAI or Cohere for now.`;
          break;
        
        default: {
          aiResponse = `Provider ${user.activeProvider} is not supported.`;
        }
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
      return res.status(500).json({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
