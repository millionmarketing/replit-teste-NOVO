import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Globe } from "lucide-react";
import type { Contact } from "@shared/schema";

interface ContactCardProps {
  contact: Contact;
  onDragStart?: (e: React.DragEvent, contact: Contact) => void;
}

export function ContactCard({ contact, onDragStart }: ContactCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-orange-500';
      case 'qualified': return 'bg-purple-500';
      case 'proposal': return 'bg-yellow-500';
      case 'closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      draggable
      onDragStart={(e) => onDragStart?.(e, contact)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className={`w-10 h-10 ${getStageColor(contact.stage)}`}>
            <AvatarFallback className="text-white font-semibold text-sm">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{contact.name}</h4>
            <p className="text-muted-foreground text-xs truncate">{contact.company}</p>
          </div>
        </div>
        
        <div className="space-y-1 text-xs text-muted-foreground">
          {contact.email && (
            <div className="flex items-center">
              <Mail className="w-3 h-3 mr-2" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-2" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.source && (
            <div className="flex items-center">
              <Globe className="w-3 h-3 mr-2" />
              <span className="capitalize">{contact.source}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <Badge 
            variant="secondary" 
            className={`${getStageColor(contact.stage)} text-white text-xs`}
          >
            {contact.value ? formatCurrency(contact.value) : 'R$ 0'}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {formatDate(contact.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
