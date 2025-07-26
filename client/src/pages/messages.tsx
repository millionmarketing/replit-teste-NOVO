import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatArea } from "@/components/chat/chat-area";
import { api } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ConversationWithDetails } from "@/types";
import type { Message } from "@shared/schema";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: conversations = [], isLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
    queryFn: api.getConversations,
    refetchInterval: 2000, // Refresh conversations every 2 seconds for faster updates
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    queryFn: () => selectedConversation ? api.getMessages(selectedConversation) : Promise.resolve([]),
    enabled: !!selectedConversation,
    refetchInterval: selectedConversation ? 2000 : false, // Refresh messages every 2 seconds for faster updates
  });

  // Check WhatsApp connection status
  const { data: whatsappStatus } = useQuery({
    queryKey: ["/api/whatsapp/settings"],
    queryFn: () => fetch("/api/whatsapp/settings").then(res => res.json()),
    refetchInterval: 30000, // Check every 30 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        content,
        type: "text",
        isIncoming: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      
      // Show success notification if WhatsApp is configured
      if (whatsappStatus?.isConfigured) {
        toast({
          title: "Mensagem enviada",
          description: "Mensagem enviada via WhatsApp com sucesso",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar",
        description: "Falha ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
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
    <div className="flex flex-col h-full">
      {/* WhatsApp Status Bar */}
      {whatsappStatus && (
        <div className={`px-4 py-2 text-sm font-medium border-b ${
          whatsappStatus.isConfigured && whatsappStatus.isActive
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-yellow-50 text-yellow-800 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                whatsappStatus.isConfigured && whatsappStatus.isActive
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
              }`}></div>
              <span>
                WhatsApp: {whatsappStatus.isConfigured && whatsappStatus.isActive
                  ? 'Conectado e ativo'
                  : 'Não configurado'
                }
              </span>
            </div>
            {(!whatsappStatus.isConfigured || !whatsappStatus.isActive) && (
              <span className="text-xs">
                Configure nas Configurações → Integração WhatsApp
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
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
    </div>
  );
}
