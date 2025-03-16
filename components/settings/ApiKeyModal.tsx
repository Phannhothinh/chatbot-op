"use client";

import { useState, useEffect } from "react";
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
import { AI_PROVIDERS, getProviderById, getDefaultModelForProvider } from "@/lib/providers";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: string, model: string, apiKey: string) => Promise<void>;
  initialProvider?: string;
  initialModel?: string;
  initialApiKey?: string;
}

export function ApiKeyModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialProvider = 'openai',
  initialModel,
  initialApiKey = ''
}: ApiKeyModalProps) {
  const [provider, setProvider] = useState(initialProvider);
  const [model, setModel] = useState(initialModel || getDefaultModelForProvider(initialProvider));
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Update model when provider changes
  useEffect(() => {
    setModel(getDefaultModelForProvider(provider));
  }, [provider]);

  const selectedProvider = getProviderById(provider);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSave(provider, model, apiKey);
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
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider and API key to enable AI responses in the chat.
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
              <label htmlFor="provider" className="text-sm font-medium">
                AI Provider
              </label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AI_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="model" className="text-sm font-medium">
                Model
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedProvider?.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} - {m.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={selectedProvider?.apiKeyPlaceholder || ""}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Your API key is stored securely and never shared. You can get your API key from the{" "}
                <a
                  href={selectedProvider?.apiDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {selectedProvider?.name} dashboard
                </a>.
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
