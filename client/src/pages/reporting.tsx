import { FileText } from "lucide-react";

export default function Reporting() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Reporting</h1>
        <p className="text-muted-foreground">Relatórios e exportação de dados</p>
      </div>
      
      <div className="text-center py-20">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Relatórios em Desenvolvimento</h3>
        <p className="text-muted-foreground">Esta seção estará disponível em breve</p>
      </div>
    </div>
  );
}
