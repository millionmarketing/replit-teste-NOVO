import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Bot, 
  Percent, 
  MessageCircle, 
  CheckCircle,
  Settings,
  Edit,
  Trash,
  MoreVertical,
  Handshake,
  Wrench,
  Megaphone
} from "lucide-react";
import { api } from "@/lib/api";
import type { Agent } from "@shared/schema";

export default function Agents() {
  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    queryFn: api.getAgents,
  });

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'sdr': return Handshake;
      case 'support': return Wrench;
      case 'marketing': return Megaphone;
      default: return Bot;
    }
  };

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'sdr': return 'from-green-500 to-green-600';
      case 'support': return 'from-blue-500 to-blue-600';
      case 'marketing': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'training': return 'bg-yellow-500/20 text-yellow-500';
      case 'inactive': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const formatTools = (tools: any) => {
    if (!tools || !Array.isArray(tools)) return [];
    return tools;
  };

  const getToolColor = (tool: string) => {
    const colors: Record<string, string> = {
      'web_search': 'bg-blue-500/20 text-blue-500',
      'crm': 'bg-purple-500/20 text-purple-500',
      'email': 'bg-orange-500/20 text-orange-500',
      'knowledge_base': 'bg-green-500/20 text-green-500',
      'file_access': 'bg-yellow-500/20 text-yellow-500',
      'diagnostics': 'bg-red-500/20 text-red-500',
      'image_gen': 'bg-pink-500/20 text-pink-500',
      'analytics': 'bg-cyan-500/20 text-cyan-500',
      'social_media': 'bg-indigo-500/20 text-indigo-500',
    };
    return colors[tool] || 'bg-gray-500/20 text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const avgAccuracy = agents.length > 0 
    ? Math.round(agents.reduce((sum, a) => sum + (a.accuracy || 0), 0) / agents.length)
    : 0;
  const totalConversations = agents.reduce((sum, a) => sum + (a.conversationCount || 0), 0);
  const onlineAgents = agents.filter(a => a.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Agentes de IA</h1>
          <p className="text-muted-foreground">Gerencie seus agentes de IA e base de conhecimento</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Criar Agente
        </Button>
      </div>

      {/* Agents Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAgents}</p>
                <p className="text-muted-foreground text-sm">Agentes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Percent className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgAccuracy}%</p>
                <p className="text-muted-foreground text-sm">Precisão Média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalConversations}</p>
                <p className="text-muted-foreground text-sm">Conversas Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onlineAgents}</p>
                <p className="text-muted-foreground text-sm">Online Agora</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meus Agentes</CardTitle>
          <p className="text-muted-foreground text-sm">Gerencie e configure seus agentes de IA</p>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {agents.map((agent) => {
            const IconComponent = getAgentIcon(agent.type);
            const isHighlighted = agent.type === 'sdr';
            
            return (
              <div 
                key={agent.id} 
                className={`p-6 ${isHighlighted ? 'gradient-border' : ''}`}
              >
                <div className={isHighlighted ? 'gradient-border-content p-6' : ''}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getAgentColor(agent.type)} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{agent.name}</h4>
                        <p className="text-muted-foreground text-sm mb-2">{agent.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`${getAgentColor(agent.type).includes('green') ? 'text-green-500' : getAgentColor(agent.type).includes('blue') ? 'text-blue-500' : 'text-purple-500'}`}>
                            {agent.conversationCount} conversas
                          </span>
                          <span className={`${getAgentColor(agent.type).includes('green') ? 'text-green-500' : getAgentColor(agent.type).includes('blue') ? 'text-blue-500' : 'text-purple-500'}`}>
                            {agent.accuracy}% precisão
                          </span>
                          <span className={`${getAgentColor(agent.type).includes('green') ? 'text-green-500' : getAgentColor(agent.type).includes('blue') ? 'text-blue-500' : 'text-purple-500'}`}>
                            Modelo: {agent.model}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {formatTools(agent.tools).map((tool, index) => (
                            <Badge 
                              key={index}
                              variant="secondary"
                              className={`${getToolColor(tool)} text-xs`}
                            >
                              {tool.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary"
                        className={`${getStatusColor(agent.status)} font-medium capitalize`}
                      >
                        {agent.status === 'active' ? 'Ativo' : 
                         agent.status === 'training' ? 'Treinando' : 'Inativo'}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
