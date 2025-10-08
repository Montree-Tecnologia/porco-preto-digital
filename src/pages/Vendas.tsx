import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useVendas, useCreateVenda, useDeleteVenda } from "@/hooks/useVendas";
import { usePorcos } from "@/hooks/usePorcos";

// Schema
const vendaSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  porcoIds: z.array(z.number()).min(1, "Selecione pelo menos um suíno"),
  porcos: z.array(z.object({
    porcoId: z.number().int().positive(),
    valorIndividual: z.number().min(0.01, "Valor deve ser maior que 0")
  }).strict()).min(1, "Informe o valor de cada animal"),
  peso: z.number().min(0.1, "Peso deve ser maior que 0"),
  valorTotal: z.number().min(0.01, "Valor total deve ser maior que 0"),
  comissaoPercentual: z.number().min(0, "Comissão não pode ser negativa").max(100, "Comissão não pode ser maior que 100%"),
  comprador: z.string().min(1, "Comprador é obrigatório"),
  observacoes: z.string().optional()
});

type VendaForm = z.infer<typeof vendaSchema>;

export default function Vendas() {
  const { data: porcos = [], isLoading: isLoadingPorcos } = usePorcos();
  const { data: vendas = [], isLoading: isLoadingVendas } = useVendas();
  const createVenda = useCreateVenda();
  const deleteVenda = useDeleteVenda();
  const { toast } = useToast();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingVenda, setEditingVenda] = useState<number | null>(null);
  const [selectedPorcos, setSelectedPorcos] = useState<number[]>([]);
  const [selectAllPorcos, setSelectAllPorcos] = useState(false);
  const [valoresIndividuais, setValoresIndividuais] = useState<{ [porcoId: number]: number }>({});
  
  // Filtros de período
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  const vendaForm = useForm<VendaForm>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      porcoIds: [],
      porcos: [],
      peso: 0,
      valorTotal: 0,
      comissaoPercentual: 0,
      comprador: "",
      observacoes: ""
    }
  });

  // Suínos disponíveis para venda (ativos e com peso)
  const porcosDisponiveis = porcos.filter(p => p.status === 'ativo' && p.pesoAtual && parseFloat(p.pesoAtual) > 0);

  // Filtrar vendas por período
  const vendasFiltradas = vendas.filter(venda => {
    const dataVenda = new Date(venda.data);
    const inicio = dataInicio ? new Date(dataInicio) : null;
    const fim = dataFim ? new Date(dataFim) : null;
    
    if (inicio && dataVenda < inicio) return false;
    if (fim && dataVenda > fim) return false;
    return true;
  });

  const sortedVendas = [...vendasFiltradas].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const handleCreateVenda = async (data: VendaForm) => {
    try {
      await createVenda.mutateAsync({
        data: data.data,
        peso: data.peso,
        porcos: data.porcos.map(p => ({
          porcoId: p.porcoId!,
          valorIndividual: p.valorIndividual!
        })),
        valorTotal: data.valorTotal,
        comissaoPercentual: data.comissaoPercentual,
        comprador: data.comprador,
        observacoes: data.observacoes
      });

      const valorComissao = (data.valorTotal * data.comissaoPercentual) / 100;
      toast({ 
        title: "Venda registrada com sucesso!",
        description: `${data.porcoIds.length} suíno(s) vendido(s) por R$ ${data.valorTotal.toFixed(2)} (Comissão: R$ ${valorComissao.toFixed(2)})`
      });

      setOpenDialog(false);
      setEditingVenda(null);
      setSelectedPorcos([]);
      setSelectAllPorcos(false);
      setValoresIndividuais({});
      vendaForm.reset();
    } catch (error) {
      toast({ 
        title: "Erro ao registrar venda",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao registrar a venda",
        variant: "destructive"
      });
    }
  };

  const handleDeleteVenda = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      deleteVenda.mutate(id);
      toast({ title: "Venda excluída com sucesso!" });
    }
  };

  const handlePorcoSelection = (porcoId: number, checked: boolean) => {
    let newSelection: number[];
    let newValores = { ...valoresIndividuais };
    
    if (checked) {
      newSelection = [...selectedPorcos, porcoId];
      if (!newValores[porcoId]) {
        newValores[porcoId] = 0;
      }
    } else {
      newSelection = selectedPorcos.filter(id => id !== porcoId);
      delete newValores[porcoId];
      setSelectAllPorcos(false);
    }
    
    setSelectedPorcos(newSelection);
    setValoresIndividuais(newValores);
    vendaForm.setValue("porcoIds", newSelection);
    
    // Atualizar porcos no form
    const porcosArray = newSelection.map(id => ({
      porcoId: id,
      valorIndividual: newValores[id] || 0
    }));
    vendaForm.setValue("porcos", porcosArray);
    
    // Calcular peso total automaticamente
    const pesoTotal = newSelection.reduce((total, id) => {
      const porco = porcos.find(p => p.id === id);
      return total + (parseFloat(porco?.pesoAtual || '0') || 0);
    }, 0);
    vendaForm.setValue("peso", Math.round(pesoTotal * 10) / 10);
    
    // Calcular valor total
    const valorTotal = Object.values(newValores).reduce((sum, val) => sum + val, 0);
    vendaForm.setValue("valorTotal", valorTotal);
  };

  const handleSelectAllPorcos = (checked: boolean) => {
    setSelectAllPorcos(checked);
    if (checked) {
      const allPorcoIds = porcosDisponiveis.map(p => p.id);
      const newValores: { [porcoId: number]: number } = {};
      allPorcoIds.forEach(id => {
        newValores[id] = valoresIndividuais[id] || 0;
      });
      
      setSelectedPorcos(allPorcoIds);
      setValoresIndividuais(newValores);
      vendaForm.setValue("porcoIds", allPorcoIds);
      
      const porcosArray = allPorcoIds.map(id => ({
        porcoId: id,
        valorIndividual: newValores[id]
      }));
      vendaForm.setValue("porcos", porcosArray);
      
      const pesoTotal = porcosDisponiveis.reduce((total, p) => total + (parseFloat(p.pesoAtual || '0') || 0), 0);
      vendaForm.setValue("peso", Math.round(pesoTotal * 10) / 10);
    } else {
      setSelectedPorcos([]);
      setValoresIndividuais({});
      vendaForm.setValue("porcoIds", []);
      vendaForm.setValue("porcos", []);
      vendaForm.setValue("peso", 0);
      vendaForm.setValue("valorTotal", 0);
    }
  };
  
  const handleValorIndividualChange = (porcoId: number, valor: number) => {
    const newValores = { ...valoresIndividuais, [porcoId]: valor };
    setValoresIndividuais(newValores);
    
    // Atualizar form
    const porcosArray = selectedPorcos.map(id => ({
      porcoId: id,
      valorIndividual: newValores[id] || 0
    }));
    vendaForm.setValue("porcos", porcosArray);
    
    // Recalcular valor total
    const valorTotal = Object.values(newValores).reduce((sum, val) => sum + val, 0);
    vendaForm.setValue("valorTotal", valorTotal);
  };

  const calcularEstatisticas = () => {
    const totalVendas = vendasFiltradas.reduce((sum, v) => sum + parseFloat(v.valorTotal), 0);
    const totalPorcos = vendasFiltradas.reduce((sum, v) => sum + (v.vendasPorcos?.length || 0), 0);
    
    // Calcular peso total somando os pesos individuais dos porcos vendidos
    let totalPeso = 0;
    vendasFiltradas.forEach(v => {
      v.vendasPorcos?.forEach(vp => {
        const porco = porcos.find(p => p.id === vp.porco.id);
        if (porco?.pesoAtual) {
          totalPeso += parseFloat(porco.pesoAtual);
        }
      });
    });
    
    const precoMedioKg = totalPeso > 0 ? totalVendas / totalPeso : 0;
    
    return {
      totalVendas,
      totalPorcos,
      totalPeso,
      precoMedioKg: Math.round(precoMedioKg * 100) / 100
    };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">
            Gerencie as vendas de suínos
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingVenda(null);
              setSelectedPorcos([]);
              setSelectAllPorcos(false);
              setValoresIndividuais({});
              vendaForm.reset({
                data: new Date().toISOString().split('T')[0],
                porcoIds: [],
                porcos: [],
                peso: 0,
                valorTotal: 0,
                comissaoPercentual: 0,
                comprador: "",
                observacoes: ""
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVenda ? "Editar Venda" : "Registrar Nova Venda"}
              </DialogTitle>
              <DialogDescription>
                Registre a venda de suínos
              </DialogDescription>
            </DialogHeader>

            <Form {...vendaForm}>
              <form onSubmit={vendaForm.handleSubmit(handleCreateVenda)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={vendaForm.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Venda</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendaForm.control}
                    name="comprador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comprador</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do comprador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={vendaForm.control}
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
                            Selecionar Todos ({porcosDisponiveis.length} disponíveis)
                          </label>
                        </div>
                         {porcosDisponiveis.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">
                            Nenhum suíno disponível para venda
                          </p>
                        ) : (
                          porcosDisponiveis.map((porco) => (
                            <div key={porco.id} className="space-y-2 p-2 border-b last:border-b-0">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedPorcos.includes(porco.id)}
                                  onCheckedChange={(checked) => 
                                    handlePorcoSelection(porco.id, checked as boolean)
                                  }
                                />
                                <label className="text-sm cursor-pointer flex-1">
                                  {porco.nome || `Suíno ${porco.id}`} - {porco.pesoAtual} kg
                                </label>
                              </div>
                              {selectedPorcos.includes(porco.id) && (
                                <div className="ml-6">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Valor (R$)"
                                    value={valoresIndividuais[porco.id] || ''}
                                    onChange={(e) => handleValorIndividualChange(porco.id, parseFloat(e.target.value) || 0)}
                                    className="h-8"
                                  />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={vendaForm.control}
                    name="peso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso Total (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Calculado automaticamente"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendaForm.control}
                    name="valorTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Total (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Calculado automaticamente"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            readOnly
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={vendaForm.control}
                  name="comissaoPercentual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comissão de Venda (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Valor da comissão: R$ {((vendaForm.watch("valorTotal") * vendaForm.watch("comissaoPercentual")) / 100).toFixed(2)}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vendaForm.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações sobre a venda"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingVenda ? "Atualizar" : "Registrar Venda"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalVendas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {vendas.length} venda(s) realizada(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suínos Vendidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPorcos}</div>
            <p className="text-xs text-muted-foreground">
              Total de animais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPeso.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">
              Peso comercializado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio/kg</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.precoMedioKg.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Por quilograma
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Vendas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>
                Registros de vendas realizadas
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Data Início</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Data Fim</label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="h-9"
                />
              </div>
              {(dataInicio || dataFim) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setDataInicio("");
                    setDataFim("");
                  }}
                  className="mt-5"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Suínos</TableHead>
                <TableHead>Valores Individuais</TableHead>
                <TableHead>Peso Total</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>R$/kg</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    Nenhuma venda registrada{(dataInicio || dataFim) && " no período selecionado"}
                  </TableCell>
                </TableRow>
              ) : (
                sortedVendas.map((venda) => {
                  const totalVenda = parseFloat(venda.valorTotal);
                  const comissaoPercent = parseFloat(venda.comissaoPercentual);
                  const valorComissao = (totalVenda * comissaoPercent) / 100;
                  
                  // Calcular peso total e preço/kg a partir dos porcos vendidos
                  let pesoTotal = 0;
                  venda.vendasPorcos?.forEach(vp => {
                    const porco = porcos.find(p => p.id === vp.porco.id);
                    if (porco?.pesoAtual) {
                      pesoTotal += parseFloat(porco.pesoAtual);
                    }
                  });
                  const precoKg = pesoTotal > 0 ? totalVenda / pesoTotal : 0;
                  
                  return (
                    <TableRow key={venda.id}>
                      <TableCell>{new Date(venda.data).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{venda.comprador}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {venda.vendasPorcos?.slice(0, 2).map((vp) => (
                            <Badge key={vp.porco.id} variant="outline" className="text-xs" data-testid={`badge-porco-${vp.porco.id}`}>
                              {vp.porco.nome || `Suíno ${vp.porco.id}`}
                            </Badge>
                          ))}
                          {(venda.vendasPorcos?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(venda.vendasPorcos?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {venda.vendasPorcos?.map((vp) => (
                            <div key={vp.porco.id} className="text-xs" data-testid={`valor-porco-${vp.porco.id}`}>
                              {vp.porco.nome || `Suíno ${vp.porco.id}`}: <span className="font-medium text-green-600">R$ {parseFloat(vp.valorIndividual).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{pesoTotal.toFixed(1)} kg</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        R$ {totalVenda.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        <div className="text-xs text-muted-foreground">{comissaoPercent}%</div>
                        R$ {valorComissao.toFixed(2)}
                      </TableCell>
                      <TableCell>R$ {precoKg.toFixed(2)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {venda.observacoes || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteVenda(venda.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-venda-${venda.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
