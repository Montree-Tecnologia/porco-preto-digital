import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useProPorcoData, type Porco } from "@/hooks/useProPorcoData";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, PiggyBank } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Validation Schema
const porcoSchema = z.object({
  nome: z.string().trim().max(100, "Nome deve ter no máximo 100 caracteres").optional(),
  dataNascimento: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  }, "Data de nascimento inválida"),
  pesoInicial: z.number().min(0.1, "Peso inicial deve ser maior que 0").max(1000, "Peso inicial deve ser menor que 1000kg"),
  piqueteId: z.string().min(1, "Piquete é obrigatório"),
  valorCompra: z.number().min(0, "Valor de compra deve ser maior ou igual a 0").max(999999, "Valor muito alto"),
  raca: z.string().trim().max(50, "Raça deve ter no máximo 50 caracteres").optional(),
  sexo: z.enum(["M", "F"]).optional(),
  origem: z.string().trim().max(100, "Origem deve ter no máximo 100 caracteres").optional(),
  observacoes: z.string().trim().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
  pesoAtual: z.number().min(0.1, "Peso atual deve ser maior que 0").max(1000, "Peso atual deve ser menor que 1000kg").optional(),
});

type PorcoFormData = z.infer<typeof porcoSchema>;

export default function Porcos() {
  const { porcos, piquetes, criarPorco, atualizarPorco, excluirPorco, loading } = useProPorcoData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPorco, setEditingPorco] = useState<Porco | null>(null);

  // Form for creating
  const createForm = useForm<PorcoFormData>({
    resolver: zodResolver(porcoSchema),
    defaultValues: {
      nome: "",
      dataNascimento: "",
      pesoInicial: 0,
      piqueteId: "",
      valorCompra: 0,
      raca: "",
      sexo: undefined,
      origem: "",
      observacoes: "",
      pesoAtual: undefined,
    },
  });

  // Form for editing
  const editForm = useForm<PorcoFormData>({
    resolver: zodResolver(porcoSchema),
  });

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

  const onCreateSubmit = async (data: PorcoFormData) => {
    try {
      await criarPorco({
        nome: data.nome || undefined,
        dataNascimento: data.dataNascimento,
        pesoInicial: data.pesoInicial,
        piqueteId: data.piqueteId,
        valorCompra: data.valorCompra,
        raca: data.raca || undefined,
        sexo: data.sexo,
        origem: data.origem || undefined,
        observacoes: data.observacoes || undefined,
        status: 'ativo',
        pesoAtual: data.pesoAtual,
      });

      toast({
        title: "Sucesso",
        description: "Suíno criado com sucesso!",
      });

      setIsCreateOpen(false);
      createForm.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar suíno",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: PorcoFormData) => {
    if (!editingPorco) return;

    try {
      await atualizarPorco(editingPorco.id, {
        nome: data.nome || undefined,
        dataNascimento: data.dataNascimento,
        pesoInicial: data.pesoInicial,
        piqueteId: data.piqueteId,
        valorCompra: data.valorCompra,
        raca: data.raca || undefined,
        sexo: data.sexo,
        origem: data.origem || undefined,
        observacoes: data.observacoes || undefined,
        pesoAtual: data.pesoAtual,
      });

      toast({
        title: "Sucesso",
        description: "Suíno atualizado com sucesso!",
      });

      setIsEditOpen(false);
      setEditingPorco(null);
      editForm.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar suíno",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este suíno?")) return;

    try {
      await excluirPorco(id);
      toast({
        title: "Sucesso",
        description: "Suíno excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir suíno",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (porco: Porco) => {
    setEditingPorco(porco);
    editForm.reset({
      nome: porco.nome || "",
      dataNascimento: porco.dataNascimento,
      pesoInicial: porco.pesoInicial,
      piqueteId: porco.piqueteId,
      valorCompra: porco.valorCompra,
      raca: porco.raca || "",
      sexo: porco.sexo,
      origem: porco.origem || "",
      observacoes: porco.observacoes || "",
      pesoAtual: porco.pesoAtual,
    });
    setIsEditOpen(true);
  };

  const handleCreateOpen = () => {
    createForm.reset();
    setIsCreateOpen(true);
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
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateOpen} className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Novo Suíno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Suíno</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Porco 001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="pesoInicial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso Inicial (kg) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Ex: 25.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="pesoAtual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso Atual (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Ex: 45.2"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="piqueteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Piquete *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um piquete" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {piquetes.map((piquete) => (
                              <SelectItem key={piquete.id} value={piquete.id}>
                                {piquete.nome} - {piquete.ocupacao}/{piquete.capacidadeMaxima}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="valorCompra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Compra (R$) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Ex: 150.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="raca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raça</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Landrace, Yorkshire..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="sexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">Macho</SelectItem>
                            <SelectItem value="F">Fêmea</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="origem"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Origem</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Fazenda São João, Feira Local..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações gerais sobre o animal..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Cadastrando..." : "Cadastrar Suíno"}
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
            </Form>
          </DialogContent>
        </Dialog>
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
                        <Button size="sm" variant="outline" onClick={() => openEditModal(porco)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(porco.id)}>
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

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Suíno</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Porco 001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="pesoInicial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Inicial (kg) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 25.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="pesoAtual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Atual (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 45.2"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="piqueteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Piquete *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um piquete" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {piquetes.map((piquete) => (
                            <SelectItem key={piquete.id} value={piquete.id}>
                              {piquete.nome} - {piquete.ocupacao}/{piquete.capacidadeMaxima}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="valorCompra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Compra (R$) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Ex: 150.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="raca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raça</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Landrace, Yorkshire..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="sexo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o sexo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="M">Macho</SelectItem>
                          <SelectItem value="F">Fêmea</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="origem"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Origem</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Fazenda São João, Feira Local..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações gerais sobre o animal..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}