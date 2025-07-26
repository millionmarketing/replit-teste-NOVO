import { apiRequest } from "@/lib/queryClient";

export const api = {
  // Metrics
  getMetrics: () => fetch("/api/metrics").then(res => res.json()),

  // Conversations
  getConversations: () => fetch("/api/conversations").then(res => res.json()),
  getConversation: (id: string) => fetch(`/api/conversations/${id}`).then(res => res.json()),
  createConversation: (data: any) => apiRequest("POST", "/api/conversations", data),

  // Messages
  getMessages: (conversationId: string) => 
    fetch(`/api/conversations/${conversationId}/messages`).then(res => res.json()),
  sendMessage: (conversationId: string, data: any) => 
    apiRequest("POST", `/api/conversations/${conversationId}/messages`, data),

  // Contacts
  getContacts: () => fetch("/api/contacts").then(res => res.json()),
  getContact: (id: string) => fetch(`/api/contacts/${id}`).then(res => res.json()),
  createContact: (data: any) => apiRequest("POST", "/api/contacts", data),
  updateContact: (id: string, data: any) => apiRequest("PUT", `/api/contacts/${id}`, data),
  deleteContact: (id: string) => apiRequest("DELETE", `/api/contacts/${id}`),

  // Agents
  getAgents: () => fetch("/api/agents").then(res => res.json()),
  getAgent: (id: string) => fetch(`/api/agents/${id}`).then(res => res.json()),
  createAgent: (data: any) => apiRequest("POST", "/api/agents", data),
  updateAgent: (id: string, data: any) => apiRequest("PUT", `/api/agents/${id}`, data),
  deleteAgent: (id: string) => apiRequest("DELETE", `/api/agents/${id}`),
};
