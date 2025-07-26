import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ConversationWithDetails } from "@/types";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedConversation?: string;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation 
}: ConversationListProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Chat</h2>
          <Button variant="ghost" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={cn(
              "p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors",
              selectedConversation === conversation.id && "bg-primary/10 border-l-4 border-l-primary"
            )}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={cn(
                    "text-white font-semibold",
                    conversation.status === 'active' ? 'bg-green-600' : 
                    conversation.status === 'pending' ? 'bg-yellow-600' :
                    conversation.status === 'resolved' ? 'bg-blue-600' : 'bg-gray-600'
                  )}>
                    {getInitials(conversation.contact?.name || 'Unknown')}
                  </AvatarFallback>
                </Avatar>
                {conversation.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {conversation.contact?.name || 'Unknown Contact'}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(conversation.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground capitalize">
                    {conversation.status} • {conversation.agent?.name || 'Unassigned'}
                  </p>
                  {conversation.messageCount > 0 && (
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {conversation.messageCount}
                    </Badge>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
