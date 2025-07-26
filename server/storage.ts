import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type Contact, type InsertContact, type Agent, type InsertAgent, type Metrics, type InsertMetrics, type WhatsappSettings, type InsertWhatsappSettings, users, conversations, messages, contacts, agents, metrics, whatsappSettings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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

  // WhatsApp Settings
  getWhatsappSettings(): Promise<WhatsappSettings | undefined>;
  updateWhatsappSettings(settings: InsertWhatsappSettings): Promise<WhatsappSettings>;
}

export class DatabaseStorage implements IStorage {
  async initializeData() {
    // Check if data already exists
    const existingAgents = await db.select().from(agents);
    if (existingAgents.length > 0) {
      return; // Data already initialized
    }

    // Initialize SDR Agent
    const [sdrAgent] = await db.insert(agents).values({
      name: "Assistente de Vendas (SDR)",
      type: "sdr",
      description: "Especializado em atendimento ao cliente e vendas com foco em prospecção e qualificação de leads. Treinado com dados de CRM e técnicas de vendas B2B.",
      status: "active",
      model: "gpt-4",
      prompt: "Você é um assistente de vendas especializado em prospecção e qualificação de leads B2B. Sua função é identificar oportunidades, qualificar prospects e guiá-los através do funil de vendas. Sempre seja profissional, empático e focado em agregar valor ao cliente.",
      tools: ["web_search", "crm", "email"],
      conversationCount: 247,
      accuracy: 94,
    }).returning();

    const [supportAgent] = await db.insert(agents).values({
      name: "Suporte Técnico",
      type: "support",
      description: "Resolve problemas técnicos e dúvidas sobre produtos, especializado em troubleshooting e documentação técnica.",
      status: "active",
      model: "gpt-4",
      prompt: "Você é um agente de suporte técnico especializado em resolver problemas e dúvidas sobre produtos. Seja claro, detalhado e sempre busque resolver o problema do cliente de forma eficiente.",
      tools: ["knowledge_base", "file_access", "diagnostics"],
      conversationCount: 189,
      accuracy: 91,
    }).returning();

    const [marketingAgent] = await db.insert(agents).values({
      name: "Agente de Marketing",
      type: "marketing",
      description: "Cria conteúdo e estratégias de marketing digital, especializado em copywriting e análise de campanhas.",
      status: "training",
      model: "claude-3",
      prompt: "Você é um especialista em marketing digital focado em criação de conteúdo e estratégias de campanhas. Seja criativo e orientado por dados.",
      tools: ["image_gen", "analytics", "social_media"],
      conversationCount: 72,
      accuracy: 89,
    }).returning();

    // Initialize sample contacts
    const sampleContacts = await db.insert(contacts).values([
      {
        name: "Carlos Mendes",
        email: "carlos@startup.com",
        phone: "+55 11 99999-1111",
        company: "Tech Startup",
        source: "website",
        stage: "new",
        value: 12000,
        notes: "Interessado no plano empresarial",
        metadata: {},
      },
      {
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "+55 11 98888-2222",
        company: "Freelancer",
        source: "linkedin",
        stage: "contacted",
        value: 25000,
        notes: "Gostaria de saber mais sobre o produto",
        metadata: {},
      },
      {
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "+55 11 97777-3333",
        company: "Consultoria",
        source: "referral",
        stage: "qualified",
        value: 35000,
        notes: "Qualificado pelo SDR",
        metadata: {},
      }
    ]).returning();

    // Initialize sample conversation
    const [conversation] = await db.insert(conversations).values({
      contactId: sampleContacts[0].id,
      status: "active",
      assignedAgentId: sdrAgent.id,
    }).returning();

    // Initialize sample messages
    await db.insert(messages).values([
      {
        conversationId: conversation.id,
        senderId: null,
        content: "Olá! Gostaria de saber mais sobre seus serviços.",
        type: "text",
        isIncoming: true,
      },
      {
        conversationId: conversation.id,
        senderId: sdrAgent.id,
        content: "Olá! Fico feliz em ajudar. Que tipo de serviço específico te interessa?",
        type: "text",
        isIncoming: false,
      },
      {
        conversationId: conversation.id,
        senderId: null,
        content: "Estou interessado no plano empresarial. Vocês oferecem suporte 24/7 com agentes especializados?",
        type: "text",
        isIncoming: true,
      }
    ]);

    // Initialize metrics
    await db.insert(metrics).values({
      activeConversations: 47,
      totalContacts: 2341,
      aiAgents: 8,
      resolutionRate: 94,
      hourlyData: Array(24).fill(0).map((_, i) => ({
        hour: i,
        conversations: Math.floor(Math.random() * 100) + 20,
        resolutions: Math.floor(Math.random() * 80) + 15,
      })),
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db.update(conversations)
      .set(updates)
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  // Messages
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    
    // Update conversation last message time
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, insertMessage.conversationId));
    
    return message;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return contact || undefined;
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const [agent] = await db.update(agents)
      .set(updates)
      .where(eq(agents.id, id))
      .returning();
    return agent || undefined;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Metrics
  async getMetrics(): Promise<Metrics | undefined> {
    const [metricsResult] = await db.select().from(metrics).limit(1);
    return metricsResult || undefined;
  }

  async updateMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    // First try to update existing metrics
    const [existing] = await db.select().from(metrics).limit(1);
    
    if (existing) {
      const [updated] = await db.update(metrics)
        .set({ ...insertMetrics, date: new Date() })
        .where(eq(metrics.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(metrics).values(insertMetrics).returning();
      return created;
    }
  }

  // WhatsApp Settings
  async getWhatsappSettings(): Promise<WhatsappSettings | undefined> {
    const [settings] = await db.select().from(whatsappSettings).limit(1);
    return settings || undefined;
  }

  async updateWhatsappSettings(insertSettings: InsertWhatsappSettings): Promise<WhatsappSettings> {
    // First try to update existing settings
    const [existing] = await db.select().from(whatsappSettings).limit(1);
    
    if (existing) {
      const [updated] = await db.update(whatsappSettings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(whatsappSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(whatsappSettings).values(insertSettings).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data on startup
storage.initializeData().catch(console.error);
