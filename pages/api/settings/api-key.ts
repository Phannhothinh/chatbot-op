import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import fs from 'fs';
import path from 'path';

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
      const { apiKey } = req.body;

      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ error: 'Invalid API key' });
      }

      // Get the path to .env.local
      const envPath = path.resolve(process.cwd(), '.env.local');

      // Read the current .env.local file
      let envContent = '';
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch {
        // File might not exist, which is fine
      }

      // Check if OPENAI_API_KEY already exists
      const regex = /^OPENAI_API_KEY=.*/m;
      const newEnvContent = regex.test(envContent)
        ? envContent.replace(regex, `OPENAI_API_KEY=${apiKey}`)
        : envContent + `\nOPENAI_API_KEY=${apiKey}`;

      // Write the updated content back to .env.local
      fs.writeFileSync(envPath, newEnvContent);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving API key:', error);
      return res.status(500).json({ error: 'Failed to save API key' });
    }
  } else if (req.method === 'GET') {
    try {
      // Get the path to .env.local
      const envPath = path.resolve(process.cwd(), '.env.local');

      // Read the current .env.local file
      let envContent = '';
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch {
        // File might not exist, which is fine
        return res.status(200).json({ hasApiKey: false });
      }

      // Check if OPENAI_API_KEY exists and is not commented out
      const regex = /^OPENAI_API_KEY=(.+)/m;
      const match = regex.exec(envContent);
      
      return res.status(200).json({ 
        hasApiKey: !!match && match[1].trim() !== '',
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
