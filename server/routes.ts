import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertConversationSchema, insertMessageSchema, insertAgentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          const contact = await storage.getContact(conversation.contactId);
          const agent = conversation.assignedAgentId 
            ? await storage.getAgent(conversation.assignedAgentId)
            : null;
          const messages = await storage.getMessagesByConversation(conversation.id);
          const lastMessage = messages[messages.length - 1];
          
          return {
            ...conversation,
            contact,
            agent,
            lastMessage,
            messageCount: messages.length,
          };
        })
      );
      res.json(conversationsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const contact = await storage.getContact(conversation.contactId);
      const agent = conversation.assignedAgentId 
        ? await storage.getAgent(conversation.assignedAgentId)
        : null;
      
      res.json({
        ...conversation,
        contact,
        agent,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Messages
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse({
        ...req.body,
        conversationId: req.params.id,
      });
      const message = await storage.createMessage(data);
      
      // Simulate AI agent response for demonstration
      if (data.isIncoming) {
        setTimeout(async () => {
          const conversation = await storage.getConversation(req.params.id);
          if (conversation?.assignedAgentId) {
            const agent = await storage.getAgent(conversation.assignedAgentId);
            if (agent) {
              await storage.createMessage({
                conversationId: req.params.id,
                senderId: agent.id,
                content: "Obrigado pela sua mensagem! Como posso ajudá-lo hoje?",
                type: "text",
                isIncoming: false,
              });
            }
          }
        }, 2000);
      }
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Contacts
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const updates = req.body;
      const contact = await storage.updateContact(req.params.id, updates);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteContact(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const data = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(data);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create agent" });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    try {
      const updates = req.body;
      const agent = await storage.updateAgent(req.params.id, updates);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update agent" });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAgent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  // WhatsApp webhook simulation
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      // Simulate incoming WhatsApp message
      const { from, message } = req.body;
      
      // Find or create contact
      let contact = (await storage.getContacts()).find(c => c.phone === from);
      if (!contact) {
        contact = await storage.createContact({
          name: `WhatsApp User ${from}`,
          phone: from,
          source: "whatsapp",
          stage: "new",
        });
      }
      
      // Find or create conversation
      let conversation = (await storage.getConversations()).find(c => c.contactId === contact.id);
      if (!conversation) {
        const agents = await storage.getAgents();
        const sdrAgent = agents.find(a => a.type === "sdr" && a.status === "active");
        
        conversation = await storage.createConversation({
          contactId: contact.id,
          status: "active",
          assignedAgentId: sdrAgent?.id,
        });
      }
      
      // Create message
      await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        type: "text",
        isIncoming: true,
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
