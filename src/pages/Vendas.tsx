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
import { useProPorcoData, Venda } from "@/hooks/useProPorcoData";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

// Schema
const vendaSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  porcoIds: z.array(z.string()).min(1, "Selecione pelo menos um suíno"),
  peso: z.number().min(0.1, "Peso deve ser maior que 0"),
  valorTotal: z.number().min(0.01, "Valor total deve ser maior que 0"),
  comprador: z.string().min(1, "Comprador é obrigatório"),
  observacoes: z.string().optional()
});

type VendaForm = z.infer<typeof vendaSchema>;

export default function Vendas() {
  const { 
    porcos, 
    vendas,
    criarVenda,
    editarVenda,
    deletarVenda
  } = useProPorcoData();
  const { toast } = useToast();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingVenda, setEditingVenda] = useState<string | null>(null);
  const [selectedPorcos, setSelectedPorcos] = useState<string[]>([]);
  const [selectAllPorcos, setSelectAllPorcos] = useState(false);

  const vendaForm = useForm<VendaForm>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      porcoIds: [],
      peso: 0,
      valorTotal: 0,
      comprador: "",
      observacoes: ""
    }
  });

  // Suínos disponíveis para venda (ativos e com peso)
  const porcosDisponiveis = porcos.filter(p => p.status === 'ativo' && p.pesoAtual && p.pesoAtual > 0);

  const sortedVendas = [...vendas].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const handleCreateVenda = (data: VendaForm) => {
    const vendaData = {
      data: data.data,
      porcoIds: data.porcoIds,
      peso: data.peso,
      valorTotal: data.valorTotal,
      comprador: data.comprador,
      observacoes: data.observacoes || undefined
    };

    if (editingVenda) {
      editarVenda(editingVenda, vendaData);
      toast({ title: "Venda atualizada com sucesso!" });
    } else {
      criarVenda(vendaData);
      toast({ 
        title: "Venda registrada com sucesso!",
        description: `${data.porcoIds.length} suíno(s) vendido(s) por R$ ${data.valorTotal.toFixed(2)}`
      });
    }

    setOpenDialog(false);
    setEditingVenda(null);
    setSelectedPorcos([]);
    setSelectAllPorcos(false);
    vendaForm.reset();
  };

  const handleEditVenda = (venda: Venda) => {
    setEditingVenda(venda.id);
    setSelectedPorcos(venda.porcoIds);
    vendaForm.reset({
      data: venda.data,
      porcoIds: venda.porcoIds,
      peso: venda.peso,
      valorTotal: venda.valorTotal,
      comprador: venda.comprador,
      observacoes: venda.observacoes
    });
    setOpenDialog(true);
  };

  const handleDeleteVenda = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      deletarVenda(id);
      toast({ title: "Venda excluída com sucesso!" });
    }
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
    vendaForm.setValue("porcoIds", newSelection);
    
    // Calcular peso total automaticamente
    const pesoTotal = newSelection.reduce((total, id) => {
      const porco = porcos.find(p => p.id === id);
      return total + (porco?.pesoAtual || 0);
    }, 0);
    vendaForm.setValue("peso", Math.round(pesoTotal * 10) / 10);
  };

  const handleSelectAllPorcos = (checked: boolean) => {
    setSelectAllPorcos(checked);
    if (checked) {
      const allPorcoIds = porcosDisponiveis.map(p => p.id);
      setSelectedPorcos(allPorcoIds);
      vendaForm.setValue("porcoIds", allPorcoIds);
      
      const pesoTotal = porcosDisponiveis.reduce((total, p) => total + (p.pesoAtual || 0), 0);
      vendaForm.setValue("peso", Math.round(pesoTotal * 10) / 10);
    } else {
      setSelectedPorcos([]);
      vendaForm.setValue("porcoIds", []);
      vendaForm.setValue("peso", 0);
    }
  };

  const getNomePorco = (porcoId: string) => {
    return porcos.find(p => p.id === porcoId)?.nome || `Suíno ${porcoId}`;
  };

  const calcularEstatisticas = () => {
    const totalVendas = vendas.reduce((sum, v) => sum + v.valorTotal, 0);
    const totalPorcos = vendas.reduce((sum, v) => sum + v.porcoIds.length, 0);
    const totalPeso = vendas.reduce((sum, v) => sum + v.peso, 0);
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
              vendaForm.reset({
                data: new Date().toISOString().split('T')[0],
                porcoIds: [],
                peso: 0,
                valorTotal: 0,
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
                            <div key={porco.id} className="flex items-center space-x-2">
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
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            Registros de vendas realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Suínos</TableHead>
                <TableHead>Peso Total</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>R$/kg</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhuma venda registrada
                  </TableCell>
                </TableRow>
              ) : (
                sortedVendas.map((venda) => {
                  const precoKg = venda.peso > 0 ? venda.valorTotal / venda.peso : 0;
                  return (
                    <TableRow key={venda.id}>
                      <TableCell>{new Date(venda.data).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{venda.comprador}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {venda.porcoIds.slice(0, 2).map((porcoId) => (
                            <Badge key={porcoId} variant="outline" className="text-xs">
                              {getNomePorco(porcoId)}
                            </Badge>
                          ))}
                          {venda.porcoIds.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{venda.porcoIds.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{venda.peso} kg</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        R$ {venda.valorTotal.toFixed(2)}
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
                            onClick={() => handleEditVenda(venda)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteVenda(venda.id)}
                            className="text-destructive hover:text-destructive"
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
