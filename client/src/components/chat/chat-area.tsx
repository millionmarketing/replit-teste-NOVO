import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Video, MoreVertical, Paperclip, Smile, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationWithDetails } from "@/types";
import type { Message } from "@shared/schema";

interface ChatAreaProps {
  conversation?: ConversationWithDetails;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatArea({ conversation, messages, onSendMessage, isLoading }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(2, 2);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
          <p className="text-muted-foreground">Escolha uma conversa para começar a conversar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-green-600 text-white font-semibold">
              {getInitials(conversation.contact?.name || 'Unknown')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{conversation.contact?.name || 'Unknown Contact'}</h3>
            <p className="text-sm text-green-500 capitalize">
              {conversation.status} • {conversation.agent?.name || 'Unassigned'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="bg-card text-muted-foreground text-xs px-3 py-1 rounded-full">
            Today, {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start space-x-3",
              !msg.isIncoming && "justify-end"
            )}
          >
            {msg.isIncoming && (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-green-600 text-white text-sm font-semibold">
                  {getInitials(conversation.contact?.name || 'U')}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={cn("flex-1", !msg.isIncoming && "flex justify-end")}>
              <div
                className={cn(
                  "rounded-2xl p-3 max-w-xs chat-bubble",
                  msg.isIncoming 
                    ? "bg-card rounded-tl-md" 
                    : "bg-primary text-primary-foreground rounded-tr-md ml-auto"
                )}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              <span 
                className={cn(
                  "text-xs text-muted-foreground mt-1 block",
                  msg.isIncoming ? "ml-3" : "mr-3 text-right"
                )}
              >
                {msg.senderId && !msg.isIncoming ? conversation.agent?.name : ''} {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                AI
              </AvatarFallback>
            </Avatar>
            <div className="bg-card rounded-2xl rounded-tl-md p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12"
              disabled={isLoading}
            />
            <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
