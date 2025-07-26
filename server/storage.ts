import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type Contact, type InsertContact, type Agent, type InsertAgent, type Metrics, type InsertMetrics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;

  // Messages
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, updates: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Metrics
  getMetrics(): Promise<Metrics | undefined>;
  updateMetrics(metrics: InsertMetrics): Promise<Metrics>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private agents: Map<string, Agent> = new Map();
  private metrics: Metrics | undefined;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize SDR Agent
    const sdrAgent: Agent = {
      id: randomUUID(),
      name: "Assistente de Vendas (SDR)",
      type: "sdr",
      description: "Especializado em atendimento ao cliente e vendas com foco em prospecção e qualificação de leads. Treinado com dados de CRM e técnicas de vendas B2B.",
      status: "active",
      model: "gpt-4",
      prompt: "Você é um assistente de vendas especializado em prospecção e qualificação de leads B2B. Sua função é identificar oportunidades, qualificar prospects e guiá-los através do funil de vendas. Sempre seja profissional, empático e focado em agregar valor ao cliente.",
      tools: ["web_search", "crm", "email"],
      conversationCount: 247,
      accuracy: 94,
      createdAt: new Date(),
    };

    const supportAgent: Agent = {
      id: randomUUID(),
      name: "Suporte Técnico",
      type: "support",
      description: "Resolve problemas técnicos e dúvidas sobre produtos, especializado em troubleshooting e documentação técnica.",
      status: "active",
      model: "gpt-4",
      prompt: "Você é um agente de suporte técnico especializado em resolver problemas e dúvidas sobre produtos. Seja claro, detalhado e sempre busque resolver o problema do cliente de forma eficiente.",
      tools: ["knowledge_base", "file_access", "diagnostics"],
      conversationCount: 189,
      accuracy: 91,
      createdAt: new Date(),
    };

    const marketingAgent: Agent = {
      id: randomUUID(),
      name: "Agente de Marketing",
      type: "marketing",
      description: "Cria conteúdo e estratégias de marketing digital, especializado em copywriting e análise de campanhas.",
      status: "training",
      model: "claude-3",
      prompt: "Você é um especialista em marketing digital focado em criação de conteúdo e estratégias de campanhas. Seja criativo e orientado por dados.",
      tools: ["image_gen", "analytics", "social_media"],
      conversationCount: 72,
      accuracy: 89,
      createdAt: new Date(),
    };

    this.agents.set(sdrAgent.id, sdrAgent);
    this.agents.set(supportAgent.id, supportAgent);
    this.agents.set(marketingAgent.id, marketingAgent);

    // Initialize sample contacts
    const sampleContacts: Contact[] = [
      {
        id: randomUUID(),
        name: "Carlos Mendes",
        email: "carlos@startup.com",
        phone: "+55 11 99999-1111",
        company: "Tech Startup",
        source: "website",
        stage: "new",
        value: 12000,
        notes: "Interessado no plano empresarial",
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "+55 11 98888-2222",
        company: "Freelancer",
        source: "linkedin",
        stage: "contacted",
        value: 25000,
        notes: "Gostaria de saber mais sobre o produto",
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "+55 11 97777-3333",
        company: "Consultoria",
        source: "referral",
        stage: "qualified",
        value: 35000,
        notes: "Qualificado pelo SDR",
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleContacts.forEach(contact => this.contacts.set(contact.id, contact));

    // Initialize sample conversations
    const conversation: Conversation = {
      id: randomUUID(),
      contactId: sampleContacts[0].id,
      status: "active",
      lastMessageAt: new Date(),
      assignedAgentId: sdrAgent.id,
      createdAt: new Date(),
    };

    this.conversations.set(conversation.id, conversation);

    // Initialize sample messages
    const sampleMessages: Message[] = [
      {
        id: randomUUID(),
        conversationId: conversation.id,
        senderId: null,
        content: "Olá! Gostaria de saber mais sobre seus serviços.",
        type: "text",
        isIncoming: true,
        timestamp: new Date(Date.now() - 300000), // 5 min ago
      },
      {
        id: randomUUID(),
        conversationId: conversation.id,
        senderId: sdrAgent.id,
        content: "Olá! Fico feliz em ajudar. Que tipo de serviço específico te interessa?",
        type: "text",
        isIncoming: false,
        timestamp: new Date(Date.now() - 240000), // 4 min ago
      },
      {
        id: randomUUID(),
        conversationId: conversation.id,
        senderId: null,
        content: "Estou interessado no plano empresarial. Vocês oferecem suporte 24/7 com agentes especializados?",
        type: "text",
        isIncoming: true,
        timestamp: new Date(Date.now() - 120000), // 2 min ago
      }
    ];

    sampleMessages.forEach(message => this.messages.set(message.id, message));

    // Initialize metrics
    this.metrics = {
      id: randomUUID(),
      date: new Date(),
      activeConversations: 47,
      totalContacts: 2341,
      aiAgents: 8,
      resolutionRate: 94,
      hourlyData: Array(24).fill(0).map((_, i) => ({
        hour: i,
        conversations: Math.floor(Math.random() * 100) + 20,
        resolutions: Math.floor(Math.random() * 80) + 15,
      })),
    };
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates };
    this.conversations.set(id, updated);
    return updated;
  }

  // Messages
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    
    // Update conversation last message time
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      await this.updateConversation(conversation.id, { lastMessageAt: new Date() });
    }
    
    return message;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updated = { ...contact, ...updates, updatedAt: new Date() };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = {
      ...insertAgent,
      id,
      conversationCount: 0,
      createdAt: new Date(),
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updated = { ...agent, ...updates };
    this.agents.set(id, updated);
    return updated;
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }

  // Metrics
  async getMetrics(): Promise<Metrics | undefined> {
    return this.metrics;
  }

  async updateMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const id = this.metrics?.id || randomUUID();
    this.metrics = {
      ...insertMetrics,
      id,
      date: new Date(),
    };
    return this.metrics;
  }
}

export const storage = new MemStorage();
