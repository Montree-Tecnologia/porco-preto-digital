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
import { Plus, Edit, Trash2, Scale, TrendingUp, TrendingDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProPorcoData, RegistroPeso } from "@/hooks/useProPorcoData";
import { useToast } from "@/hooks/use-toast";

// Schema
const registroPesoSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  porcoId: z.string().min(1, "Suíno é obrigatório"),
  peso: z.number().min(0.1, "Peso deve ser maior que 0"),
  observacoes: z.string().optional()
});

type RegistroPesoForm = z.infer<typeof registroPesoSchema>;

export default function Pesagem() {
  const { 
    porcos, 
    registrosPeso,
    criarRegistroPeso,
    editarRegistroPeso,
    deletarRegistroPeso
  } = useProPorcoData();
  const { toast } = useToast();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<string | null>(null);
  const [filterPorcoId, setFilterPorcoId] = useState<string>("todos");

  const registroForm = useForm<RegistroPesoForm>({
    resolver: zodResolver(registroPesoSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      peso: 0,
      observacoes: ""
    }
  });

  const porcosAtivos = porcos.filter(p => p.status === 'ativo');

  const filteredRegistros = filterPorcoId === "todos" 
    ? registrosPeso 
    : registrosPeso.filter(r => r.porcoId === filterPorcoId);

  const sortedRegistros = [...filteredRegistros].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const handleCreateRegistro = (data: RegistroPesoForm) => {
    const registroData = {
      data: data.data,
      porcoId: data.porcoId,
      peso: data.peso,
      observacoes: data.observacoes || undefined
    };

    if (editingRegistro) {
      editarRegistroPeso(editingRegistro, registroData);
      toast({ title: "Registro atualizado com sucesso!" });
    } else {
      criarRegistroPeso(registroData);
      toast({ title: "Registro criado com sucesso!" });
    }

    setOpenDialog(false);
    setEditingRegistro(null);
    registroForm.reset();
  };

  const handleEditRegistro = (registro: RegistroPeso) => {
    setEditingRegistro(registro.id);
    registroForm.reset({
      data: registro.data,
      porcoId: registro.porcoId,
      peso: registro.peso,
      observacoes: registro.observacoes
    });
    setOpenDialog(true);
  };

  const handleDeleteRegistro = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      deletarRegistroPeso(id);
      toast({ title: "Registro excluído com sucesso!" });
    }
  };

  const getNomePorco = (porcoId: string) => {
    return porcos.find(p => p.id === porcoId)?.nome || `Suíno ${porcoId}`;
  };

  const getPesoAnterior = (registro: RegistroPeso) => {
    const registrosDoPorco = registrosPeso
      .filter(r => r.porcoId === registro.porcoId && r.data < registro.data)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
    return registrosDoPorco[0]?.peso;
  };

  const getVariacaoPeso = (registro: RegistroPeso) => {
    const pesoAnterior = getPesoAnterior(registro);
    if (!pesoAnterior) return null;
    
    const variacao = registro.peso - pesoAnterior;
    return variacao;
  };

  const getEstatisticasPorco = (porcoId: string) => {
    const registrosDoPorco = registrosPeso
      .filter(r => r.porcoId === porcoId)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    
    if (registrosDoPorco.length < 2) return null;
    
    const pesoInicial = registrosDoPorco[0].peso;
    const pesoAtual = registrosDoPorco[registrosDoPorco.length - 1].peso;
    const ganhoTotal = pesoAtual - pesoInicial;
    
    const diasTotal = Math.floor(
      (new Date(registrosDoPorco[registrosDoPorco.length - 1].data).getTime() - 
       new Date(registrosDoPorco[0].data).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const ganhoDiario = diasTotal > 0 ? ganhoTotal / diasTotal : 0;
    
    return {
      pesoInicial,
      pesoAtual,
      ganhoTotal,
      ganhoDiario: Math.round(ganhoDiario * 1000) / 1000,
      numeroPesagens: registrosDoPorco.length
    };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Peso</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe a evolução de peso dos suínos
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingRegistro(null);
              registroForm.reset({
                data: new Date().toISOString().split('T')[0],
                peso: 0,
                observacoes: ""
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Pesagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRegistro ? "Editar Registro" : "Novo Registro de Pesagem"}
              </DialogTitle>
              <DialogDescription>
                Registre o peso do suíno
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
                    name="porcoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suíno</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o suíno" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {porcosAtivos.map((porco) => (
                              <SelectItem key={porco.id} value={porco.id}>
                                {porco.nome || `Suíno ${porco.id}`} - Piquete {porco.piqueteId}
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
                  name="peso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 32.5"
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
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações sobre a pesagem"
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
                    {editingRegistro ? "Atualizar" : "Registrar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pesagens</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrosPeso.length}</div>
            <p className="text-xs text-muted-foreground">
              Registros no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suínos Acompanhados</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(registrosPeso.map(r => r.porcoId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              De {porcosAtivos.length} suínos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Médio Atual</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {porcosAtivos.filter(p => p.pesoAtual).length > 0
                ? Math.round(
                    porcosAtivos
                      .filter(p => p.pesoAtual)
                      .reduce((sum, p) => sum + (p.pesoAtual || 0), 0) /
                      porcosAtivos.filter(p => p.pesoAtual).length * 10
                  ) / 10
                : 0} kg
            </div>
            <p className="text-xs text-muted-foreground">
              Média do rebanho ativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Pesagens</CardTitle>
              <CardDescription>
                Registros de peso dos suínos
              </CardDescription>
            </div>
            <div className="w-64">
              <Select value={filterPorcoId} onValueChange={setFilterPorcoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por suíno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os suínos</SelectItem>
                  {porcosAtivos.map((porco) => (
                    <SelectItem key={porco.id} value={porco.id}>
                      {porco.nome || `Suíno ${porco.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Suíno</TableHead>
                <TableHead>Peso (kg)</TableHead>
                <TableHead>Variação</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRegistros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                sortedRegistros.map((registro) => {
                  const variacao = getVariacaoPeso(registro);
                  return (
                    <TableRow key={registro.id}>
                      <TableCell>{new Date(registro.data).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{getNomePorco(registro.porcoId)}</TableCell>
                      <TableCell>{registro.peso} kg</TableCell>
                      <TableCell>
                        {variacao !== null ? (
                          <Badge 
                            variant={variacao >= 0 ? "default" : "destructive"}
                            className="flex items-center gap-1 w-fit"
                          >
                            {variacao >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {variacao >= 0 ? '+' : ''}{variacao.toFixed(1)} kg
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Primeira pesagem</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {registro.observacoes || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditRegistro(registro)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteRegistro(registro.id)}
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

      {/* Estatísticas por Suíno */}
      {filterPorcoId !== "todos" && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas - {getNomePorco(filterPorcoId)}</CardTitle>
            <CardDescription>
              Resumo da evolução de peso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const stats = getEstatisticasPorco(filterPorcoId);
              if (!stats) {
                return (
                  <p className="text-muted-foreground">
                    É necessário pelo menos 2 pesagens para calcular as estatísticas.
                  </p>
                );
              }
              return (
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Peso Inicial</p>
                    <p className="text-2xl font-bold">{stats.pesoInicial} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peso Atual</p>
                    <p className="text-2xl font-bold">{stats.pesoAtual} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ganho Total</p>
                    <p className="text-2xl font-bold text-green-600">+{stats.ganhoTotal.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ganho Médio Diário</p>
                    <p className="text-2xl font-bold">{stats.ganhoDiario} kg/dia</p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
