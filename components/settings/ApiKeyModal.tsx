"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => Promise<void>;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSave(apiKey);
      onClose();
    } catch (error) {
      setError("Failed to save API key");
      console.error("Error saving API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable AI responses in the chat.
            You can get your API key from the{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              OpenAI dashboard
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded bg-red-50 p-3 text-red-500 dark:bg-red-900/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Your API key is stored securely and never shared.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
