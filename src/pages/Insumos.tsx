import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useProPorcoData, type Insumo } from '@/hooks/useProPorcoData';

// Validation Schema
const insumoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  categoria: z.enum(['vacina', 'medicamento', 'alimento'], { required_error: "Categoria é obrigatória" }),
  unidadeMedida: z.string().trim().min(1, "Unidade de medida é obrigatória").max(20, "Unidade deve ter no máximo 20 caracteres"),
  valorCompra: z.number().min(0, "Valor de compra deve ser maior ou igual a 0").max(999999, "Valor muito alto"),
  quantidadeEstoque: z.number().min(0, "Quantidade deve ser maior ou igual a 0").max(999999, "Quantidade muito alta"),
  fornecedor: z.string().trim().max(100, "Fornecedor deve ter no máximo 100 caracteres").optional(),
  dataValidade: z.string().optional(),
  observacoes: z.string().trim().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
  estoqueMinimo: z.number().min(0, "Estoque mínimo deve ser maior ou igual a 0").max(999999, "Valor muito alto").optional(),
});

type InsumoFormData = z.infer<typeof insumoSchema>;

export default function Insumos() {
  const { insumos, criarInsumo, atualizarInsumo, excluirInsumo, loading } = useProPorcoData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todas");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  // Form for creating
  const createForm = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      nome: "",
      categoria: undefined,
      unidadeMedida: "",
      valorCompra: 0,
      quantidadeEstoque: 0,
      fornecedor: "",
      dataValidade: "",
      observacoes: "",
      estoqueMinimo: 0,
    },
  });

  // Form for editing
  const editForm = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
  });

  // Filter insumos
  const filteredInsumos = insumos.filter((insumo) => {
    const matchesSearch = insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (insumo.fornecedor && insumo.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategoria = categoriaFilter === "todas" || insumo.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  const onCreateSubmit = async (data: InsumoFormData) => {
    try {
      await criarInsumo({
        nome: data.nome,
        categoria: data.categoria,
        unidadeMedida: data.unidadeMedida,
        valorCompra: data.valorCompra,
        quantidadeEstoque: data.quantidadeEstoque,
        fornecedor: data.fornecedor || undefined,
        dataValidade: data.dataValidade || undefined,
        observacoes: data.observacoes || undefined,
        estoqueMinimo: data.estoqueMinimo || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Insumo criado com sucesso!",
      });

      setIsCreateOpen(false);
      createForm.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar insumo",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: InsumoFormData) => {
    if (!editingInsumo) return;

    try {
      await atualizarInsumo(editingInsumo.id, {
        nome: data.nome,
        categoria: data.categoria,
        unidadeMedida: data.unidadeMedida,
        valorCompra: data.valorCompra,
        quantidadeEstoque: data.quantidadeEstoque,
        fornecedor: data.fornecedor || undefined,
        dataValidade: data.dataValidade || undefined,
        observacoes: data.observacoes || undefined,
        estoqueMinimo: data.estoqueMinimo || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Insumo atualizado com sucesso!",
      });

      setIsEditOpen(false);
      setEditingInsumo(null);
      editForm.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar insumo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    editForm.reset({
      nome: insumo.nome,
      categoria: insumo.categoria,
      unidadeMedida: insumo.unidadeMedida,
      valorCompra: insumo.valorCompra,
      quantidadeEstoque: insumo.quantidadeEstoque,
      fornecedor: insumo.fornecedor || "",
      dataValidade: insumo.dataValidade || "",
      observacoes: insumo.observacoes || "",
      estoqueMinimo: insumo.estoqueMinimo || 0,
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este insumo?')) {
      try {
        await excluirInsumo(id);
        toast({
          title: "Sucesso",
          description: "Insumo excluído com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir insumo",
          variant: "destructive",
        });
      }
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      'vacina': 'Vacina',
      'medicamento': 'Medicamento',
      'alimento': 'Alimento'
    };
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const getCategoriaVariant = (categoria: string) => {
    const variants = {
      'vacina': 'default',
      'medicamento': 'secondary',
      'alimento': 'outline'
    };
    return variants[categoria as keyof typeof variants] || 'default';
  };

  const isEstoqueBaixo = (insumo: Insumo) => {
    if (!insumo.estoqueMinimo) return false;
    return insumo.quantidadeEstoque <= insumo.estoqueMinimo;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Insumos</h1>
          <p className="text-muted-foreground">
            Gerencie vacinas, medicamentos e alimentos
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Insumo</DialogTitle>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Vacina contra febre suína" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vacina">Vacina</SelectItem>
                            <SelectItem value="medicamento">Medicamento</SelectItem>
                            <SelectItem value="alimento">Alimento</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="unidadeMedida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de Medida *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: ml, kg, unidades" {...field} />
                        </FormControl>
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
                            placeholder="Ex: 25.50"
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
                    name="quantidadeEstoque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade em Estoque *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Ex: 100"
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
                    name="estoqueMinimo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque Mínimo</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Ex: 10"
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
                    name="fornecedor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornecedor</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Agropecuária Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="dataValidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Validade</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <Textarea placeholder="Observações adicionais..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Insumo</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                <SelectItem value="vacina">Vacinas</SelectItem>
                <SelectItem value="medicamento">Medicamentos</SelectItem>
                <SelectItem value="alimento">Alimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Insumos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Estoque ({filteredInsumos.length} itens)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInsumos.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{insumo.nome}</span>
                        {isEstoqueBaixo(insumo) && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCategoriaVariant(insumo.categoria) as any}>
                        {getCategoriaLabel(insumo.categoria)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={isEstoqueBaixo(insumo) ? "text-yellow-600 font-medium" : ""}>
                        {insumo.quantidadeEstoque}
                      </span>
                      {insumo.estoqueMinimo && (
                        <span className="text-muted-foreground text-sm">
                          {" "}/ min: {insumo.estoqueMinimo}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{insumo.unidadeMedida}</TableCell>
                    <TableCell>R$ {insumo.valorCompra.toFixed(2)}</TableCell>
                    <TableCell>{insumo.fornecedor || "N/A"}</TableCell>
                    <TableCell>
                      {insumo.dataValidade ? 
                        new Date(insumo.dataValidade).toLocaleDateString('pt-BR') : 
                        "N/A"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(insumo)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(insumo.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Insumo</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Vacina contra febre suína" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vacina">Vacina</SelectItem>
                          <SelectItem value="medicamento">Medicamento</SelectItem>
                          <SelectItem value="alimento">Alimento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="unidadeMedida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade de Medida *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ml, kg, unidades" {...field} />
                      </FormControl>
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
                          placeholder="Ex: 25.50"
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
                  name="quantidadeEstoque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade em Estoque *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 100"
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
                  name="estoqueMinimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 10"
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
                  name="fornecedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Agropecuária Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="dataValidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <Textarea placeholder="Observações adicionais..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}