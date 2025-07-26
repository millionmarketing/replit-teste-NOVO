import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  MessageSquare,
  Bot,
  Smartphone,
  Save
} from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Personalize suas preferências e configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Perfil do Usuário</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" placeholder="João" defaultValue="João" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input id="lastName" placeholder="Silva" defaultValue="Silva" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="joao@empresa.com" defaultValue="joao@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="+55 11 99999-9999" defaultValue="+55 11 99999-9999" />
            </div>
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Notificações</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Novas Mensagens</p>
                <p className="text-sm text-muted-foreground">Receber notificações de novas conversas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Diário</p>
                <p className="text-sm text-muted-foreground">Resumo diário das atividades</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Agentes</p>
                <p className="text-sm text-muted-foreground">Notificações sobre status dos agentes IA</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Leads Qualificados</p>
                <p className="text-sm text-muted-foreground">Alertas quando um lead é qualificado</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Integração WhatsApp</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappToken">Token da API WhatsApp</Label>
              <Input 
                id="whatsappToken" 
                type="password" 
                placeholder="Insira o token da Meta API" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">ID do Número de Telefone</Label>
              <Input 
                id="phoneNumberId" 
                placeholder="1234567890123456" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL do Webhook</Label>
              <Input 
                id="webhookUrl" 
                placeholder="https://seu-dominio.com/api/whatsapp/webhook" 
                defaultValue={`${window.location.origin}/api/whatsapp/webhook`}
                readOnly
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Respostas Automáticas</p>
                <p className="text-sm text-muted-foreground">Permitir que agentes respondam automaticamente</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* AI Agents Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Configurações dos Agentes IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiModel">Modelo de IA Padrão</Label>
              <Input id="aiModel" defaultValue="gpt-4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Máximo de Tokens</Label>
              <Input id="maxTokens" type="number" defaultValue="1000" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo de Treinamento</p>
                <p className="text-sm text-muted-foreground">Melhorar agentes com conversas reais</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Humano</p>
                <p className="text-sm text-muted-foreground">Transferir para humano quando necessário</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações dos Agentes
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Segurança</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">Adicionar uma camada extra de segurança</p>
              </div>
              <Switch />
            </div>
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Banco de Dados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="databaseUrl">URL do Banco de Dados</Label>
              <Input 
                id="databaseUrl" 
                type="password" 
                placeholder="postgresql://..." 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Automático</p>
                <p className="text-sm text-muted-foreground">Backup diário dos dados</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Logs de Auditoria</p>
                <p className="text-sm text-muted-foreground">Registrar todas as ações do sistema</p>
              </div>
              <Switch />
            </div>
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações do Banco
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}