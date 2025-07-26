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
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
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

      return response.status === 200;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
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
  }> {
    const messages: Array<{
      from: string;
      messageId: string;
      message: string;
      timestamp: number;
      type: string;
    }> = [];

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          if (change.field === 'messages') {
            change.value?.messages?.forEach((message: any) => {
              if (message.type === 'text') {
                messages.push({
                  from: message.from,
                  messageId: message.id,
                  message: message.text.body,
                  timestamp: parseInt(message.timestamp),
                  type: message.type
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

