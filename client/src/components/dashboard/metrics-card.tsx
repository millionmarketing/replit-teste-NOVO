import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: "up" | "down";
}

export function MetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor,
  trend = "up" 
}: MetricsCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
          <TrendingUp className={cn(
            "w-4 h-4",
            trend === "up" ? "text-green-500" : "text-red-500"
          )} />
        </div>
        
        <div>
          <p className="text-muted-foreground text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          <p className={cn(
            "text-sm",
            trend === "up" ? "text-green-500" : "text-red-500"
          )}>
            {change}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
