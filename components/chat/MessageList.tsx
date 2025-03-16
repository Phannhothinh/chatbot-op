import { Message, MessageProps } from "./Message";

interface MessageListProps {
  messages: MessageProps[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-center text-zinc-500">No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <Message
            key={index}
            content={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
            isUser={message.isUser}
          />
        ))
      )}
    </div>
  );
}
