import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProPorcoData } from "@/hooks/useProPorcoData";
import { Plus, Search, Edit, Trash2, PiggyBank } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Porcos() {
  const { porcos, piquetes } = useProPorcoData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const getPiqueteNome = (piqueteId: string) => {
    return piquetes.find(p => p.id === piqueteId)?.nome || "N/A";
  };

  const filteredPorcos = porcos.filter(porco => {
    const matchesSearch = 
      (porco.nome?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      porco.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === "todos" || porco.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-primary text-primary-foreground';
      case 'vendido':
        return 'bg-accent text-accent-foreground';
      case 'morto':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - nascimento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dias`;
  };

  const calcularGanhoPeso = (porco: any) => {
    if (!porco.pesoAtual) return "N/A";
    const ganho = porco.pesoAtual - porco.pesoInicial;
    return `+${ganho.toFixed(1)} kg`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Suínos</h1>
          <p className="text-muted-foreground">
            Controle completo do seu rebanho
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Suíno
        </Button>
      </div>

      {/* Filtros */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "todos" ? "default" : "outline"}
                onClick={() => setStatusFilter("todos")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "ativo" ? "default" : "outline"}
                onClick={() => setStatusFilter("ativo")}
                size="sm"
              >
                Ativos
              </Button>
              <Button
                variant={statusFilter === "vendido" ? "default" : "outline"}
                onClick={() => setStatusFilter("vendido")}
                size="sm"
              >
                Vendidos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Suínos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Rebanho ({filteredPorcos.length} animais)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Raça/Sexo</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Peso Inicial</TableHead>
                  <TableHead>Peso Atual</TableHead>
                  <TableHead>Ganho</TableHead>
                  <TableHead>Piquete</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPorcos.map((porco) => (
                  <TableRow key={porco.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{porco.id}</TableCell>
                    <TableCell>
                      {porco.nome || "Sem nome"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{porco.raca || "N/A"}</div>
                        <div className="text-muted-foreground">
                          {porco.sexo === 'M' ? 'Macho' : porco.sexo === 'F' ? 'Fêmea' : 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {calcularIdade(porco.dataNascimento)}
                    </TableCell>
                    <TableCell>{porco.pesoInicial} kg</TableCell>
                    <TableCell>
                      {porco.pesoAtual ? `${porco.pesoAtual} kg` : "N/A"}
                    </TableCell>
                    <TableCell className="text-primary font-medium">
                      {calcularGanhoPeso(porco)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPiqueteNome(porco.piqueteId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(porco.status)}>
                        {porco.status.charAt(0).toUpperCase() + porco.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Compra: R$ {porco.valorCompra.toFixed(2)}</div>
                        {porco.valorVenda && (
                          <div className="text-primary">
                            Venda: R$ {porco.valorVenda.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredPorcos.length === 0 && (
            <div className="text-center py-8">
              <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "todos" 
                  ? "Nenhum suíno encontrado com os filtros aplicados"
                  : "Nenhum suíno cadastrado ainda"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}