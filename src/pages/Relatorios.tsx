import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  X,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Utensils,
  Heart,
  DollarSign,
  Package
} from "lucide-react";
import { useProPorcoData } from "@/hooks/useProPorcoData";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Relatorios() {
  const { 
    porcos,
    vendas,
    custos,
    registrosAlimentacao,
    registrosSanitarios,
    registrosPeso,
    insumos,
    compostos,
    piquetes
  } = useProPorcoData();
  const { toast } = useToast();

  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();

  // Função para filtrar por período
  const filtrarPorPeriodo = <T extends { data: string }>(items: T[]): T[] => {
    if (!dataInicio && !dataFim) return items;
    
    return items.filter(item => {
      const itemDate = new Date(item.data);
      if (dataInicio && itemDate < dataInicio) return false;
      if (dataFim) {
        const fimComHora = new Date(dataFim);
        fimComHora.setHours(23, 59, 59, 999);
        if (itemDate > fimComHora) return false;
      }
      return true;
    });
  };

  const limparFiltros = () => {
    setDataInicio(undefined);
    setDataFim(undefined);
  };

  const handleExportar = (tipo: string) => {
    toast({
      title: "Exportação iniciada",
      description: `Relatório será exportado em formato ${tipo}`,
    });
  };

  // ============= CÁLCULOS GERENCIAIS =============
  const calcularResumoGeral = () => {
    const vendasFiltradas = filtrarPorPeriodo(vendas);
    const custosFiltrados = filtrarPorPeriodo(custos);
    const registrosAlimentacaoFiltrados = filtrarPorPeriodo(registrosAlimentacao);
    const registrosSanitariosFiltrados = filtrarPorPeriodo(registrosSanitarios);

    const totalAnimais = porcos.length;
    const animaisAtivos = porcos.filter(p => p.status === 'ativo').length;
    const animaisVendidos = porcos.filter(p => p.status === 'vendido').length;
    
    const receitaTotal = vendasFiltradas.reduce((sum, v) => sum + v.valorTotal, 0);
    const custoAlimentacao = registrosAlimentacaoFiltrados.reduce((sum, r) => sum + r.custoTotal, 0);
    const custoSanidade = registrosSanitariosFiltrados.reduce((sum, r) => {
      const insumo = insumos.find(i => i.id === r.insumoId);
      return sum + (insumo ? insumo.valorCompra * r.quantidade : 0);
    }, 0);
    const custoOperacional = custosFiltrados.reduce((sum, c) => sum + c.valor, 0);
    const custoComissao = vendasFiltradas.reduce((sum, v) => {
      return sum + (v.valorTotal * (v.comissaoPercentual / 100));
    }, 0);
    const custoCompra = porcos.reduce((sum, p) => sum + p.valorCompra, 0);
    
    const custoTotal = custoAlimentacao + custoSanidade + custoOperacional + custoComissao + custoCompra;
    const lucro = receitaTotal - custoTotal;
    const margemLucro = receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0;

    return {
      totalAnimais,
      animaisAtivos,
      animaisVendidos,
      receitaTotal,
      custoTotal,
      lucro,
      margemLucro,
      custoAlimentacao,
      custoSanidade,
      custoOperacional,
      custoComissao,
      custoCompra,
      totalVendas: vendasFiltradas.length
    };
  };

  // ============= CÁLCULOS DE PRODUÇÃO =============
  const calcularProducao = () => {
    const registrosAlimentacaoFiltrados = filtrarPorPeriodo(registrosAlimentacao);
    const registrosSanitariosFiltrados = filtrarPorPeriodo(registrosSanitarios);
    const registrosPesoFiltrados = filtrarPorPeriodo(registrosPeso);

    const totalAlimentacao = registrosAlimentacaoFiltrados.length;
    const totalSanidade = registrosSanitariosFiltrados.length;
    const totalPesagens = registrosPesoFiltrados.length;

    const racaoConsumida = registrosAlimentacaoFiltrados.reduce((sum, r) => {
      if (r.compostoId) {
        const composto = compostos.find(c => c.id === r.compostoId);
        // Calcular quantidade total do composto com base nos ingredientes
        const quantidadeTotal = composto?.ingredientes.reduce((total, ing) => total + ing.quantidade, 0) || 0;
        return sum + quantidadeTotal;
      }
      return sum + r.quantidade;
    }, 0);

    const custoMedioRacao = racaoConsumida > 0 
      ? registrosAlimentacaoFiltrados.reduce((sum, r) => sum + r.custoTotal, 0) / racaoConsumida
      : 0;

    // Ganho de peso médio
    const animaisComPesagens = porcos.filter(p => {
      const pesagens = registrosPesoFiltrados.filter(r => r.porcoId === p.id);
      return pesagens.length >= 2;
    });

    const ganhoPesoTotal = animaisComPesagens.reduce((sum, porco) => {
      const pesagens = registrosPesoFiltrados
        .filter(r => r.porcoId === porco.id)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      
      if (pesagens.length < 2) return sum;
      
      const pesoInicial = pesagens[0].peso;
      const pesoFinal = pesagens[pesagens.length - 1].peso;
      return sum + (pesoFinal - pesoInicial);
    }, 0);

    const ganhoPesoMedio = animaisComPesagens.length > 0 
      ? ganhoPesoTotal / animaisComPesagens.length 
      : 0;

    return {
      totalAlimentacao,
      totalSanidade,
      totalPesagens,
      racaoConsumida,
      custoMedioRacao,
      ganhoPesoMedio,
      animaisComPesagens: animaisComPesagens.length
    };
  };

  // ============= ANÁLISE POR PIQUETE =============
  const calcularPorPiquete = () => {
    return piquetes.map(piquete => {
      const animaisNoPiquete = porcos.filter(p => p.piqueteId === piquete.id);
      const totalAnimais = animaisNoPiquete.length;
      const taxaOcupacao = piquete.capacidadeMaxima > 0 
        ? (totalAnimais / piquete.capacidadeMaxima) * 100 
        : 0;

      const registrosAlimentacaoFiltrados = filtrarPorPeriodo(registrosAlimentacao);
      const custoAlimentacao = registrosAlimentacaoFiltrados
        .filter(r => r.piqueteId === piquete.id)
        .reduce((sum, r) => sum + r.custoTotal, 0);

      const custoMedioPorAnimal = totalAnimais > 0 ? custoAlimentacao / totalAnimais : 0;

      return {
        piquete,
        totalAnimais,
        capacidade: piquete.capacidadeMaxima,
        taxaOcupacao,
        custoAlimentacao,
        custoMedioPorAnimal
      };
    });
  };

  // ============= TOP 5 ANIMAIS =============
  const calcularTop5Animais = () => {
    const vendasFiltradas = filtrarPorPeriodo(vendas);
    
    return porcos
      .map(porco => {
        const venda = vendasFiltradas.find(v => v.porcoIds.includes(porco.id));
        const receita = venda 
          ? venda.valoresIndividuais.find(vi => vi.porcoId === porco.id)?.valor || 0
          : 0;

        const registrosAlimentacaoFiltrados = filtrarPorPeriodo(registrosAlimentacao);
        const custoAlimentacao = registrosAlimentacaoFiltrados
          .filter(r => r.porcoId === porco.id || r.piqueteId === porco.piqueteId)
          .reduce((sum, r) => {
            if (r.porcoId === porco.id) return sum + r.custoTotal;
            const porcosNoPiquete = porcos.filter(p => p.piqueteId === r.piqueteId).length;
            return sum + (porcosNoPiquete > 0 ? r.custoTotal / porcosNoPiquete : 0);
          }, 0);

        const custoCompra = porco.valorCompra;
        const custoTotal = custoCompra + custoAlimentacao;
        const lucro = receita - custoTotal;

        return {
          porco,
          receita,
          custoTotal,
          lucro
        };
      })
      .filter(item => item.receita > 0)
      .sort((a, b) => b.lucro - a.lucro)
      .slice(0, 5);
  };

  const resumoGeral = calcularResumoGeral();
  const producao = calcularProducao();
  const porPiquete = calcularPorPiquete();
  const top5Animais = calcularTop5Animais();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises gerenciais e relatórios de produção
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportar('PDF')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportar('Excel')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtro de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrar por Período</CardTitle>
          <CardDescription>
            Selecione um período para filtrar os relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {(dataInicio || dataFim) && (
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {(dataInicio || dataFim) && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {dataInicio && dataFim ? (
                  <>Exibindo dados de <strong>{format(dataInicio, "dd/MM/yyyy")}</strong> até <strong>{format(dataFim, "dd/MM/yyyy")}</strong></>
                ) : dataInicio ? (
                  <>Exibindo dados a partir de <strong>{format(dataInicio, "dd/MM/yyyy")}</strong></>
                ) : (
                  <>Exibindo dados até <strong>{format(dataFim!, "dd/MM/yyyy")}</strong></>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="producao">Produção</TabsTrigger>
          <TabsTrigger value="piquetes">Por Piquete</TabsTrigger>
        </TabsList>

        {/* VISÃO GERAL */}
        <TabsContent value="geral" className="space-y-4">
          {/* Cards de Resumo */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumoGeral.totalAnimais}</div>
                <p className="text-xs text-muted-foreground">
                  {resumoGeral.animaisAtivos} ativos, {resumoGeral.animaisVendidos} vendidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {resumoGeral.receitaTotal.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {resumoGeral.totalVendas} venda(s) realizada(s)
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
                  R$ {resumoGeral.custoTotal.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Todos os custos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                <DollarSign className={`h-4 w-4 ${resumoGeral.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${resumoGeral.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {resumoGeral.lucro.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem: {resumoGeral.margemLucro.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top 5 Animais */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Animais Mais Lucrativos</CardTitle>
              <CardDescription>Ranking dos animais vendidos com melhor lucro</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Lucro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top5Animais.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum animal vendido no período
                      </TableCell>
                    </TableRow>
                  ) : (
                    top5Animais.map((item, index) => (
                      <TableRow key={item.porco.id}>
                        <TableCell className="font-bold">{index + 1}º</TableCell>
                        <TableCell className="font-medium">
                          {item.porco.nome || `Suíno ${item.porco.id}`}
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          R$ {item.receita.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          R$ {item.custoTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className={`font-bold ${item.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {item.lucro.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RELATÓRIO FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Alimentação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">R$ {resumoGeral.custoAlimentacao.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {((resumoGeral.custoAlimentacao / resumoGeral.custoTotal) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sanidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">R$ {resumoGeral.custoSanidade.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {((resumoGeral.custoSanidade / resumoGeral.custoTotal) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Comissão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">R$ {resumoGeral.custoComissao.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {((resumoGeral.custoComissao / resumoGeral.custoTotal) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Operacional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">R$ {resumoGeral.custoOperacional.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {((resumoGeral.custoOperacional / resumoGeral.custoTotal) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Compra Animais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">R$ {resumoGeral.custoCompra.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {((resumoGeral.custoCompra / resumoGeral.custoTotal) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análise Financeira Detalhada</CardTitle>
              <CardDescription>Distribuição de custos e receitas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">Receita Total</p>
                      <p className="text-sm text-muted-foreground">{resumoGeral.totalVendas} vendas</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600">R$ {resumoGeral.receitaTotal.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium">Custo Total</p>
                      <p className="text-sm text-muted-foreground">Todos os custos operacionais</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-red-600">R$ {resumoGeral.custoTotal.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <DollarSign className={`h-8 w-8 ${resumoGeral.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <p className="font-medium">Lucro Líquido</p>
                      <p className="text-sm text-muted-foreground">Margem: {resumoGeral.margemLucro.toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${resumoGeral.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {resumoGeral.lucro.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RELATÓRIO DE PRODUÇÃO */}
        <TabsContent value="producao" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Registros Alimentação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{producao.totalAlimentacao}</div>
                <p className="text-xs text-muted-foreground">Total de registros</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Registros Sanidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{producao.totalSanidade}</div>
                <p className="text-xs text-muted-foreground">Total de registros</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pesagens Realizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{producao.totalPesagens}</div>
                <p className="text-xs text-muted-foreground">Total de registros</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ração Consumida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{producao.racaoConsumida.toFixed(1)} kg</div>
                <p className="text-xs text-muted-foreground">Período selecionado</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Produção</CardTitle>
              <CardDescription>Métricas de desempenho da produção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Utensils className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Custo Médio da Ração</p>
                      <p className="text-sm text-muted-foreground">Por kg de ração</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">R$ {producao.custoMedioRacao.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Ganho de Peso Médio</p>
                      <p className="text-sm text-muted-foreground">{producao.animaisComPesagens} animais com pesagens</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{producao.ganhoPesoMedio.toFixed(2)} kg</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Intervenções Sanitárias</p>
                      <p className="text-sm text-muted-foreground">Vacinas e medicamentos</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{producao.totalSanidade}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RELATÓRIO POR PIQUETE */}
        <TabsContent value="piquetes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Piquete</CardTitle>
              <CardDescription>Ocupação e custos por instalação</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Piquete</TableHead>
                    <TableHead>Animais</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Taxa Ocupação</TableHead>
                    <TableHead>Custo Alimentação</TableHead>
                    <TableHead>Custo/Animal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {porPiquete.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum piquete cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    porPiquete.map((item) => (
                      <TableRow key={item.piquete.id}>
                        <TableCell className="font-medium">{item.piquete.nome}</TableCell>
                        <TableCell>{item.totalAnimais}</TableCell>
                        <TableCell>{item.capacidade}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.taxaOcupacao > 90 ? 'bg-red-100 text-red-800' :
                            item.taxaOcupacao > 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.taxaOcupacao.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>R$ {item.custoAlimentacao.toFixed(2)}</TableCell>
                        <TableCell>
                          {item.totalAnimais > 0 ? `R$ ${item.custoMedioPorAnimal.toFixed(2)}` : '-'}
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