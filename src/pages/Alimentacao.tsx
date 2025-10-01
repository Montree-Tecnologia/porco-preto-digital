import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Utensils, ChefHat } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProPorcoData, RegistroAlimentacao } from "@/hooks/useProPorcoData";
import { useToast } from "@/hooks/use-toast";

// Schemas
const compostoAlimentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  ingredientes: z.array(z.object({
    insumoId: z.string().min(1, "Insumo é obrigatório"),
    quantidade: z.number().min(0.01, "Quantidade deve ser maior que 0")
  })).min(1, "Pelo menos um ingrediente é obrigatório")
});

const registroAlimentacaoSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  piqueteId: z.string().min(1, "Piquete é obrigatório"),
  porcoId: z.string().optional(),
  compostoId: z.string().min(1, "Composto é obrigatório"),
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que 0")
});

type CompostoAlimentoForm = z.infer<typeof compostoAlimentoSchema>;
type RegistroAlimentacaoForm = z.infer<typeof registroAlimentacaoSchema>;

export default function Alimentacao() {
  const { 
    insumos, 
    porcos, 
    piquetes, 
    compostos,
    registrosAlimentacao,
    criarCompostoAlimento,
    editarCompostoAlimento,
    deletarCompostoAlimento,
    criarRegistroAlimentacao,
    editarRegistroAlimentacao,
    deletarRegistroAlimentacao
  } = useProPorcoData();
  const { toast } = useToast();

  const [openCompostoDialog, setOpenCompostoDialog] = useState(false);
  const [openRegistroDialog, setOpenRegistroDialog] = useState(false);
  const [editingComposto, setEditingComposto] = useState<string | null>(null);
  const [editingRegistro, setEditingRegistro] = useState<string | null>(null);
  const [ingredientes, setIngredientes] = useState<{ insumoId: string; quantidade: number }[]>([]);

  const compostoForm = useForm<CompostoAlimentoForm>({
    resolver: zodResolver(compostoAlimentoSchema),
    defaultValues: {
      nome: "",
      ingredientes: []
    }
  });

  const registroForm = useForm<RegistroAlimentacaoForm>({
    resolver: zodResolver(registroAlimentacaoSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      porcoId: "todos",
      quantidade: 0
    }
  });

  const alimentosDisponiveis = insumos.filter(insumo => insumo.categoria === 'alimento');

  const handleCreateComposto = (data: CompostoAlimentoForm) => {
    const custoTotal = ingredientes.reduce((total, ing) => {
      const insumo = insumos.find(i => i.id === ing.insumoId);
      return total + (insumo ? insumo.valorCompra * ing.quantidade : 0);
    }, 0);

    const pesoTotal = ingredientes.reduce((total, ing) => total + ing.quantidade, 0);
    const custoKg = pesoTotal > 0 ? custoTotal / pesoTotal : 0;

    const novoComposto = {
      nome: data.nome,
      ingredientes,
      custoTotal,
      custoKg
    };

    if (editingComposto) {
      editarCompostoAlimento(editingComposto, novoComposto);
      toast({ title: "Composto atualizado com sucesso!" });
    } else {
      criarCompostoAlimento(novoComposto);
      toast({ title: "Composto criado com sucesso!" });
    }

    setOpenCompostoDialog(false);
    setEditingComposto(null);
    setIngredientes([]);
    compostoForm.reset();
  };

  const handleCreateRegistro = (data: RegistroAlimentacaoForm) => {
    const composto = compostos.find(c => c.id === data.compostoId);
    const custoTotal = composto ? composto.custoKg * data.quantidade : 0;

    const novoRegistro: Omit<RegistroAlimentacao, 'id'> = {
      data: data.data!,
      piqueteId: data.piqueteId,
      porcoId: data.porcoId === "todos" ? undefined : data.porcoId,
      compostoId: data.compostoId,
      quantidade: data.quantidade!,
      custoTotal
    };

    if (editingRegistro) {
      editarRegistroAlimentacao(editingRegistro, novoRegistro);
      toast({ title: "Registro atualizado com sucesso!" });
    } else {
      criarRegistroAlimentacao(novoRegistro);
      toast({ title: "Registro criado com sucesso!" });
    }

    setOpenRegistroDialog(false);
    setEditingRegistro(null);
    registroForm.reset();
  };

  const handleEditComposto = (composto: any) => {
    setEditingComposto(composto.id);
    setIngredientes(composto.ingredientes);
    compostoForm.setValue("nome", composto.nome);
    compostoForm.setValue("ingredientes", composto.ingredientes);
    setOpenCompostoDialog(true);
  };

  const handleEditRegistro = (registro: any) => {
    setEditingRegistro(registro.id);
    registroForm.reset({
      data: registro.data,
      piqueteId: registro.piqueteId,
      porcoId: registro.porcoId || "todos",
      compostoId: registro.compostoId,
      quantidade: registro.quantidade
    });
    setOpenRegistroDialog(true);
  };

  const addIngrediente = () => {
    setIngredientes([...ingredientes, { insumoId: "", quantidade: 0 }]);
  };

  const updateIngrediente = (index: number, field: string, value: any) => {
    const newIngredientes = [...ingredientes];
    newIngredientes[index] = { ...newIngredientes[index], [field]: value };
    setIngredientes(newIngredientes);
    compostoForm.setValue("ingredientes", newIngredientes);
  };

  const removeIngrediente = (index: number) => {
    const newIngredientes = ingredientes.filter((_, i) => i !== index);
    setIngredientes(newIngredientes);
    compostoForm.setValue("ingredientes", newIngredientes);
  };

  const getNomeInsumo = (insumoId: string) => {
    return insumos.find(i => i.id === insumoId)?.nome || "Insumo não encontrado";
  };

  const getNomePiquete = (piqueteId?: string) => {
    return piqueteId ? piquetes.find(p => p.id === piqueteId)?.nome || "Piquete não encontrado" : "-";
  };

  const getNomePorco = (porcoId?: string) => {
    return porcoId ? porcos.find(p => p.id === porcoId)?.nome || `Suíno ${porcoId}` : "Todos os Porcos";
  };

  const getNomeComposto = (compostoId?: string) => {
    return compostoId ? compostos.find(c => c.id === compostoId)?.nome || "Composto não encontrado" : "-";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alimentação</h1>
          <p className="text-muted-foreground">
            Gerencie compostos alimentares e registros de alimentação
          </p>
        </div>
      </div>

      <Tabs defaultValue="compostos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compostos" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Compostos Alimentares
          </TabsTrigger>
          <TabsTrigger value="registros" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Registros de Alimentação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compostos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Compostos Alimentares</h2>
            <Dialog open={openCompostoDialog} onOpenChange={setOpenCompostoDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingComposto(null);
                  setIngredientes([]);
                  compostoForm.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Composto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingComposto ? "Editar Composto" : "Novo Composto Alimentar"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure a receita do composto alimentar
                  </DialogDescription>
                </DialogHeader>

                <Form {...compostoForm}>
                  <form onSubmit={compostoForm.handleSubmit(handleCreateComposto)} className="space-y-4">
                    <FormField
                      control={compostoForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Composto</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Ração de crescimento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Ingredientes</label>
                        <Button type="button" variant="outline" size="sm" onClick={addIngrediente}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Ingrediente
                        </Button>
                      </div>

                      {ingredientes.map((ingrediente, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Alimento</label>
                            <Select
                              value={ingrediente.insumoId}
                              onValueChange={(value) => updateIngrediente(index, "insumoId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o alimento" />
                              </SelectTrigger>
                              <SelectContent>
                                {alimentosDisponiveis.map((alimento) => (
                                  <SelectItem key={alimento.id} value={alimento.id}>
                                    {alimento.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-32">
                            <label className="text-sm font-medium">Quantidade (kg)</label>
                            <Input
                              type="number"
                              step="0.1"
                              value={ingrediente.quantidade}
                              onChange={(e) => updateIngrediente(index, "quantidade", parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeIngrediente(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {ingredientes.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          Nenhum ingrediente adicionado
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setOpenCompostoDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingComposto ? "Atualizar" : "Criar"} Composto
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Compostos</CardTitle>
              <CardDescription>
                Compostos alimentares cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ingredientes</TableHead>
                    <TableHead>Custo/kg</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compostos.map((composto) => (
                    <TableRow key={composto.id}>
                      <TableCell className="font-medium">{composto.nome}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {composto.ingredientes.map((ing, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {getNomeInsumo(ing.insumoId)}: {ing.quantidade}kg
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>R$ {composto.custoKg.toFixed(2)}</TableCell>
                      <TableCell>R$ {composto.custoTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditComposto(composto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              deletarCompostoAlimento(composto.id);
                              toast({ title: "Composto deletado com sucesso!" });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registros" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Registros de Alimentação</h2>
            <Dialog open={openRegistroDialog} onOpenChange={setOpenRegistroDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingRegistro(null);
                  registroForm.reset({
                    data: new Date().toISOString().split('T')[0],
                    porcoId: "todos",
                    quantidade: 0
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Alimentação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingRegistro ? "Editar Registro" : "Novo Registro de Alimentação"}
                  </DialogTitle>
                  <DialogDescription>
                    Registre uma alimentação realizada
                  </DialogDescription>
                </DialogHeader>

                <Form {...registroForm}>
                  <form onSubmit={registroForm.handleSubmit(handleCreateRegistro)} className="space-y-4">
                    <FormField
                      control={registroForm.control}
                      name="data"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registroForm.control}
                        name="piqueteId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Piquete</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um piquete" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {piquetes.map((piquete) => (
                                  <SelectItem key={piquete.id} value={piquete.id}>
                                    {piquete.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registroForm.control}
                        name="porcoId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suíno Específico (opcional)</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um suíno" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="todos">Todos os Porcos</SelectItem>
                                {porcos.filter(p => p.status === 'ativo').map((porco) => (
                                  <SelectItem key={porco.id} value={porco.id}>
                                    {porco.nome || `Suíno ${porco.id}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registroForm.control}
                      name="compostoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Composto Alimentar</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um composto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {compostos.map((composto) => (
                                <SelectItem key={composto.id} value={composto.id}>
                                  {composto.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registroForm.control}
                      name="quantidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setOpenRegistroDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingRegistro ? "Atualizar" : "Registrar"} Alimentação
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alimentação</CardTitle>
              <CardDescription>
                Registros de alimentação realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Piquete</TableHead>
                    <TableHead>Suíno</TableHead>
                    <TableHead>Alimento/Composto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrosAlimentacao.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell>{new Date(registro.data).toLocaleDateString()}</TableCell>
                      <TableCell>{getNomePiquete(registro.piqueteId)}</TableCell>
                      <TableCell>{getNomePorco(registro.porcoId)}</TableCell>
                      <TableCell>
                        {getNomeComposto(registro.compostoId)}
                      </TableCell>
                      <TableCell>{registro.quantidade} kg</TableCell>
                      <TableCell>R$ {registro.custoTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRegistro(registro)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              deletarRegistroAlimentacao(registro.id);
                              toast({ title: "Registro deletado com sucesso!" });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}