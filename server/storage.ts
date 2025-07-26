import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type Contact, type InsertContact, type Agent, type InsertAgent, type Metrics, type InsertMetrics, type WhatsappSettings, type InsertWhatsappSettings, users, conversations, messages, contacts, agents, metrics, whatsappSettings } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Conversations (with user isolation)
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string, userId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation>;
  updateConversation(id: string, userId: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;

  // Messages (with user isolation)
  getMessagesByConversation(conversationId: string, userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage & { userId: string }): Promise<Message>;

  // Contacts (with user isolation)
  getContacts(userId: string): Promise<Contact[]>;
  getContact(id: string, userId: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact & { userId: string }): Promise<Contact>;
  updateContact(id: string, userId: string, updates: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: string, userId: string): Promise<boolean>;

  // Agents (with user isolation)
  getAgents(userId: string): Promise<Agent[]>;
  getAgent(id: string, userId: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent & { userId: string }): Promise<Agent>;
  updateAgent(id: string, userId: string, updates: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: string, userId: string): Promise<boolean>;

  // Metrics (with user isolation)
  getMetrics(userId: string): Promise<Metrics | undefined>;
  updateMetrics(userId: string, metrics: InsertMetrics & { userId: string }): Promise<Metrics>;

  // WhatsApp Settings (with user isolation)
  getWhatsappSettings(userId: string): Promise<WhatsappSettings | undefined>;
  updateWhatsappSettings(userId: string, settings: InsertWhatsappSettings & { userId: string }): Promise<WhatsappSettings>;
}

export class DatabaseStorage implements IStorage {
  async initializeDataForUser(userId: string) {
    // Check if user already has data
    const existingAgents = await db.select().from(agents).where(eq(agents.userId, userId));
    if (existingAgents.length > 0) {
      return; // Data already initialized for this user
    }

    // Initialize SDR Agent for user
    const [sdrAgent] = await db.insert(agents).values({
      userId,
      name: "Assistente de Vendas (SDR)",
      type: "sdr",
      description: "Especializado em atendimento ao cliente e vendas com foco em prospecção e qualificação de leads. Treinado com dados de CRM e técnicas de vendas B2B.",
      status: "active",
      model: "gpt-4",
      prompt: "Você é um assistente de vendas especializado em prospecção e qualificação de leads B2B. Sua função é identificar oportunidades, qualificar prospects e guiá-los através do funil de vendas. Sempre seja profissional, empático e focado em agregar valor ao cliente.",
      tools: ["web_search", "crm", "email"],
      conversationCount: 0,
      accuracy: 94,
    }).returning();

    const [supportAgent] = await db.insert(agents).values({
      userId,
      name: "Suporte Técnico",
      type: "support",
      description: "Resolve problemas técnicos e dúvidas sobre produtos, especializado em troubleshooting e documentação técnica.",
      status: "active",
      model: "gpt-4",
      prompt: "Você é um agente de suporte técnico especializado em resolver problemas e dúvidas sobre produtos. Seja claro, detalhado e sempre busque resolver o problema do cliente de forma eficiente.",
      tools: ["knowledge_base", "file_access", "diagnostics"],
      conversationCount: 0,
      accuracy: 91,
    }).returning();

    const [marketingAgent] = await db.insert(agents).values({
      userId,
      name: "Marketing Digital",
      type: "marketing",
      description: "Especialista em marketing digital, campanhas e geração de leads através de múltiplos canais digitais.",
      status: "active",
      model: "gpt-4",
      prompt: "Você é um especialista em marketing digital focado em geração de leads e conversão. Crie campanhas eficazes, analise métricas e otimize funis de conversão.",
      tools: ["analytics", "email_marketing", "social_media"],
      conversationCount: 0,
      accuracy: 89,
    }).returning();

    // Initialize sample contacts for user
    const [contact1] = await db.insert(contacts).values({
      userId,
      name: "João Silva",
      email: "joao.silva@empresa.com",
      phone: "+55 11 99999-1234",
      company: "Tech Solutions Ltda",
      source: "website",
      stage: "qualified",
      value: 15000,
      notes: "Interessado em nossa solução de CRM. Empresa de médio porte com 50 funcionários.",
      metadata: {}
    }).returning();

    await db.insert(contacts).values([
      {
        userId,
        name: "Maria Santos",
        email: "maria@startup.com.br",
        phone: "+55 21 98888-5678",
        company: "StartupXYZ",
        source: "linkedin",
        stage: "proposal",
        value: 8500,
        notes: "Startup em crescimento, procura automatizar processos de vendas.",
        metadata: {}
      },
      {
        userId,
        name: "Carlos Oliveira",
        email: "carlos@comercio.com",
        phone: "+55 31 97777-9012",
        company: "Comércio Digital",
        source: "google ads",
        stage: "new",
        value: 12000,
        notes: "Lead recente, demonstrou interesse em integração WhatsApp.",
        metadata: {}
      }
    ]);

    // Initialize sample conversation for user
    const [conversation] = await db.insert(conversations).values({
      userId,
      contactId: contact1.id,
      status: "active",
      assignedAgentId: sdrAgent.id,
    }).returning();

    // Initialize sample messages for user
    await db.insert(messages).values([
      {
        userId,
        conversationId: conversation.id,
        senderId: null,
        content: "Olá! Vi que vocês oferecem soluções de CRM. Gostaria de saber mais sobre os preços e funcionalidades.",
        type: "text",
        isIncoming: true,
      },
      {
        userId,
        conversationId: conversation.id,
        senderId: sdrAgent.id,
        content: "Olá João! Obrigado pelo seu interesse. Nosso CRM oferece automação completa de vendas, integração WhatsApp e relatórios avançados. Posso agendar uma demonstração para você?",
        type: "text",
        isIncoming: false,
      }
    ]);

    // Initialize metrics for user
    await db.insert(metrics).values({
      userId,
      activeConversations: 1,
      totalContacts: 3,
      aiAgents: 3,
      resolutionRate: 92,
      hourlyData: [
        { hour: "08:00", conversations: 1, messages: 5 },
        { hour: "09:00", conversations: 3, messages: 12 },
        { hour: "10:00", conversations: 5, messages: 18 },
        { hour: "11:00", conversations: 4, messages: 15 },
        { hour: "12:00", conversations: 2, messages: 8 },
        { hour: "13:00", conversations: 6, messages: 22 },
        { hour: "14:00", conversations: 8, messages: 25 },
        { hour: "15:00", conversations: 7, messages: 28 },
        { hour: "16:00", conversations: 9, messages: 32 },
        { hour: "17:00", conversations: 6, messages: 19 },
        { hour: "18:00", conversations: 3, messages: 11 }
      ]
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    // Initialize data for new user
    await this.initializeDataForUser(newUser.id);
    return newUser;
  }

  // Conversations with user isolation
  async getConversations(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async getConversation(id: string, userId: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return conversation;
  }

  async createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async updateConversation(id: string, userId: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [updated] = await db.update(conversations)
      .set(updates)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    return updated;
  }

  // Messages with user isolation
  async getMessagesByConversation(conversationId: string, userId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(and(eq(messages.conversationId, conversationId), eq(messages.userId, userId)));
  }

  async createMessage(message: InsertMessage & { userId: string }): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Contacts with user isolation
  async getContacts(userId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.userId, userId));
  }

  async getContact(id: string, userId: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
    return contact;
  }

  async createContact(contact: InsertContact & { userId: string }): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async updateContact(id: string, userId: string, updates: Partial<Contact>): Promise<Contact | undefined> {
    const [updated] = await db.update(contacts)
      .set(updates)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
      .returning();
    return updated;
  }

  async deleteContact(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
    return result.count > 0;
  }

  // Agents with user isolation
  async getAgents(userId: string): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.userId, userId));
  }

  async getAgent(id: string, userId: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents)
      .where(and(eq(agents.id, id), eq(agents.userId, userId)));
    return agent;
  }

  async createAgent(agent: InsertAgent & { userId: string }): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgent(id: string, userId: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const [updated] = await db.update(agents)
      .set(updates)
      .where(and(eq(agents.id, id), eq(agents.userId, userId)))
      .returning();
    return updated;
  }

  async deleteAgent(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(agents)
      .where(and(eq(agents.id, id), eq(agents.userId, userId)));
    return result.count > 0;
  }

  // Metrics with user isolation
  async getMetrics(userId: string): Promise<Metrics | undefined> {
    const [metrics_] = await db.select().from(metrics).where(eq(metrics.userId, userId));
    return metrics_;
  }

  async updateMetrics(userId: string, metricsData: InsertMetrics & { userId: string }): Promise<Metrics> {
    // Try to update existing metrics
    const [updated] = await db.update(metrics)
      .set(metricsData)
      .where(eq(metrics.userId, userId))
      .returning();
    
    if (updated) {
      return updated;
    }

    // If no existing metrics, create new
    const [newMetrics] = await db.insert(metrics).values(metricsData).returning();
    return newMetrics;
  }

  // WhatsApp Settings with user isolation
  async getWhatsappSettings(userId: string): Promise<WhatsappSettings | undefined> {
    const [settings] = await db.select().from(whatsappSettings).where(eq(whatsappSettings.userId, userId));
    return settings;
  }

  async updateWhatsappSettings(userId: string, settingsData: InsertWhatsappSettings & { userId: string }): Promise<WhatsappSettings> {
    // Try to update existing settings
    const [updated] = await db.update(whatsappSettings)
      .set(settingsData)
      .where(eq(whatsappSettings.userId, userId))
      .returning();
    
    if (updated) {
      return updated;
    }

    // If no existing settings, create new
    const [newSettings] = await db.insert(whatsappSettings).values(settingsData).returning();
    return newSettings;
  }
}

export const storage = new DatabaseStorage();