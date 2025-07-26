import axios from 'axios';

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  webhookVerifyToken: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  // Verify webhook (required by Meta)
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  // Send text message
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      // Ensure phone number is in E.164 format (with + prefix)
      const formattedPhone = to.startsWith('+') ? to : `+${to}`;
      
      console.log(`📤 Original phone: ${to}, Formatted phone: ${formattedPhone}`);
      
      console.log(`📤 WhatsApp API Request:`, {
        url: `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        body: {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: message }
        }
      });
      
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp API response:`, response.status, response.data);
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp message:', error.message);
      if (error.response) {
        console.error('❌ WhatsApp API Error Details:');
        console.error('  Status:', error.response.status);
        console.error('  Data:', JSON.stringify(error.response.data, null, 2));
        
        // Check for specific permission errors
        if (error.response.data?.error?.code === 10) {
          console.error('❌ PERMISSION ERROR: The access token does not have the required permissions.');
          console.error('❌ Required permissions: whatsapp_business_management, whatsapp_business_messaging');
          console.error('❌ Please check your App permissions in Facebook Developer Console.');
        }
      }
      return false;
    }
  }

  // Send template message
  async sendTemplateMessage(to: string, templateName: string, languageCode = 'pt_BR'): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      return false;
    }
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  // Parse incoming webhook data
  parseWebhook(body: any): Array<{
    from: string;
    messageId: string;
    message: string;
    timestamp: number;
    type: string;
    contactName?: string;
  }> {
    const messages: Array<{
      from: string;
      messageId: string;
      message: string;
      timestamp: number;
      type: string;
      contactName?: string;
    }> = [];

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          if (change.field === 'messages') {
            // Extract contacts info for names
            const contacts = change.value?.contacts || [];
            const contactsMap = new Map();
            contacts.forEach((contact: any) => {
              if (contact.profile?.name) {
                contactsMap.set(contact.wa_id, contact.profile.name);
              }
            });

            change.value?.messages?.forEach((message: any) => {
              if (message.type === 'text') {
                const contactName = contactsMap.get(message.from);
                messages.push({
                  from: message.from,
                  messageId: message.id,
                  message: message.text.body,
                  timestamp: parseInt(message.timestamp),
                  type: message.type,
                  contactName: contactName
                });
              }
            });
          }
        });
      });
    }

    return messages;
  }
}

// Singleton instance
let whatsAppService: WhatsAppService | null = null;

export function initializeWhatsApp(): WhatsAppService | null {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (!accessToken || !phoneNumberId || !webhookVerifyToken) {
    console.warn('WhatsApp configuration incomplete. Missing environment variables:');
    if (!accessToken) console.warn('- WHATSAPP_ACCESS_TOKEN');
    if (!phoneNumberId) console.warn('- WHATSAPP_PHONE_NUMBER_ID');
    if (!webhookVerifyToken) console.warn('- WHATSAPP_WEBHOOK_VERIFY_TOKEN');
    return null;
  }

  whatsAppService = new WhatsAppService({
    accessToken,
    phoneNumberId,
    webhookVerifyToken
  });

  return whatsAppService;
}

export function getWhatsAppService(): WhatsAppService | null {
  return whatsAppService;
}

