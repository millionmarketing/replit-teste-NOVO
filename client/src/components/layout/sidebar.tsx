import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  MessageCircle, 
  Bot, 
  Users, 
  BarChart3, 
  FileText,
  Settings,
  HelpCircle,
  Search,
  Crown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mensagens", href: "/messages", icon: MessageCircle, badge: 3 },
  { name: "Agentes", href: "/agents", icon: Bot },
  { name: "Contatos", href: "/contacts", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reporting", href: "/reporting", icon: FileText },
  { name: "Configurações", href: "/settings", icon: Settings },
];

const otherLinks = [
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-gradient-to-b from-primary via-primary to-purple-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-primary-foreground/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-sm">PW</span>
          </div>
          <div>
            <h1 className="text-primary-foreground font-bold text-lg">PATH WOUNDED</h1>
            <p className="text-purple-200 text-xs">Agente IA CRM</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-purple-600/30 border-purple-400/20 text-primary-foreground placeholder:text-purple-300 focus:border-primary-foreground/50"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="text-purple-200 text-xs uppercase tracking-wide mb-4 font-medium">
          MENU
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-600/30 hover:text-primary-foreground transition-colors group cursor-pointer",
                  isActive && "bg-purple-600/50 text-primary-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="destructive" className="bg-red-500 text-primary-foreground">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Other Links */}
      <div className="p-4 border-t border-purple-400/20">
        <div className="text-purple-200 text-xs uppercase tracking-wide mb-4 font-medium">
          OUTROS
        </div>
        <div className="space-y-2">
          {otherLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-600/30 hover:text-primary-foreground transition-colors cursor-pointer">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="p-4">
        <div className="bg-purple-800/50 rounded-lg p-4 text-center">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-primary-foreground font-semibold text-sm mb-1">Go Premium!</h3>
          <p className="text-purple-200 text-xs mb-3">
            Get access to all features for up to 15 integrations
          </p>
          <Button 
            size="sm" 
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}