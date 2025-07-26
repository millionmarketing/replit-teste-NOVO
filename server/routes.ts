import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertConversationSchema, insertMessageSchema, insertAgentSchema, loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, users } from "@shared/schema";
import { z } from "zod";
import { getWhatsAppService, initializeWhatsApp } from "./whatsapp";
import { authService } from "./auth";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao criar usuário" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      res.status(401).json({ error: error instanceof Error ? error.message : "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await authService.logout(token);
      }
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao fazer logout" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await authService.authenticateRequest(req.headers.authorization);
      if (!user) {
        return res.status(401).json({ error: "Não autenticado" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      const resetToken = await authService.requestPasswordReset(data.email);
      
      // In production, send email with reset link
      // For development, return the token
      res.json({ 
        message: "Token de reset enviado",
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Email inválido", 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao solicitar reset" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const data = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(data.token, data.password);
      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao alterar senha" });
    }
  });

  // Auth middleware for protected routes
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const user = await authService.authenticateRequest(req.headers.authorization);
      if (!user) {
        return res.status(401).json({ error: "Acesso negado" });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  };

  // Metrics
  app.get("/api/metrics", requireAuth, async (req: any, res) => {
    try {
      const metrics = await storage.getMetrics(req.user.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Conversations
  app.get("/api/conversations", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getConversations(userId);
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          const contact = await storage.getContact(conversation.contactId, userId);
          const agent = conversation.assignedAgentId 
            ? await storage.getAgent(conversation.assignedAgentId, userId)
            : null;
          const messages = await storage.getMessagesByConversation(conversation.id, userId);
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

  app.get("/api/conversations/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversation = await storage.getConversation(req.params.id, userId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      const contact = await storage.getContact(conversation.contactId, userId);
      const agent = conversation.assignedAgentId 
        ? await storage.getAgent(conversation.assignedAgentId, userId)
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

  app.post("/api/conversations", requireAuth, async (req: any, res) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation({ ...data, userId: req.user.id });
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Messages
  app.get("/api/conversations/:id/messages", requireAuth, async (req: any, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id, req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", requireAuth, async (req: any, res) => {
    try {
      const data = insertMessageSchema.parse({
        ...req.body,
        conversationId: req.params.id,
      });
      const message = await storage.createMessage({ ...data, userId: req.user.id });
      
      // If it's an outgoing message, send via WhatsApp API
      if (!data.isIncoming) {
        const conversation = await storage.getConversation(req.params.id, req.user.id);
        if (conversation) {
          const contact = await storage.getContact(conversation.contactId, req.user.id);
          if (contact?.phone) {
            // Get WhatsApp settings from database
            const settings = await storage.getWhatsappSettings(req.user.id);
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
  app.get("/api/contacts", requireAuth, async (req: any, res) => {
    try {
      const contacts = await storage.getContacts(req.user.id);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", requireAuth, async (req: any, res) => {
    try {
      const contact = await storage.getContact(req.params.id, req.user.id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", requireAuth, async (req: any, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact({ ...data, userId: req.user.id });
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", requireAuth, async (req: any, res) => {
    try {
      const updates = req.body;
      const contact = await storage.updateContact(req.params.id, req.user.id, updates);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", requireAuth, async (req: any, res) => {
    try {
      const deleted = await storage.deleteContact(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Agents
  app.get("/api/agents", requireAuth, async (req: any, res) => {
    try {
      const agents = await storage.getAgents(req.user.id);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", requireAuth, async (req: any, res) => {
    try {
      const agent = await storage.getAgent(req.params.id, req.user.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", requireAuth, async (req: any, res) => {
    try {
      const data = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent({ ...data, userId: req.user.id });
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create agent" });
    }
  });

  app.put("/api/agents/:id", requireAuth, async (req: any, res) => {
    try {
      const updates = req.body;
      const agent = await storage.updateAgent(req.params.id, req.user.id, updates);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update agent" });
    }
  });

  app.delete("/api/agents/:id", requireAuth, async (req: any, res) => {
    try {
      const deleted = await storage.deleteAgent(req.params.id, req.user.id);
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
      // For webhook, we need to determine which user this belongs to
      // This is a simplified approach - you might want more sophisticated routing
      const allUsers = await db.select().from(users);
      let settings = null;
      let targetUserId = null;
      
      // Find the first user with WhatsApp settings configured
      for (const user of allUsers) {
        const userSettings = await storage.getWhatsappSettings(user.id);
        if (userSettings && userSettings.accessToken && userSettings.phoneNumberId) {
          settings = userSettings;
          targetUserId = user.id;
          break;
        }
      }
      
      if (!settings || !targetUserId) {
        console.warn("WhatsApp not configured for any user");
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
        
        // Find or create contact for the specific user
        let contact = (await storage.getContacts(targetUserId)).find(c => c.phone === msg.from);
        if (!contact) {
          // Extract name from WhatsApp contact info if available, otherwise use last 4 digits
          const contactName = msg.contactName || `Lead ${msg.from.slice(-4)}`;
          
          contact = await storage.createContact({
            userId: targetUserId,
            name: contactName,
            phone: msg.from,
            source: "whatsapp",
            stage: "new",
          });
          console.log(`Created new contact: ${contact.id} with name: ${contactName}`);
        } else if (msg.contactName && contact.name.startsWith('WhatsApp ')) {
          // Update existing contact name if we got a real name from WhatsApp
          const updatedContact = await storage.updateContact(contact.id, targetUserId, { name: msg.contactName });
          console.log(`Updated contact name from "${contact.name}" to "${msg.contactName}"`);
          contact = updatedContact || contact;
        }
        
        // Find or create conversation for the specific user
        let conversation = (await storage.getConversations(targetUserId)).find(c => c.contactId === contact.id);
        if (!conversation) {
          const agents = await storage.getAgents(targetUserId);
          const sdrAgent = agents.find(a => a.type === "sdr" && a.status === "active");
          
          conversation = await storage.createConversation({
            userId: targetUserId,
            contactId: contact.id,
            status: "active",
            assignedAgentId: sdrAgent?.id,
          });
          console.log(`Created new conversation: ${conversation.id}`);
        }
        
        // Create message for the specific user
        const newMessage = await storage.createMessage({
          userId: targetUserId,
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
  app.get("/api/whatsapp/settings", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getWhatsappSettings(req.user.id);
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

  app.post("/api/whatsapp/settings", requireAuth, async (req: any, res) => {
    try {
      const { accessToken, phoneNumberId, webhookVerifyToken, autoResponses } = req.body;
      
      if (!accessToken || !phoneNumberId || !webhookVerifyToken) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const settings = await storage.updateWhatsappSettings(req.user.id, {
        userId: req.user.id,
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
