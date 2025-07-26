import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PerformanceChartProps {
  data: Array<{
    hour: number;
    conversations: number;
    resolutions: number;
  }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const maxValue = Math.max(...data.map(d => d.conversations));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Performance por Horário - Hoje</CardTitle>
          <p className="text-muted-foreground text-sm">
            Análise de conversas e resoluções ao longo do dia
          </p>
        </div>
        <Button variant="outline" size="sm">
          Ver Detalhes
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-64 space-x-1">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className="bg-primary rounded-t-sm w-full transition-all hover:bg-primary/80"
                style={{ 
                  height: `${(item.conversations / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <span className="text-xs text-muted-foreground">
                {String(item.hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
