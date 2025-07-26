import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactCard } from "./contact-card";
import { Plus } from "lucide-react";
import type { Contact } from "@shared/schema";
import type { KanbanColumn } from "@/types";

interface KanbanBoardProps {
  contacts: Contact[];
  onUpdateContact: (contactId: string, updates: Partial<Contact>) => void;
}

export function KanbanBoard({ contacts, onUpdateContact }: KanbanBoardProps) {
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);

  const columns: KanbanColumn[] = [
    { id: 'new', title: 'Novos Leads', contacts: [], color: 'bg-blue-500' },
    { id: 'contacted', title: 'Contatados', contacts: [], color: 'bg-orange-500' },
    { id: 'qualified', title: 'Qualificados', contacts: [], color: 'bg-purple-500' },
    { id: 'proposal', title: 'Propostas', contacts: [], color: 'bg-yellow-500' },
    { id: 'closed', title: 'Fechados', contacts: [], color: 'bg-green-500' },
  ];

  // Group contacts by stage
  const groupedContacts = contacts.reduce((acc, contact) => {
    const stage = contact.stage || 'new';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  // Update columns with contacts
  columns.forEach(column => {
    column.contacts = groupedContacts[column.id] || [];
  });

  const handleDragStart = (e: React.DragEvent, contact: Contact) => {
    setDraggedContact(contact);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    
    if (draggedContact && draggedContact.stage !== targetStage) {
      onUpdateContact(draggedContact.id, { stage: targetStage });
    }
    
    setDraggedContact(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {columns.map((column) => (
        <Card 
          key={column.id}
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{column.title}</CardTitle>
              <Badge 
                variant="secondary" 
                className={`${column.color} text-white`}
              >
                {column.contacts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDragStart={handleDragStart}
              />
            ))}
            
            {/* Add Contact Placeholder */}
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="text-muted-foreground">
                <Plus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Arraste um contato aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
