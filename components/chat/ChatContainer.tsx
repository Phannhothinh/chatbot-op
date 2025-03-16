"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ApiKeyModal } from "@/components/settings/ApiKeyModal";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { MessageProps } from "./Message";

// Type for message from API
interface ApiMessage {
  content: string;
  sender: string;
  timestamp: string;
  isUser: boolean;
  userId: string;
  _id: string;
}

export function ChatContainer() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [apiConfigs, setApiConfigs] = useState<Record<string, { model: string }>>({});

  // Check if API key is set
  const checkApiKey = useCallback(async () => {
    if (status !== "authenticated") return;
    
    try {
      const response = await fetch('/api/settings/api-key');
      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
        setActiveProvider(data.activeProvider);
        setApiConfigs(data.configs || {});
        
        if (!data.hasApiKey) {
          setShowApiKeyModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking API key:', error);
    }
  }, [status]);

  // Save API key with provider and model
  const saveApiKey = async (provider: string, model: string, apiKey: string) => {
    try {
      const response = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, model, apiKey }),
      });
      
      if (response.ok) {
        setHasApiKey(true);
        setActiveProvider(provider);
        setApiConfigs(prev => ({
          ...prev,
          [provider]: { model }
        }));
        // Reload the page to apply the new API key
        window.location.reload();
      } else {
        throw new Error('Failed to save API key');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  };

  // Fetch chat history when component mounts or session changes
  useEffect(() => {
    checkApiKey();
    
    const fetchMessages = async () => {
      if (status !== "authenticated") return;
      
      setIsLoadingHistory(true);
      try {
        const response = await fetch('/api/messages');
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          // Convert messages from API to MessageProps format
          const formattedMessages = data.messages.map((msg: ApiMessage) => ({
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
            isUser: msg.isUser,
          }));
          
          setMessages(formattedMessages);
        } else {
          // If no messages, set a welcome message
          setMessages([
            {
              content: "Hello! I'm your AI assistant. How can I help you today?",
              sender: "Assistant",
              timestamp: new Date(),
              isUser: false,
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Set default welcome message on error
        setMessages([
          {
            content: "Hello! I'm your AI assistant. How can I help you today?",
            sender: "Assistant",
            timestamp: new Date(),
            isUser: false,
          },
        ]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchMessages();
  }, [status, checkApiKey]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: MessageProps = {
      content,
      sender: session?.user?.name || "You",
      timestamp: new Date(),
      isUser: true,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      const assistantMessage: MessageProps = {
        content: data.response,
        sender: "Assistant",
        timestamp: new Date(),
        isUser: false,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      const errorMessage: MessageProps = {
        content: "Sorry, there was an error processing your request. Please try again later.",
        sender: "System",
        timestamp: new Date(),
        isUser: false,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onSave={saveApiKey}
        initialProvider={activeProvider || undefined}
        initialModel={activeProvider && apiConfigs[activeProvider] ? apiConfigs[activeProvider].model : undefined}
      />
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Chat</h2>
          {activeProvider && apiConfigs[activeProvider] && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Using: <span className="font-medium">{activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1)}</span> - 
                <span className="font-medium"> {apiConfigs[activeProvider].model}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowApiKeyModal(true)}
              >
                Change
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-muted-foreground">Loading messages...</p>
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
        </div>
        <div className="p-4">
          <MessageInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading || status !== "authenticated"} 
          />
          
          {status === "authenticated" && !hasApiKey && (
            <div className="mt-4 text-center">
              <Button 
                onClick={() => setShowApiKeyModal(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Configure AI Provider
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Set up your AI provider to enable AI responses
              </p>
            </div>
          )}
          
          {status === "authenticated" && hasApiKey && (
            <div className="mt-2 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowApiKeyModal(true)}
              >
                Change AI Provider Settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
