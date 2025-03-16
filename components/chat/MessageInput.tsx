import { FormEvent, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.prevtDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 bg-card border border-border rounded-lg shadow-sm"
    >
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message..."
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-6 bg-transparent"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10 p-0 flex items-center justify-center mr-2"
        aria-label="Send message"
      >
        <PaperPlaneIcon className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
