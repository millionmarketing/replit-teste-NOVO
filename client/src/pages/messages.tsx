import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatArea } from "@/components/chat/chat-area";
import { api } from "@/lib/api";
import type { ConversationWithDetails } from "@/types";
import type { Message } from "@shared/schema";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string>();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
    queryFn: api.getConversations,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    queryFn: () => selectedConversation ? api.getMessages(selectedConversation) : Promise.resolve([]),
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      api.sendMessage(conversationId, {
        content,
        type: "text",
        isIncoming: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSendMessage = (content: string) => {
    if (selectedConversation) {
      sendMessageMutation.mutate({ conversationId: selectedConversation, content });
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 bg-card border-r border-border p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando conversas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <ChatArea
        conversation={selectedConversationData}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={sendMessageMutation.isPending}
      />
    </div>
  );
}
