import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertConversationSchema, insertMessageSchema, insertAgentSchema } from "@shared/schema";
import { z } from "zod";
import { getWhatsAppService, initializeWhatsApp } from "./whatsapp";

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
      
      // If it's an outgoing message, send via WhatsApp API
      if (!data.isIncoming) {
        const conversation = await storage.getConversation(req.params.id);
        if (conversation) {
          const contact = await storage.getContact(conversation.contactId);
          if (contact?.phone) {
            // Get WhatsApp settings from database
            const settings = await storage.getWhatsappSettings();
            if (settings && settings.accessToken && settings.phoneNumberId) {
              const { WhatsAppService } = await import('./whatsapp');
              const whatsAppService = new WhatsAppService({
                accessToken: settings.accessToken,
                phoneNumberId: settings.phoneNumberId,
                webhookVerifyToken: settings.webhookVerifyToken || '',
              });
              
              try {
                console.log(`📤 Sending WhatsApp message to ${contact.phone}: "${data.content}"`);
                console.log(`📤 Using phone number ID: ${settings.phoneNumberId}`);
                console.log(`📤 Using access token: ${settings.accessToken ? settings.accessToken.substring(0, 20) + '...' : 'undefined'}`);
                
                const success = await whatsAppService.sendMessage(contact.phone, data.content);
                if (success) {
                  console.log(`✅ WhatsApp message sent successfully to ${contact.phone}`);
                } else {
                  console.warn(`❌ Failed to send WhatsApp message to ${contact.phone}`);
                }
              } catch (error: any) {
                console.error(`❌ WhatsApp send error for ${contact.phone}:`, error);
                if (error.response) {
                  console.error(`❌ WhatsApp API error response:`, error.response.data);
                  console.error(`❌ WhatsApp API error status:`, error.response.status);
                }
              }
            } else {
              console.warn("WhatsApp not configured - message saved but not sent via WhatsApp");
            }
          }
        }
      }
      
      // TODO: Integrate with AI agent for automatic responses when needed
      
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

  // WhatsApp webhook verification (GET)
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"] as string;
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;

    const whatsAppService = getWhatsAppService();

    if (whatsAppService) {
      const verificationResult = whatsAppService.verifyWebhook(mode, token, challenge);
      if (verificationResult) {
        return res.status(200).send(verificationResult);
      }
    }

    res.status(403).send("Verification failed");
  });

  // WhatsApp webhook for incoming messages (POST)
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      // Get WhatsApp settings from database instead of environment
      const settings = await storage.getWhatsappSettings();
      if (!settings || !settings.accessToken || !settings.phoneNumberId) {
        console.warn("WhatsApp not configured in database");
        return res.status(200).send("OK"); // Still return 200 to avoid webhook retries
      }

      // Create temporary service instance with database settings
      const { WhatsAppService } = await import('./whatsapp');
      const tempService = new WhatsAppService({
        accessToken: settings.accessToken,
        phoneNumberId: settings.phoneNumberId,
        webhookVerifyToken: settings.webhookVerifyToken || '',
      });

      // Parse incoming messages
      const messages = tempService.parseWebhook(req.body);
      console.log(`Received ${messages.length} WhatsApp messages`);

      for (const msg of messages) {
        console.log(`Processing message from ${msg.from}: ${msg.message}`);
        
        // Find or create contact
        let contact = (await storage.getContacts()).find(c => c.phone === msg.from);
        if (!contact) {
          // Extract name from WhatsApp contact info if available, otherwise use last 4 digits
          const contactName = msg.contactName || `Lead ${msg.from.slice(-4)}`;
          
          contact = await storage.createContact({
            name: contactName,
            phone: msg.from,
            source: "whatsapp",
            stage: "new",
          });
          console.log(`Created new contact: ${contact.id} with name: ${contactName}`);
        } else if (msg.contactName && contact.name.startsWith('WhatsApp ')) {
          // Update existing contact name if we got a real name from WhatsApp
          const updatedContact = await storage.updateContact(contact.id, { name: msg.contactName });
          console.log(`Updated contact name from "${contact.name}" to "${msg.contactName}"`);
          contact = updatedContact || contact;
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
          console.log(`Created new conversation: ${conversation.id}`);
        }
        
        // Create message
        const newMessage = await storage.createMessage({
          conversationId: conversation.id,
          content: msg.message,
          type: "text",
          isIncoming: true,
        });
        console.log(`Created message: ${newMessage.id}`);

        // Mark message as read
        try {
          await tempService.markAsRead(msg.messageId);
        } catch (error) {
          console.warn("Failed to mark message as read:", error);
        }
      }
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("WhatsApp webhook error:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Send WhatsApp message
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { to, message, type = "text" } = req.body;
      const whatsAppService = getWhatsAppService();

      if (!whatsAppService) {
        return res.status(500).json({ error: "WhatsApp service not configured" });
      }

      let success = false;
      if (type === "text") {
        success = await whatsAppService.sendMessage(to, message);
      } else if (type === "template") {
        success = await whatsAppService.sendTemplateMessage(to, message);
      }

      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });



  // WhatsApp Settings API routes
  app.get("/api/whatsapp/settings", async (req, res) => {
    try {
      const settings = await storage.getWhatsappSettings();
      // Don't return sensitive tokens to frontend, only configuration status
      if (settings) {
        res.json({
          id: settings.id,
          isConfigured: !!(settings.accessToken && settings.phoneNumberId),
          autoResponses: settings.autoResponses,
          isActive: settings.isActive,
          phoneNumberId: settings.phoneNumberId ? settings.phoneNumberId.slice(-4) : null, // Only last 4 digits
          updatedAt: settings.updatedAt
        });
      } else {
        res.json({
          isConfigured: false,
          autoResponses: true,
          isActive: false
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch WhatsApp settings" });
    }
  });

  app.post("/api/whatsapp/settings", async (req, res) => {
    try {
      const { accessToken, phoneNumberId, webhookVerifyToken, autoResponses } = req.body;
      
      if (!accessToken || !phoneNumberId || !webhookVerifyToken) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const settings = await storage.updateWhatsappSettings({
        accessToken,
        phoneNumberId,
        webhookVerifyToken,
        autoResponses: autoResponses ?? true,
        isActive: true
      });

      // Reinitialize WhatsApp service with new settings
      
      // Set environment variables temporarily for this instance
      process.env.WHATSAPP_ACCESS_TOKEN = accessToken;
      process.env.WHATSAPP_PHONE_NUMBER_ID = phoneNumberId;
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = webhookVerifyToken;
      
      const whatsAppService = initializeWhatsApp();
      if (whatsAppService) {
        console.log("WhatsApp service reinitialized with new settings");
      }

      res.json({ 
        success: true, 
        message: "WhatsApp settings updated successfully",
        isActive: settings.isActive
      });
    } catch (error) {
      console.error("Failed to update WhatsApp settings:", error);
      res.status(500).json({ error: "Failed to update WhatsApp settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
