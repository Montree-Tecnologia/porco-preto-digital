import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProPorcoData } from "@/hooks/useProPorcoData";
import { PiggyBank, Home, Package, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { getDashboardData, porcos, piquetes, insumos } = useProPorcoData();
  const stats = getDashboardData();

  const alertasEstoque = insumos.filter(
    (insumo) => insumo.quantidadeEstoque <= (insumo.estoqueMinimo || 0)
  );

  const porcosProximos100kg = porcos.filter(
    (porco) => porco.status === 'ativo' && (porco.pesoAtual || 0) >= 85
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da sua criação de suínos
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Suínos</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalPorcos}</div>
            <p className="text-xs text-muted-foreground">
              animais ativos no rebanho
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Piquetes</CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalPiquetes}</div>
            <p className="text-xs text-muted-foreground">
              instalações disponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.mediaPeso} kg</div>
            <p className="text-xs text-muted-foreground">
              peso médio do rebanho
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.totalVendas.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              receita total de vendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Informações Importantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Estoque */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-destructive" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertasEstoque.length > 0 ? (
              <div className="space-y-3">
                {alertasEstoque.map((insumo) => (
                  <div
                    key={insumo.id}
                    className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20"
                  >
                    <div>
                      <p className="font-medium text-destructive">{insumo.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Categoria: {insumo.categoria}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">
                        {insumo.quantidadeEstoque} {insumo.unidadeMedida}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mín: {insumo.estoqueMinimo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum alerta de estoque no momento
              </p>
            )}
          </CardContent>
        </Card>

        {/* Suínos Próximos ao Abate */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              Próximos ao Abate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {porcosProximos100kg.length > 0 ? (
              <div className="space-y-3">
                {porcosProximos100kg.slice(0, 5).map((porco) => (
                  <div
                    key={porco.id}
                    className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    <div>
                      <p className="font-medium text-primary">
                        {porco.nome || `Porco ${porco.id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {porco.raca} - {porco.sexo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {porco.pesoAtual} kg
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Peso atual
                      </p>
                    </div>
                  </div>
                ))}
                {porcosProximos100kg.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    + {porcosProximos100kg.length - 5} outros suínos
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum suíno próximo ao peso de abate
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ocupação dos Piquetes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Ocupação dos Piquetes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {piquetes.map((piquete) => {
              const ocupacaoPercent = (piquete.ocupacao / piquete.capacidadeMaxima) * 100;
              const isAlerta = ocupacaoPercent > 90;
              
              return (
                <div
                  key={piquete.id}
                  className={`p-4 rounded-lg border ${
                    isAlerta 
                      ? 'bg-destructive/10 border-destructive/20' 
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{piquete.nome}</h4>
                    <span className={`text-sm ${isAlerta ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {ocupacaoPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isAlerta ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(ocupacaoPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {piquete.ocupacao} / {piquete.capacidadeMaxima} animais
                  </p>
                  {piquete.tipo && (
                    <p className="text-xs text-muted-foreground">
                      Tipo: {piquete.tipo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}