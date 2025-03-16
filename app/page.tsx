"use client";

import { useState } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedModel, setSelectedModel] = useState("GPT-3.5");
  const [showSidebar, setShowSidebar] = useState(true);

  // If not authenticated, show login page
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Welcome to AI Chat</h1>
          <p className="mb-8 text-muted-foreground">Please sign in to continue</p>
          <Button 
            onClick={() => signIn()} 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-2 text-lg font-medium"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <h1 className="text-xl font-bold text-sidebar-foreground">AI Chat</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setShowSidebar(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 border-0"
              onClick={() => {}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-3">
            <div className="space-y-1">
              {/* This would be populated with chat history */}
              <p className="text-xs text-muted-foreground p-2">
                Your conversations will appear here once you start chatting!
              </p>
            </div>
          </div>
          
          <div className="p-4 border-t border-sidebar-border">
            {session?.user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                  </div>
                  <span className="ml-2 text-sm font-medium truncate max-w-[120px] text-sidebar-foreground">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={() => signOut()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="sr-only">Sign out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="border-b border-border p-3 flex items-center justify-between bg-card">
          {!showSidebar && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 mr-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowSidebar(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="sr-only">Open sidebar</span>
            </Button>
          )}
          
          <div className="relative inline-block ml-auto">
            <div className="flex items-center gap-2 bg-secondary text-secondary-foreground rounded-md px-3 py-1.5 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="appearance-none bg-transparent border-none focus:outline-none focus:ring-0 pr-6"
              >
                <option>GPT-3.5</option>
                <option>GPT-4</option>
                <option>Claude</option>
              </select>
              <svg className="h-4 w-4 text-secondary-foreground absolute right-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
}
