import { useQuery } from "@tanstack/react-query";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Users, 
  Bot, 
  TrendingUp,
  CheckCircle,
  ArrowUp
} from "lucide-react";
import { api } from "@/lib/api";
import type { MetricsData } from "@/types";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery<MetricsData>({
    queryKey: ["/api/metrics"],
    queryFn: api.getMetrics,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: api.getConversations,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: api.getContacts,
  });

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

  const recentActivities = [
    {
      id: 1,
      message: "Nova conversa iniciada com João Silva",
      time: "2 min atrás",
      type: "conversation",
      color: "bg-primary/10 border-primary/20",
      dot: "bg-primary",
    },
    {
      id: 2,
      message: "Lead Maria Santos foi qualificado pelo Agente SDR",
      time: "5 min atrás",
      type: "lead",
      color: "bg-green-500/10 border-green-500/20",
      dot: "bg-green-500",
    },
    {
      id: 3,
      message: "Agente Técnico resolveu ticket #1234",
      time: "15 min atrás",
      type: "support",
      color: "bg-orange-500/10 border-orange-500/20",
      dot: "bg-orange-500",
    },
  ];

  const newContacts = contacts ? contacts.slice(0, 2) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu sistema de atendimento</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Conversas Ativas"
          value={metrics?.activeConversations || 0}
          change="+7.1% vs mês anterior"
          icon={MessageCircle}
          iconColor="bg-green-500/20 text-green-500"
        />
        <MetricsCard
          title="Contatos Total"
          value={metrics?.totalContacts || 0}
          change="+3.2% vs mês anterior"
          icon={Users}
          iconColor="bg-orange-500/20 text-orange-500"
        />
        <MetricsCard
          title="Agentes IA"
          value={metrics?.aiAgents || 0}
          change="+100% vs mês anterior"
          icon={Bot}
          iconColor="bg-primary/20 text-primary"
        />
        <MetricsCard
          title="Taxa de Resolução"
          value={`${metrics?.resolutionRate || 0}%`}
          change="+2.1% vs mês anterior"
          icon={CheckCircle}
          iconColor="bg-blue-500/20 text-blue-500"
        />
      </div>

      {/* Performance Chart */}
      {metrics?.hourlyData && (
        <PerformanceChart data={metrics.hourlyData} />
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
            <Button variant="link" size="sm" className="text-primary hover:text-primary/80">
              Ver todas
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${activity.color}`}
              >
                <div className={`w-2 h-2 ${activity.dot} rounded-full mt-2`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* New Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Novos Contatos</CardTitle>
            <Button variant="link" size="sm" className="text-primary hover:text-primary/80">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {newContacts.map((contact) => (
              <div 
                key={contact.id}
                className="flex items-center space-x-3 p-3 hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Avatar className="w-10 h-10 bg-primary">
                  <AvatarFallback className="text-primary-foreground font-semibold">
                    {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Há {Math.floor(Math.random() * 10) + 1} min
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600">
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
