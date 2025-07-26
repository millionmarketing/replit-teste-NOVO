export interface ConversationWithDetails {
  id: string;
  contactId: string;
  status: string;
  lastMessageAt: Date;
  assignedAgentId?: string;
  createdAt: Date;
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  agent?: {
    id: string;
    name: string;
    type: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    isIncoming: boolean;
    timestamp: Date;
  };
  messageCount: number;
}

export interface MetricsData {
  id: string;
  date: Date;
  activeConversations: number;
  totalContacts: number;
  aiAgents: number;
  resolutionRate: number;
  hourlyData: Array<{
    hour: number;
    conversations: number;
    resolutions: number;
  }>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  contacts: Array<any>;
  color: string;
}
