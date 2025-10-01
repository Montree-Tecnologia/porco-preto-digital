import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProPorcoData, Custo } from "@/hooks/useProPorcoData";
import { useToast } from "@/hooks/use-toast";

// Schema
const custoSchema = z.object({
  tipo: z.enum(['comissionamento', 'operacional', 'administrativo', 'outros']),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().min(0.01, "Valor deve ser maior que 0"),
  data: z.string().min(1, "Data é obrigatória"),
  observacoes: z.string().optional()
});

type CustoForm = z.infer<typeof custoSchema>;

export default function Financeiro() {
  const { 
    porcos,
    vendas,
    custos,
    registrosAlimentacao,
    registrosSanitarios,
    insumos,
    compostos,
    criarCusto,
    editarCusto,
    deletarCusto
  } = useProPorcoData();
  const { toast } = useToast();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCusto, setEditingCusto] = useState<string | null>(null);

  const custoForm = useForm<CustoForm>({
    resolver: zodResolver(custoSchema),
    defaultValues: {
      tipo: 'operacional',
      descricao: "",
      valor: 0,
      data: new Date().toISOString().split('T')[0],
      observacoes: ""
    }
  });

  const handleCreateCusto = (data: CustoForm) => {
    const custoData = {
      tipo: data.tipo,
      descricao: data.descricao,
      valor: data.valor,
      data: data.data,
      observacoes: data.observacoes || undefined
    };

    if (editingCusto) {
      editarCusto(editingCusto, custoData);
      toast({ title: "Custo atualizado com sucesso!" });
    } else {
      criarCusto(custoData);
      toast({ title: "Custo registrado com sucesso!" });
    }

    setOpenDialog(false);
    setEditingCusto(null);
    custoForm.reset();
  };

  const handleEditCusto = (custo: Custo) => {
    setEditingCusto(custo.id);
    custoForm.reset({
      tipo: custo.tipo,
      descricao: custo.descricao,
      valor: custo.valor,
      data: custo.data,
      observacoes: custo.observacoes
    });
    setOpenDialog(true);
  };

  const handleDeleteCusto = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este custo?')) {
      deletarCusto(id);
      toast({ title: "Custo excluído com sucesso!" });
    }
  };

  // Cálculos Financeiros
  const calcularCustoAlimentacao = () => {
    return registrosAlimentacao.reduce((total, reg) => total + reg.custoTotal, 0);
  };

  const calcularCustoSanidade = () => {
    return registrosSanitarios.reduce((total, reg) => {
      const insumo = insumos.find(i => i.id === reg.insumoId);
      return total + (insumo ? insumo.valorCompra * reg.quantidade : 0);
    }, 0);
  };

  const calcularCustosOperacionais = () => {
    return custos.reduce((total, c) => total + c.valor, 0);
  };

  const calcularCustoCompra = () => {
    return porcos.reduce((total, p) => total + p.valorCompra, 0);
  };

  const calcularCustoComissao = () => {
    return vendas.reduce((total, v) => {
      const comissaoVenda = v.valorTotal * (v.comissaoPercentual / 100);
      return total + comissaoVenda;
    }, 0);
  };

  const calcularReceitaTotal = () => {
    return vendas.reduce((total, v) => total + v.valorTotal, 0);
  };

  const calcularCustoTotal = () => {
    return calcularCustoAlimentacao() + 
           calcularCustoSanidade() + 
           calcularCustosOperacionais() + 
           calcularCustoCompra() +
           calcularCustoComissao();
  };

  const calcularLucroBruto = () => {
    return calcularReceitaTotal() - calcularCustoTotal();
  };

  const calcularMargemLucro = () => {
    const receita = calcularReceitaTotal();
    if (receita === 0) return 0;
    return (calcularLucroBruto() / receita) * 100;
  };

  // Análise por Animal
  const calcularCustosPorAnimal = () => {
    return porcos.map(porco => {
      // Custo de compra
      const custoCompra = porco.valorCompra;

      // Custo de alimentação
      const custoAlimentacao = registrosAlimentacao
        .filter(r => r.porcoId === porco.id || r.piqueteId === porco.piqueteId)
        .reduce((sum, r) => {
          if (r.porcoId === porco.id) {
            return sum + r.custoTotal;
          }
          // Se for por piquete, dividir pelo número de porcos no piquete
          const porcosNoPiquete = porcos.filter(p => p.piqueteId === r.piqueteId).length;
          return sum + (porcosNoPiquete > 0 ? r.custoTotal / porcosNoPiquete : 0);
        }, 0);

      // Custo de sanidade
      const custoSanidade = registrosSanitarios
        .filter(r => r.porcoIds.includes(porco.id))
        .reduce((sum, r) => {
          const insumo = insumos.find(i => i.id === r.insumoId);
          const custoTotal = insumo ? insumo.valorCompra * r.quantidade : 0;
          return sum + (custoTotal / r.porcoIds.length);
        }, 0);

      // Receita (se vendido)
      const venda = vendas.find(v => v.porcoIds.includes(porco.id));
      const receita = venda 
        ? venda.valoresIndividuais.find(vi => vi.porcoId === porco.id)?.valor || 0
        : 0;

      // Custo de comissão (calculado no momento da venda)
      const custoComissao = venda && receita > 0
        ? (receita * venda.comissaoPercentual / 100)
        : 0;

      const custoTotalAnimal = custoCompra + custoAlimentacao + custoSanidade + custoComissao;

      const lucro = receita - custoTotalAnimal;
      const margemLucro = receita > 0 ? (lucro / receita) * 100 : 0;

      return {
        porco,
        custoCompra,
        custoAlimentacao,
        custoSanidade,
        custoComissao,
        custoTotal: custoTotalAnimal,
        receita,
        lucro,
        margemLucro
      };
    });
  };

  const analisePorAnimal = calcularCustosPorAnimal();
  const sortedCustos = [...custos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const getTipoLabel = (tipo: string) => {
    const labels = {
      comissionamento: 'Comissionamento',
      operacional: 'Operacional',
      administrativo: 'Administrativo',
      outros: 'Outros'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Análise financeira e controle de custos
          </p>
        </div>
      </div>

      {/* Dashboard Financeiro */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {calcularReceitaTotal().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {vendas.length} venda(s) realizada(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {calcularCustoTotal().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os custos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calcularLucroBruto() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {calcularLucroBruto().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita - Custos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calcularMargemLucro() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calcularMargemLucro().toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Percentual de lucro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento de Custos */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alimentação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">R$ {calcularCustoAlimentacao().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Rações e insumos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sanidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">R$ {calcularCustoSanidade().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Vacinas e medicamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comissão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">R$ {calcularCustoComissao().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Comissões de venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">R$ {calcularCustosOperacionais().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Custos diversos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compra Animais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">R$ {calcularCustoCompra().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Investimento inicial</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análise */}
      <Tabs defaultValue="animais" className="space-y-4">
        <TabsList>
          <TabsTrigger value="animais">Análise por Animal</TabsTrigger>
          <TabsTrigger value="custos">Custos Operacionais</TabsTrigger>
        </TabsList>

        {/* Análise por Animal */}
        <TabsContent value="animais">
          <Card>
            <CardHeader>
              <CardTitle>Rentabilidade por Animal</CardTitle>
              <CardDescription>
                Análise detalhada de custos e lucro por suíno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Custo Compra</TableHead>
                    <TableHead>Custo Alimentação</TableHead>
                    <TableHead>Custo Sanidade</TableHead>
                    <TableHead>Custo Comissão</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analisePorAnimal.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground">
                        Nenhum animal cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    analisePorAnimal.map((analise) => (
                      <TableRow key={analise.porco.id}>
                        <TableCell className="font-medium">
                          {analise.porco.nome || `Suíno ${analise.porco.id}`}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            analise.porco.status === 'ativo' ? 'bg-green-100 text-green-800' :
                            analise.porco.status === 'vendido' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {analise.porco.status}
                          </span>
                        </TableCell>
                        <TableCell>R$ {analise.custoCompra.toFixed(2)}</TableCell>
                        <TableCell>R$ {analise.custoAlimentacao.toFixed(2)}</TableCell>
                        <TableCell>R$ {analise.custoSanidade.toFixed(2)}</TableCell>
                        <TableCell>
                          {analise.custoComissao > 0 ? `R$ ${analise.custoComissao.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="font-semibold">R$ {analise.custoTotal.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {analise.receita > 0 ? `R$ ${analise.receita.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className={analise.lucro >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {analise.receita > 0 ? `R$ ${analise.lucro.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className={analise.margemLucro >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {analise.receita > 0 ? `${analise.margemLucro.toFixed(1)}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custos Operacionais */}
        <TabsContent value="custos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custos Operacionais</CardTitle>
                  <CardDescription>
                    Registro de custos diversos da operação
                  </CardDescription>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingCusto(null);
                      custoForm.reset({
                        tipo: 'operacional',
                        descricao: "",
                        valor: 0,
                        data: new Date().toISOString().split('T')[0],
                        observacoes: ""
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Custo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCusto ? "Editar Custo" : "Registrar Novo Custo"}
                      </DialogTitle>
                      <DialogDescription>
                        Registre custos operacionais da fazenda
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...custoForm}>
                      <form onSubmit={custoForm.handleSubmit(handleCreateCusto)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={custoForm.control}
                            name="tipo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Custo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="operacional">Operacional</SelectItem>
                                    <SelectItem value="administrativo">Administrativo</SelectItem>
                                    <SelectItem value="comissionamento">Comissionamento</SelectItem>
                                    <SelectItem value="outros">Outros</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={custoForm.control}
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
                        </div>

                        <FormField
                          control={custoForm.control}
                          name="descricao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Input placeholder="Descrição do custo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={custoForm.control}
                          name="valor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor (R$)</FormLabel>
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

                        <FormField
                          control={custoForm.control}
                          name="observacoes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações (opcional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Observações sobre o custo"
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
                            {editingCusto ? "Atualizar" : "Registrar"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCustos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum custo registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCustos.map((custo) => (
                      <TableRow key={custo.id}>
                        <TableCell>{new Date(custo.data).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {getTipoLabel(custo.tipo)}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{custo.descricao}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          R$ {custo.valor.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {custo.observacoes || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditCusto(custo)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCusto(custo.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
