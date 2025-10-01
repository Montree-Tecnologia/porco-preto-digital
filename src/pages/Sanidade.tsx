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
import { Plus, Edit, Trash2, Syringe, Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProPorcoData, RegistroSanitario } from "@/hooks/useProPorcoData";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

// Schema
const registroSanitarioSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  porcoIds: z.array(z.string()).min(1, "Selecione pelo menos um suíno"),
  insumoId: z.string().min(1, "Produto sanitário é obrigatório"),
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que 0"),
  responsavel: z.string().min(1, "Responsável é obrigatório"),
  observacoes: z.string().optional(),
  proximaAplicacao: z.string().optional()
});

type RegistroSanitarioForm = z.infer<typeof registroSanitarioSchema>;

export default function Sanidade() {
  const { 
    insumos, 
    porcos, 
    registrosSanitarios,
    criarRegistroSanitario,
    editarRegistroSanitario,
    deletarRegistroSanitario
  } = useProPorcoData();
  const { toast } = useToast();

  const [openRegistroDialog, setOpenRegistroDialog] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<string | null>(null);
  const [selectedPorcos, setSelectedPorcos] = useState<string[]>([]);
  const [selectAllPorcos, setSelectAllPorcos] = useState(false);

  const registroForm = useForm<RegistroSanitarioForm>({
    resolver: zodResolver(registroSanitarioSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      porcoIds: [],
      quantidade: 0,
      responsavel: ""
    }
  });

  const produtosSanitarios = insumos.filter(
    insumo => insumo.categoria === 'vacina' || insumo.categoria === 'medicamento'
  );

  const porcosAtivos = porcos.filter(p => p.status === 'ativo');

  const handleCreateRegistro = (data: RegistroSanitarioForm) => {
    const insumo = insumos.find(i => i.id === data.insumoId);
    const custoUnitario = insumo ? insumo.valorCompra : 0;
    const custoTotal = custoUnitario * data.quantidade;

    const novoRegistro: Omit<RegistroSanitario, 'id'> = {
      data: data.data!,
      porcoIds: data.porcoIds,
      insumoId: data.insumoId!,
      quantidade: data.quantidade!,
      responsavel: data.responsavel!,
      observacoes: data.observacoes,
      proximaAplicacao: data.proximaAplicacao
    };

    if (editingRegistro) {
      editarRegistroSanitario(editingRegistro, novoRegistro);
      toast({ title: "Registro atualizado com sucesso!" });
    } else {
      criarRegistroSanitario(novoRegistro);
      toast({ title: "Registro criado com sucesso!" });
    }

    setOpenRegistroDialog(false);
    setEditingRegistro(null);
    setSelectedPorcos([]);
    setSelectAllPorcos(false);
    registroForm.reset();
  };

  const handleEditRegistro = (registro: any) => {
    setEditingRegistro(registro.id);
    setSelectedPorcos(registro.porcoIds);
    registroForm.reset({
      data: registro.data,
      porcoIds: registro.porcoIds,
      insumoId: registro.insumoId,
      quantidade: registro.quantidade,
      responsavel: registro.responsavel,
      observacoes: registro.observacoes,
      proximaAplicacao: registro.proximaAplicacao
    });
    setOpenRegistroDialog(true);
  };

  const handlePorcoSelection = (porcoId: string, checked: boolean) => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selectedPorcos, porcoId];
    } else {
      newSelection = selectedPorcos.filter(id => id !== porcoId);
      setSelectAllPorcos(false);
    }
    setSelectedPorcos(newSelection);
    registroForm.setValue("porcoIds", newSelection);
  };

  const handleSelectAllPorcos = (checked: boolean) => {
    setSelectAllPorcos(checked);
    if (checked) {
      const allPorcoIds = porcosAtivos.map(p => p.id);
      setSelectedPorcos(allPorcoIds);
      registroForm.setValue("porcoIds", allPorcoIds);
    } else {
      setSelectedPorcos([]);
      registroForm.setValue("porcoIds", []);
    }
  };

  const getNomeInsumo = (insumoId: string) => {
    return insumos.find(i => i.id === insumoId)?.nome || "Produto não encontrado";
  };

  const getNomePorco = (porcoId: string) => {
    return porcos.find(p => p.id === porcoId)?.nome || `Suíno ${porcoId}`;
  };

  const getCategoriaInsumo = (insumoId: string) => {
    const insumo = insumos.find(i => i.id === insumoId);
    return insumo?.categoria === 'vacina' ? 'Vacina' : 'Medicamento';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sanidade</h1>
          <p className="text-muted-foreground">
            Gerencie produtos sanitários e registros de aplicação
          </p>
        </div>
      </div>

      <Tabs defaultValue="produtos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="produtos" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Produtos Sanitários
          </TabsTrigger>
          <TabsTrigger value="registros" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            Registros de Aplicação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Sanitários em Estoque</CardTitle>
              <CardDescription>
                Vacinas e medicamentos disponíveis no estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Validade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosSanitarios.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>
                        <Badge variant={produto.categoria === 'vacina' ? 'default' : 'secondary'}>
                          {produto.categoria === 'vacina' ? 'Vacina' : 'Medicamento'}
                        </Badge>
                      </TableCell>
                      <TableCell>{produto.quantidadeEstoque} {produto.unidadeMedida}</TableCell>
                      <TableCell>R$ {produto.valorCompra.toFixed(2)}</TableCell>
                      <TableCell>{produto.fornecedor || '-'}</TableCell>
                      <TableCell>
                        {produto.dataValidade 
                          ? new Date(produto.dataValidade).toLocaleDateString() 
                          : '-'}
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
            <h2 className="text-xl font-semibold">Registros de Aplicação</h2>
            <Dialog open={openRegistroDialog} onOpenChange={setOpenRegistroDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingRegistro(null);
                  setSelectedPorcos([]);
                  setSelectAllPorcos(false);
                  registroForm.reset({
                    data: new Date().toISOString().split('T')[0],
                    porcoIds: [],
                    quantidade: 0,
                    responsavel: ""
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Aplicação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRegistro ? "Editar Registro" : "Novo Registro de Aplicação"}
                  </DialogTitle>
                  <DialogDescription>
                    Registre uma aplicação de vacina ou medicamento
                  </DialogDescription>
                </DialogHeader>

                <Form {...registroForm}>
                  <form onSubmit={registroForm.handleSubmit(handleCreateRegistro)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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

                      <FormField
                        control={registroForm.control}
                        name="insumoId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produto Sanitário</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o produto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {produtosSanitarios.map((produto) => (
                                  <SelectItem key={produto.id} value={produto.id}>
                                    {produto.nome} ({produto.categoria})
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
                      name="porcoIds"
                      render={() => (
                        <FormItem>
                          <FormLabel>Suínos</FormLabel>
                          <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                            <div className="flex items-center space-x-2 font-medium pb-2 border-b">
                              <Checkbox
                                checked={selectAllPorcos}
                                onCheckedChange={handleSelectAllPorcos}
                              />
                              <label className="text-sm cursor-pointer">
                                Selecionar Todos ({porcosAtivos.length})
                              </label>
                            </div>
                            {porcosAtivos.map((porco) => (
                              <div key={porco.id} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedPorcos.includes(porco.id)}
                                  onCheckedChange={(checked) => 
                                    handlePorcoSelection(porco.id, checked as boolean)
                                  }
                                />
                                <label className="text-sm cursor-pointer">
                                  {porco.nome || `Suíno ${porco.id}`} - Piquete: {porco.piqueteId}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registroForm.control}
                        name="quantidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade (ml/dose)</FormLabel>
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

                      <FormField
                        control={registroForm.control}
                        name="responsavel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do responsável" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registroForm.control}
                      name="proximaAplicacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Próxima Aplicação (opcional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registroForm.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Observações sobre a aplicação"
                              {...field}
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
                        {editingRegistro ? "Atualizar" : "Registrar"} Aplicação
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aplicações</CardTitle>
              <CardDescription>
                Registros de aplicações de vacinas e medicamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Suínos</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Próxima Aplicação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrosSanitarios.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell>{new Date(registro.data).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{getNomeInsumo(registro.insumoId)}</TableCell>
                      <TableCell>
                        <Badge variant={getCategoriaInsumo(registro.insumoId) === 'Vacina' ? 'default' : 'secondary'}>
                          {getCategoriaInsumo(registro.insumoId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {registro.porcoIds.slice(0, 2).map((porcoId) => (
                            <Badge key={porcoId} variant="outline" className="text-xs">
                              {getNomePorco(porcoId)}
                            </Badge>
                          ))}
                          {registro.porcoIds.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{registro.porcoIds.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{registro.quantidade} ml</TableCell>
                      <TableCell>{registro.responsavel}</TableCell>
                      <TableCell>
                        {registro.proximaAplicacao 
                          ? new Date(registro.proximaAplicacao).toLocaleDateString() 
                          : '-'}
                      </TableCell>
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
                              deletarRegistroSanitario(registro.id);
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
