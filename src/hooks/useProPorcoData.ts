import { usePorcos, useCreatePorco, useUpdatePorco, useDeletePorco } from "./usePorcos";
import { usePiquetes, useCreatePiquete, useUpdatePiquete, useDeletePiquete } from "./usePiquetes";
import { useInsumos, useCreateInsumo, useUpdateInsumo, useDeleteInsumo } from "./useInsumos";
import { useCompostos, useCreateComposto, useUpdateComposto, useDeleteComposto } from "./useCompostos";
import { useAlimentacao, useCreateAlimentacao, useUpdateAlimentacao, useDeleteAlimentacao } from "./useAlimentacao";
import { useSanidade, useCreateSanidade, useUpdateSanidade, useDeleteSanidade } from "./useSanidade";
import { usePesagem, useCreatePesagem, useUpdatePesagem, useDeletePesagem } from "./usePesagem";
import { useVendas, useCreateVenda, useUpdateVenda, useDeleteVenda } from "./useVendas";
import { useCustos, useCreateCusto, useDeleteCusto } from "./useCustos";

// Types adaptados para manter compatibilidade com componentes existentes
export interface Porco {
  id: string;
  nome?: string;
  dataNascimento: string;
  pesoInicial: number;
  pesoAlvoAbate: number;
  piqueteId: string;
  valorCompra: number;
  raca?: string;
  sexo?: 'M' | 'F';
  origem?: string;
  observacoes?: string;
  status: 'ativo' | 'vendido' | 'morto';
  pesoAtual?: number;
  valorVenda?: number;
  dataVenda?: string;
}

export interface Piquete {
  id: string;
  nome: string;
  capacidadeMaxima: number;
  area?: number;
  tipo?: string;
  observacoes?: string;
  ocupacao: number;
}

export interface Insumo {
  id: string;
  nome: string;
  categoria: 'vacina' | 'medicamento' | 'alimento';
  unidadeMedida: string;
  valorCompra: number;
  quantidadeEstoque: number;
  fornecedor?: string;
  dataValidade?: string;
  observacoes?: string;
  estoqueMinimo?: number;
}

export interface CompostoAlimento {
  id: string;
  nome: string;
  ingredientes: {
    insumoId: string;
    quantidade: number;
  }[];
  custoTotal: number;
  custoKg: number;
}

export interface RegistroAlimentacao {
  id: string;
  data: string;
  piqueteId?: string;
  porcoId?: string;
  insumoId?: string;
  compostoId?: string;
  quantidade: number;
  custoTotal: number;
}

export interface RegistroSanitario {
  id: string;
  data: string;
  porcoIds: string[];
  insumoId: string;
  quantidade: number;
  responsavel: string;
  observacoes?: string;
  proximaAplicacao?: string;
}

export interface RegistroPeso {
  id: string;
  porcoId: string;
  data: string;
  peso: number;
  observacoes?: string;
}

export interface Venda {
  id: string;
  porcoIds: string[];
  valoresIndividuais: { porcoId: string; valor: number }[];
  data: string;
  peso: number;
  valorTotal: number;
  comissaoPercentual: number;
  comprador: string;
  observacoes?: string;
}

export interface Custo {
  id: string;
  tipo: 'comissionamento' | 'operacional' | 'administrativo' | 'outros';
  descricao: string;
  valor: number;
  data: string;
  observacoes?: string;
}

// Funções auxiliares para converter tipos do banco para interface mockada
const adaptPorco = (porco: any): Porco => ({
  id: String(porco.id),
  nome: porco.nome,
  dataNascimento: porco.dataNascimento,
  pesoInicial: parseFloat(porco.pesoInicial),
  pesoAlvoAbate: parseFloat(porco.pesoAlvoAbate),
  piqueteId: String(porco.piqueteId),
  valorCompra: parseFloat(porco.valorCompra),
  raca: porco.raca,
  sexo: porco.sexo,
  origem: porco.origem,
  observacoes: porco.observacoes,
  status: porco.status || 'ativo',
  pesoAtual: porco.pesoAtual ? parseFloat(porco.pesoAtual) : undefined,
  valorVenda: porco.valorVenda ? parseFloat(porco.valorVenda) : undefined,
  dataVenda: porco.dataVenda,
});

const adaptPiquete = (piquete: any): Piquete => ({
  id: String(piquete.id),
  nome: piquete.nome,
  capacidadeMaxima: piquete.capacidadeMaxima,
  area: piquete.area ? parseFloat(piquete.area) : undefined,
  tipo: piquete.tipo,
  observacoes: piquete.observacoes,
  ocupacao: piquete.ocupacao || 0,
});

const adaptInsumo = (insumo: any): Insumo => ({
  id: String(insumo.id),
  nome: insumo.nome,
  categoria: insumo.categoria,
  unidadeMedida: insumo.unidadeMedida,
  valorCompra: parseFloat(insumo.valorCompra),
  quantidadeEstoque: parseFloat(insumo.quantidadeEstoque),
  fornecedor: insumo.fornecedor,
  dataValidade: insumo.dataValidade,
  observacoes: insumo.observacoes,
  estoqueMinimo: insumo.estoqueMinimo ? parseFloat(insumo.estoqueMinimo) : undefined,
});

const adaptComposto = (composto: any): CompostoAlimento => ({
  id: String(composto.id),
  nome: composto.nome,
  ingredientes: composto.ingredientes.map((ing: any) => ({
    insumoId: String(ing.insumoId),
    quantidade: parseFloat(ing.quantidade),
  })),
  custoTotal: parseFloat(composto.custoTotal),
  custoKg: parseFloat(composto.custoKg),
});

const adaptAlimentacao = (alimentacao: any): RegistroAlimentacao => ({
  id: String(alimentacao.id),
  data: alimentacao.data,
  piqueteId: alimentacao.piqueteId ? String(alimentacao.piqueteId) : undefined,
  porcoId: alimentacao.porcoId ? String(alimentacao.porcoId) : undefined,
  insumoId: alimentacao.insumoId ? String(alimentacao.insumoId) : undefined,
  compostoId: alimentacao.compostoId ? String(alimentacao.compostoId) : undefined,
  quantidade: parseFloat(alimentacao.quantidade),
  custoTotal: parseFloat(alimentacao.custoTotal),
});

const adaptSanidade = (sanidade: any): RegistroSanitario => ({
  id: String(sanidade.id),
  data: sanidade.data,
  porcoIds: sanidade.porcoIds?.map(String) || [],
  insumoId: String(sanidade.insumoId),
  quantidade: parseFloat(sanidade.quantidade),
  responsavel: sanidade.responsavel,
  observacoes: sanidade.observacoes,
  proximaAplicacao: sanidade.proximaAplicacao,
});

const adaptPesagem = (pesagem: any): RegistroPeso => ({
  id: String(pesagem.id),
  porcoId: String(pesagem.porcoId),
  data: pesagem.data,
  peso: parseFloat(pesagem.peso),
  observacoes: pesagem.observacoes,
});

const adaptVenda = (venda: any): Venda => ({
  id: String(venda.id),
  porcoIds: venda.porcoIds?.map(String) || [],
  valoresIndividuais: venda.valoresIndividuais?.map((v: any) => ({
    porcoId: String(v.porcoId),
    valor: parseFloat(v.valor),
  })) || [],
  data: venda.data,
  peso: parseFloat(venda.peso),
  valorTotal: parseFloat(venda.valorTotal),
  comissaoPercentual: parseFloat(venda.comissaoPercentual),
  comprador: venda.comprador,
  observacoes: venda.observacoes,
});

const adaptCusto = (custo: any): Custo => ({
  id: String(custo.id),
  tipo: custo.tipo,
  descricao: custo.descricao,
  valor: parseFloat(custo.valor),
  data: custo.data,
  observacoes: custo.observacoes,
});

// Função auxiliar para converter números em strings decimais com precisão
const toDecimalString = (value: number | string | undefined, decimals: number = 2): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return undefined;
  return num.toFixed(decimals);
};

export function useProPorcoData() {
  // Queries
  const { data: porcosData = [], isLoading: loadingPorcos } = usePorcos();
  const { data: piquetesData = [], isLoading: loadingPiquetes } = usePiquetes();
  const { data: insumosData = [], isLoading: loadingInsumos } = useInsumos();
  const { data: compostosData = [], isLoading: loadingCompostos } = useCompostos();
  const { data: alimentacaoData = [], isLoading: loadingAlimentacao } = useAlimentacao();
  const { data: sanidadeData = [], isLoading: loadingSanidade } = useSanidade();
  const { data: pesagemData = [], isLoading: loadingPesagem } = usePesagem();
  const { data: vendasData = [], isLoading: loadingVendas } = useVendas();
  const { data: custosData = [], isLoading: loadingCustos } = useCustos();

  // Mutations
  const createPorco = useCreatePorco();
  const updatePorco = useUpdatePorco();
  const deletePorco = useDeletePorco();

  const createPiquete = useCreatePiquete();
  const updatePiquete = useUpdatePiquete();
  const deletePiquete = useDeletePiquete();

  const createInsumo = useCreateInsumo();
  const updateInsumo = useUpdateInsumo();
  const deleteInsumo = useDeleteInsumo();

  const createComposto = useCreateComposto();
  const updateComposto = useUpdateComposto();
  const deleteComposto = useDeleteComposto();

  const createAlimentacao = useCreateAlimentacao();
  const updateAlimentacao = useUpdateAlimentacao();
  const deleteAlimentacao = useDeleteAlimentacao();

  const createSanidade = useCreateSanidade();
  const updateSanidade = useUpdateSanidade();
  const deleteSanidade = useDeleteSanidade();

  const createPesagem = useCreatePesagem();
  const updatePesagem = useUpdatePesagem();
  const deletePesagem = useDeletePesagem();

  const createVenda = useCreateVenda();
  const updateVenda = useUpdateVenda();
  const deleteVenda = useDeleteVenda();

  const createCusto = useCreateCusto();
  const deleteCusto = useDeleteCusto();

  // Adaptar dados
  const porcos = porcosData.map(adaptPorco);
  const piquetes = piquetesData.map(adaptPiquete);
  const insumos = insumosData.map(adaptInsumo);
  const compostos = compostosData.map(adaptComposto);
  const registrosAlimentacao = alimentacaoData.map(adaptAlimentacao);
  const registrosSanitarios = sanidadeData.map(adaptSanidade);
  const registrosPeso = pesagemData.map(adaptPesagem);
  const vendas = vendasData.map(adaptVenda);
  const custos = custosData.map(adaptCusto);

  const loading = loadingPorcos || loadingPiquetes || loadingInsumos || loadingCompostos ||
    loadingAlimentacao || loadingSanidade || loadingPesagem || loadingVendas || loadingCustos;

  const getDashboardData = () => {
    const totalPorcos = porcos.filter(p => p.status === 'ativo').length;
    const totalPiquetes = piquetes.length;
    const totalVendas = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
    const mediaPeso = porcos
      .filter(p => p.status === 'ativo' && p.pesoAtual)
      .reduce((acc, p) => acc + (p.pesoAtual || 0), 0) / 
      porcos.filter(p => p.status === 'ativo' && p.pesoAtual).length || 0;

    return {
      totalPorcos,
      totalPiquetes,
      totalVendas,
      mediaPeso: Math.round(mediaPeso * 100) / 100,
    };
  };

  return {
    porcos,
    piquetes,
    insumos,
    compostos,
    registrosAlimentacao,
    registrosSanitarios,
    registrosPeso,
    vendas,
    custos,
    loading,
    getDashboardData,
    
    // Porcos
    criarPorco: async (data: any) => {
      const adapted = {
        ...data,
        piqueteId: parseInt(data.piqueteId),
        pesoInicial: toDecimalString(data.pesoInicial, 2),
        pesoAlvoAbate: toDecimalString(data.pesoAlvoAbate, 2),
        pesoAtual: toDecimalString(data.pesoAtual, 2),
        valorCompra: toDecimalString(data.valorCompra, 2),
        valorVenda: toDecimalString(data.valorVenda, 2),
      };
      return createPorco.mutateAsync(adapted);
    },
    atualizarPorco: async (id: string, data: any) => {
      const adapted = {
        ...data,
        piqueteId: data.piqueteId ? parseInt(data.piqueteId) : undefined,
        pesoInicial: toDecimalString(data.pesoInicial, 2),
        pesoAlvoAbate: toDecimalString(data.pesoAlvoAbate, 2),
        pesoAtual: toDecimalString(data.pesoAtual, 2),
        valorCompra: toDecimalString(data.valorCompra, 2),
        valorVenda: toDecimalString(data.valorVenda, 2),
      };
      return updatePorco.mutateAsync({ id: parseInt(id), data: adapted });
    },
    excluirPorco: async (id: string) => {
      return deletePorco.mutateAsync(parseInt(id));
    },

    // Piquetes
    criarPiquete: async (data: any) => {
      const adapted = {
        ...data,
        area: toDecimalString(data.area, 2),
      };
      return createPiquete.mutateAsync(adapted);
    },
    atualizarPiquete: async (id: string, data: any) => {
      const adapted = {
        ...data,
        area: toDecimalString(data.area, 2),
      };
      return updatePiquete.mutateAsync({ id: parseInt(id), data: adapted });
    },
    excluirPiquete: async (id: string) => {
      return deletePiquete.mutateAsync(parseInt(id));
    },

    // Insumos
    criarInsumo: async (data: any) => {
      const adapted = {
        ...data,
        valorCompra: toDecimalString(data.valorCompra, 2),
        quantidadeEstoque: toDecimalString(data.quantidadeEstoque, 2),
        estoqueMinimo: toDecimalString(data.estoqueMinimo, 2),
      };
      return createInsumo.mutateAsync(adapted);
    },
    atualizarInsumo: async (id: string, data: any) => {
      const adapted = {
        ...data,
        valorCompra: toDecimalString(data.valorCompra, 2),
        quantidadeEstoque: toDecimalString(data.quantidadeEstoque, 2),
        estoqueMinimo: toDecimalString(data.estoqueMinimo, 2),
      };
      return updateInsumo.mutateAsync({ id: parseInt(id), data: adapted });
    },
    excluirInsumo: async (id: string) => {
      return deleteInsumo.mutateAsync(parseInt(id));
    },

    // Compostos
    criarComposto: async (data: any) => {
      const adapted = {
        ...data,
        custoTotal: toDecimalString(data.custoTotal, 2),
        custoKg: toDecimalString(data.custoKg, 2),
        ingredientes: data.ingredientes.map((ing: any) => ({
          insumoId: parseInt(ing.insumoId),
          quantidade: parseFloat(ing.quantidade),
        })),
      };
      return createComposto.mutateAsync(adapted);
    },
    atualizarComposto: async (id: string, data: any) => {
      const adapted = {
        ...data,
        custoTotal: toDecimalString(data.custoTotal, 2),
        custoKg: toDecimalString(data.custoKg, 2),
        ingredientes: data.ingredientes?.map((ing: any) => ({
          insumoId: parseInt(ing.insumoId),
          quantidade: parseFloat(ing.quantidade),
        })),
      };
      return updateComposto.mutateAsync({ id: parseInt(id), data: adapted });
    },
    excluirComposto: async (id: string) => {
      return deleteComposto.mutateAsync(parseInt(id));
    },

    // Alimentação
    registrarAlimentacao: async (data: any) => {
      const adapted = {
        ...data,
        piqueteId: data.piqueteId ? parseInt(data.piqueteId) : null,
        porcoId: data.porcoId ? parseInt(data.porcoId) : null,
        insumoId: data.insumoId ? parseInt(data.insumoId) : null,
        compostoId: data.compostoId ? parseInt(data.compostoId) : null,
        quantidade: toDecimalString(data.quantidade, 2),
        custoTotal: toDecimalString(data.custoTotal, 2),
      };
      return createAlimentacao.mutateAsync(adapted);
    },
    excluirAlimentacao: async (id: string) => {
      return deleteAlimentacao.mutateAsync(parseInt(id));
    },

    // Sanidade
    registrarSanidade: async (data: any) => {
      const adapted = {
        ...data,
        porcoIds: data.porcoIds.map(Number),
        insumoId: parseInt(data.insumoId),
        quantidade: toDecimalString(data.quantidade, 2),
      };
      return createSanidade.mutateAsync(adapted);
    },
    excluirSanidade: async (id: string) => {
      return deleteSanidade.mutateAsync(parseInt(id));
    },

    // Pesagem
    registrarPeso: async (data: any) => {
      const adapted = {
        ...data,
        porcoId: parseInt(data.porcoId),
        peso: toDecimalString(data.peso, 2),
      };
      return createPesagem.mutateAsync(adapted);
    },
    excluirPesagem: async (id: string) => {
      return deletePesagem.mutateAsync(parseInt(id));
    },

    // Vendas
    registrarVenda: async (data: any) => {
      const adapted = {
        ...data,
        porcoIds: data.porcoIds.map(Number),
        valoresIndividuais: data.valoresIndividuais.map((v: any) => ({
          porcoId: parseInt(v.porcoId),
          valor: toDecimalString(v.valor, 2),
        })),
        peso: toDecimalString(data.peso, 2),
        valorTotal: toDecimalString(data.valorTotal, 2),
        comissaoPercentual: toDecimalString(data.comissaoPercentual, 2),
      };
      return createVenda.mutateAsync(adapted);
    },
    excluirVenda: async (id: string) => {
      return deleteVenda.mutateAsync(parseInt(id));
    },

    // Custos
    registrarCusto: async (data: any) => {
      const adapted = {
        ...data,
        valor: toDecimalString(data.valor, 2),
      };
      return createCusto.mutateAsync(adapted);
    },
    excluirCusto: async (id: string) => {
      return deleteCusto.mutateAsync(parseInt(id));
    },
    
    // Aliases para compatibilidade com componentes legados
    // Compostos
    criarCompostoAlimento: async (data: any) => {
      const adapted = {
        ...data,
        custoTotal: toDecimalString(data.custoTotal, 2),
        custoKg: toDecimalString(data.custoKg, 2),
        ingredientes: data.ingredientes.map((ing: any) => ({
          insumoId: parseInt(ing.insumoId),
          quantidade: parseFloat(ing.quantidade),
        })),
      };
      return createComposto.mutateAsync(adapted);
    },
    editarCompostoAlimento: async (id: string, data: any) => {
      const adapted = {
        ...data,
        custoTotal: toDecimalString(data.custoTotal, 2),
        custoKg: toDecimalString(data.custoKg, 2),
        ingredientes: data.ingredientes?.map((ing: any) => ({
          insumoId: parseInt(ing.insumoId),
          quantidade: parseFloat(ing.quantidade),
        })),
      };
      return updateComposto.mutateAsync({ id: parseInt(id), data: adapted });
    },
    deletarCompostoAlimento: async (id: string) => {
      return deleteComposto.mutateAsync(parseInt(id));
    },
    
    // Alimentação
    criarRegistroAlimentacao: async (data: any) => {
      const adapted = {
        ...data,
        piqueteId: data.piqueteId ? parseInt(data.piqueteId) : null,
        porcoId: data.porcoId ? parseInt(data.porcoId) : null,
        insumoId: data.insumoId ? parseInt(data.insumoId) : null,
        compostoId: data.compostoId ? parseInt(data.compostoId) : null,
        quantidade: toDecimalString(data.quantidade, 2),
        custoTotal: toDecimalString(data.custoTotal, 2),
      };
      return createAlimentacao.mutateAsync(adapted);
    },
    editarRegistroAlimentacao: async (id: string, data: any) => {
      const adapted = {
        ...data,
        piqueteId: data.piqueteId ? parseInt(data.piqueteId) : null,
        porcoId: data.porcoId ? parseInt(data.porcoId) : null,
        insumoId: data.insumoId ? parseInt(data.insumoId) : null,
        compostoId: data.compostoId ? parseInt(data.compostoId) : null,
        quantidade: toDecimalString(data.quantidade, 2),
        custoTotal: toDecimalString(data.custoTotal, 2),
      };
      return updateAlimentacao.mutateAsync({ id: parseInt(id), data: adapted });
    },
    deletarRegistroAlimentacao: async (id: string) => {
      return deleteAlimentacao.mutateAsync(parseInt(id));
    },
    
    // Sanidade
    criarRegistroSanitario: async (data: any) => {
      const adapted = {
        ...data,
        porcoIds: data.porcoIds.map(Number),
        insumoId: parseInt(data.insumoId),
        quantidade: toDecimalString(data.quantidade, 2),
      };
      return createSanidade.mutateAsync(adapted);
    },
    editarRegistroSanitario: async (id: string, data: any) => {
      const adapted = {
        ...data,
        porcoIds: data.porcoIds?.map(Number),
        insumoId: parseInt(data.insumoId),
        quantidade: toDecimalString(data.quantidade, 2),
      };
      return updateSanidade.mutateAsync({ id: parseInt(id), data: adapted });
    },
    deletarRegistroSanitario: async (id: string) => {
      return deleteSanidade.mutateAsync(parseInt(id));
    },
    
    // Pesagem
    criarRegistroPeso: async (data: any) => {
      const adapted = {
        ...data,
        porcoId: parseInt(data.porcoId),
        peso: toDecimalString(data.peso, 2),
      };
      return createPesagem.mutateAsync(adapted);
    },
    editarRegistroPeso: async (id: string, data: any) => {
      const adapted = {
        ...data,
        porcoId: parseInt(data.porcoId),
        peso: toDecimalString(data.peso, 2),
      };
      return updatePesagem.mutateAsync({ id: parseInt(id), data: adapted });
    },
    deletarRegistroPeso: async (id: string) => {
      return deletePesagem.mutateAsync(parseInt(id));
    },
    
    // Vendas
    criarVenda: async (data: any) => {
      const adapted = {
        ...data,
        porcoIds: data.porcoIds.map(Number),
        valoresIndividuais: data.valoresIndividuais.map((v: any) => ({
          porcoId: parseInt(v.porcoId),
          valor: toDecimalString(v.valor, 2),
        })),
        peso: toDecimalString(data.peso, 2),
        valorTotal: toDecimalString(data.valorTotal, 2),
        comissaoPercentual: toDecimalString(data.comissaoPercentual, 2),
      };
      return createVenda.mutateAsync(adapted);
    },
    editarVenda: async (id: string, data: any) => {
      const adapted = {
        ...data,
        porcoIds: data.porcoIds?.map(Number),
        valoresIndividuais: data.valoresIndividuais?.map((v: any) => ({
          porcoId: parseInt(v.porcoId),
          valor: toDecimalString(v.valor, 2),
        })),
        peso: toDecimalString(data.peso, 2),
        valorTotal: toDecimalString(data.valorTotal, 2),
        comissaoPercentual: toDecimalString(data.comissaoPercentual, 2),
      };
      return updateVenda.mutateAsync({ id: parseInt(id), data: adapted });
    },
    deletarVenda: async (id: string) => {
      return deleteVenda.mutateAsync(parseInt(id));
    },
  };
}
