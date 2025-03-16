import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import fs from "fs/promises";
import path from "path";

// Đường dẫn tới tệp lưu trữ API keys (có thể thay bằng cơ sở dữ liệu)
const API_KEYS_FILE = path.join(process.cwd(), "api-keys.json");

// Khởi tạo tệp nếu chưa tồn tại
const initializeApiKeysFile = async () => {
  try {
    await fs.access(API_KEYS_FILE);
  } catch {
    await fs.writeFile(API_KEYS_FILE, JSON.stringify({}));
  }
};

// Đọc API keys
const readApiKeys = async () => {
  await initializeApiKeysFile();
  const data = await fs.readFile(API_KEYS_FILE, "utf-8");
  return JSON.parse(data);
};

// Lưu API keys
const writeApiKeys = async (data: any) => {
  await fs.writeFile(API_KEYS_FILE, JSON.stringify(data, null, 2));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id as string;

  if (req.method === "GET") {
    try {
      const apiKeys = await readApiKeys();
      const userKeys = apiKeys[userId] || {};
      const hasApiKey = !!userKeys.provider && !!userKeys.apiKey;
      return res.status(200).json({
        hasApiKey,
        activeProvider: userKeys.provider || null,
        configs: userKeys.provider
          ? { [userKeys.provider]: { model: userKeys.model } }
          : {},
      });
    } catch (error) {
      console.error("Error reading API keys:", error);
      return res.status(500).json({ error: "Failed to fetch API keys" });
    }
  }

  if (req.method === "POST") {
    const { provider, model, apiKey } = req.body;

    if (!provider || !model || !apiKey) {
      return res.status(400).json({ error: "Provider, model, and API key are required" });
    }

    try {
      const apiKeys = await readApiKeys();
      apiKeys[userId] = { provider, model, apiKey };
      await writeApiKeys(apiKeys);

      // Lưu API key vào biến môi trường (tạm thời cho session này)
      process.env.COHERE_API_KEY = apiKey;

      return res.status(200).json({ message: "API key saved successfully" });
    } catch (error) {
      console.error("Error saving API key:", error);
      return res.status(500).json({ error: "Failed to save API key" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}