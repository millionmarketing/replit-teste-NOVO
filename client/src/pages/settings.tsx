import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  MessageSquare,
  Bot,
  Smartphone,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [whatsappForm, setWhatsappForm] = useState({
    accessToken: "",
    phoneNumberId: "",
    webhookVerifyToken: "",
    autoResponses: true
  });

  // Query WhatsApp settings
  const { data: whatsappSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/whatsapp/settings"],
    queryFn: () => fetch("/api/whatsapp/settings").then(res => res.json())
  });

  // Mutation to update WhatsApp settings
  const updateWhatsappSettings = useMutation({
    mutationFn: (data: typeof whatsappForm) => 
      apiRequest("POST", "/api/whatsapp/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/settings"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações do WhatsApp foram atualizadas com sucesso.",
      });
      // Clear form after successful save
      setWhatsappForm({
        accessToken: "",
        phoneNumberId: "",
        webhookVerifyToken: "",
        autoResponses: true
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar as configurações do WhatsApp.",
        variant: "destructive",
      });
    }
  });

  const handleWhatsappSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappForm.accessToken || !whatsappForm.phoneNumberId || !whatsappForm.webhookVerifyToken) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    updateWhatsappSettings.mutate(whatsappForm);
  };

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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Integração WhatsApp</CardTitle>
              </div>
              {!isLoadingSettings && whatsappSettings && (
                <div className="flex items-center space-x-2">
                  {whatsappSettings.isConfigured ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Configurado</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-yellow-600 font-medium">Não configurado</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWhatsappSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappToken">Token da API WhatsApp *</Label>
                <Input 
                  id="whatsappToken" 
                  type="password" 
                  placeholder="Insira o token da Meta API"
                  value={whatsappForm.accessToken}
                  onChange={(e) => setWhatsappForm(prev => ({ ...prev, accessToken: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Obtido no Meta for Developers → WhatsApp → Getting Started
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">ID do Número de Telefone *</Label>
                <Input 
                  id="phoneNumberId" 
                  placeholder="1234567890123456"
                  value={whatsappForm.phoneNumberId}
                  onChange={(e) => setWhatsappForm(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  ID do número do WhatsApp Business (encontrado no console Meta)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookVerifyToken">Token de Verificação do Webhook *</Label>
                <Input 
                  id="webhookVerifyToken" 
                  placeholder="Crie uma senha segura"
                  value={whatsappForm.webhookVerifyToken}
                  onChange={(e) => setWhatsappForm(prev => ({ ...prev, webhookVerifyToken: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Crie uma senha segura para validar webhooks do Meta
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook (somente leitura)</Label>
                <Input 
                  id="webhookUrl" 
                  value={`${window.location.origin}/api/whatsapp/webhook`}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Configure esta URL no Meta for Developers → WhatsApp → Configuration
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Respostas Automáticas</p>
                  <p className="text-sm text-muted-foreground">Permitir que agentes respondam automaticamente</p>
                </div>
                <Switch 
                  checked={whatsappForm.autoResponses}
                  onCheckedChange={(checked) => setWhatsappForm(prev => ({ ...prev, autoResponses: checked }))}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={updateWhatsappSettings.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateWhatsappSettings.isPending ? "Salvando..." : "Salvar Configurações WhatsApp"}
              </Button>
            </form>
            
            {whatsappSettings?.isConfigured && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    WhatsApp configurado com sucesso
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Número: ***{whatsappSettings.phoneNumberId} • 
                  Status: {whatsappSettings.isActive ? "Ativo" : "Inativo"} • 
                  Última atualização: {whatsappSettings.updatedAt ? new Date(whatsappSettings.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
            )}
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