import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface MessageProps {
  content: string;
  sender: string;
  timestamp: Date;
  isUser: boolean;
}

export function Message({ content, sender, timestamp, isUser }: MessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-6 animate-fadeIn group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 border border-primary/20">
          <AvatarImage src={`https://avatar.vercel.sh/${sender}.png`} alt={sender} />
          <AvatarFallback className="bg-primary text-primary-foreground">{sender.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-medium text-muted-foreground">{sender}</span>
          <span className="text-xs text-muted-foreground/70">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div
          className={cn(
            "rounded-lg p-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card dark:bg-zinc-800 border border-border"
          )}
        >
          {content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {line}
            </p>
          ))}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border border-primary/20">
          <AvatarImage src={`https://avatar.vercel.sh/${sender}.png`} alt={sender} />
          <AvatarFallback className="bg-primary text-primary-foreground">{sender.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
