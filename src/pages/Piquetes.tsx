import { useState } from "react";
import { useProPorcoData } from "@/hooks/useProPorcoData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Piquete } from "@/hooks/useProPorcoData";

export default function Piquetes() {
  const { piquetes, criarPiquete, atualizarPiquete, excluirPiquete, loading } = useProPorcoData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPiquete, setEditingPiquete] = useState<Piquete | null>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    capacidadeMaxima: "",
    area: "",
    tipo: "",
    observacoes: ""
  });

  const filteredPiquetes = piquetes.filter(piquete =>
    piquete.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    piquete.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      nome: "",
      capacidadeMaxima: "",
      area: "",
      tipo: "",
      observacoes: ""
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.capacidadeMaxima) {
      toast({
        title: "Erro",
        description: "Nome e capacidade máxima são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await criarPiquete({
        nome: formData.nome,
        capacidadeMaxima: parseInt(formData.capacidadeMaxima),
        area: formData.area ? parseFloat(formData.area) : undefined,
        tipo: formData.tipo || undefined,
        observacoes: formData.observacoes || undefined
      });

      toast({
        title: "Sucesso",
        description: "Piquete criado com sucesso!"
      });

      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar piquete",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPiquete || !formData.nome || !formData.capacidadeMaxima) {
      toast({
        title: "Erro",
        description: "Nome e capacidade máxima são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await atualizarPiquete(editingPiquete.id, {
        nome: formData.nome,
        capacidadeMaxima: parseInt(formData.capacidadeMaxima),
        area: formData.area ? parseFloat(formData.area) : undefined,
        tipo: formData.tipo || undefined,
        observacoes: formData.observacoes || undefined
      });

      toast({
        title: "Sucesso",
        description: "Piquete atualizado com sucesso!"
      });

      setIsEditOpen(false);
      setEditingPiquete(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar piquete",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este piquete?")) return;

    try {
      await excluirPiquete(id);
      toast({
        title: "Sucesso",
        description: "Piquete excluído com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir piquete",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (piquete: Piquete) => {
    setEditingPiquete(piquete);
    setFormData({
      nome: piquete.nome,
      capacidadeMaxima: piquete.capacidadeMaxima.toString(),
      area: piquete.area?.toString() || "",
      tipo: piquete.tipo || "",
      observacoes: piquete.observacoes || ""
    });
    setIsEditOpen(true);
  };

  const getOcupacaoStatus = (ocupacao: number, capacidade: number) => {
    const percentual = (ocupacao / capacidade) * 100;
    if (percentual >= 90) return { label: "Lotado", variant: "destructive" as const };
    if (percentual >= 70) return { label: "Alto", variant: "default" as const };
    if (percentual >= 40) return { label: "Médio", variant: "secondary" as const };
    return { label: "Baixo", variant: "outline" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Piquetes</h1>
          <p className="text-muted-foreground">Gerencie os piquetes da sua propriedade</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Piquete
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Piquete</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome/Código *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Piquete A, Setor 1..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidadeMaxima">Capacidade Máxima *</Label>
                <Input
                  id="capacidadeMaxima"
                  type="number"
                  value={formData.capacidadeMaxima}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacidadeMaxima: e.target.value }))}
                  placeholder="Ex: 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Área (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.01"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="Ex: 500.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  placeholder="Ex: Crescimento, Engorda, Maternidade..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações gerais..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Criando..." : "Criar Piquete"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Piquetes Cadastrados</CardTitle>
          <CardDescription>
            Total de {piquetes.length} piquetes cadastrados
          </CardDescription>
          
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar piquetes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome/Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead>Área (m²)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPiquetes.map((piquete) => {
                const status = getOcupacaoStatus(piquete.ocupacao, piquete.capacidadeMaxima);
                return (
                  <TableRow key={piquete.id}>
                    <TableCell className="font-medium">{piquete.nome}</TableCell>
                    <TableCell>{piquete.tipo || "-"}</TableCell>
                    <TableCell>{piquete.capacidadeMaxima}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {piquete.ocupacao}/{piquete.capacidadeMaxima}
                      </div>
                    </TableCell>
                    <TableCell>{piquete.area || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditModal(piquete)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(piquete.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredPiquetes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhum piquete encontrado com os filtros aplicados" : "Nenhum piquete cadastrado"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Piquete</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome/Código *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Piquete A, Setor 1..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-capacidadeMaxima">Capacidade Máxima *</Label>
              <Input
                id="edit-capacidadeMaxima"
                type="number"
                value={formData.capacidadeMaxima}
                onChange={(e) => setFormData(prev => ({ ...prev, capacidadeMaxima: e.target.value }))}
                placeholder="Ex: 50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-area">Área (m²)</Label>
              <Input
                id="edit-area"
                type="number"
                step="0.01"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                placeholder="Ex: 500.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo</Label>
              <Input
                id="edit-tipo"
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                placeholder="Ex: Crescimento, Engorda, Maternidade..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-observacoes">Observações</Label>
              <Textarea
                id="edit-observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações gerais..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}