import { useState, useEffect } from 'react';

// Types
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
  data: string;
  peso: number;
  valorTotal: number;
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

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  fazenda: string;
}

// Mock Data
const mockPorcos: Porco[] = [
  {
    id: '1',
    nome: 'Porco 001',
    dataNascimento: '2024-01-15',
    pesoInicial: 25,
    pesoAlvoAbate: 110,
    piqueteId: '1',
    valorCompra: 150.00,
    raca: 'Landrace',
    sexo: 'M',
    status: 'ativo',
    pesoAtual: 45,
  },
  {
    id: '2',
    nome: 'Porco 002',
    dataNascimento: '2024-01-20',
    pesoInicial: 23,
    pesoAlvoAbate: 105,
    piqueteId: '1',
    valorCompra: 140.00,
    raca: 'Yorkshire',
    sexo: 'F',
    status: 'ativo',
    pesoAtual: 42,
  },
  {
    id: '3',
    nome: 'Porco 003',
    dataNascimento: '2023-12-10',
    pesoInicial: 28,
    pesoAlvoAbate: 120,
    piqueteId: '2',
    valorCompra: 160.00,
    raca: 'Duroc',
    sexo: 'M',
    status: 'vendido',
    pesoAtual: 95,
    valorVenda: 850.00,
    dataVenda: '2024-03-15',
  }
];

const mockPiquetes: Piquete[] = [
  {
    id: '1',
    nome: 'Piquete A',
    capacidadeMaxima: 50,
    area: 500,
    tipo: 'Crescimento',
    ocupacao: 25,
  },
  {
    id: '2',
    nome: 'Piquete B',
    capacidadeMaxima: 30,
    area: 300,
    tipo: 'Engorda',
    ocupacao: 15,
  },
  {
    id: '3',
    nome: 'Piquete C',
    capacidadeMaxima: 40,
    area: 400,
    tipo: 'Maternidade',
    ocupacao: 8,
  }
];

const mockInsumos: Insumo[] = [
  {
    id: '1',
    nome: 'Ração Crescimento',
    categoria: 'alimento',
    unidadeMedida: 'kg',
    valorCompra: 2.50,
    quantidadeEstoque: 500,
    fornecedor: 'Nutricorp',
    estoqueMinimo: 100,
  },
  {
    id: '2',
    nome: 'Ração Engorda',
    categoria: 'alimento',
    unidadeMedida: 'kg',
    valorCompra: 2.80,
    quantidadeEstoque: 300,
    fornecedor: 'Nutricorp',
    estoqueMinimo: 100,
  },
  {
    id: '3',
    nome: 'Vacina Peste Suína',
    categoria: 'vacina',
    unidadeMedida: 'dose',
    valorCompra: 5.00,
    quantidadeEstoque: 200,
    fornecedor: 'Veterimed',
    dataValidade: '2025-06-30',
    estoqueMinimo: 50,
  }
];

// Custom Hook
export const useProPorcoData = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [porcos, setPorcos] = useState<Porco[]>(mockPorcos);
  const [piquetes, setPiquetes] = useState<Piquete[]>(mockPiquetes);
  const [insumos, setInsumos] = useState<Insumo[]>(mockInsumos);
  const [compostos, setCompostos] = useState<CompostoAlimento[]>([]);
  const [registrosAlimentacao, setRegistrosAlimentacao] = useState<RegistroAlimentacao[]>([]);
  const [registrosSanitarios, setRegistrosSanitarios] = useState<RegistroSanitario[]>([]);
  const [registrosPeso, setRegistrosPeso] = useState<RegistroPeso[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [custos, setCustos] = useState<Custo[]>([]);
  const [loading, setLoading] = useState(false);

  // Auth functions
  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@prorporco.com' && senha === '123456') {
      const user: Usuario = {
        id: '1',
        nome: 'João Silva',
        email: 'admin@prorporco.com',
        fazenda: 'Fazenda São Pedro'
      };
      setUsuario(user);
      localStorage.setItem('prorporco_user', JSON.stringify(user));
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('prorporco_user');
  };

  const checkAuth = () => {
    const savedUser = localStorage.getItem('prorporco_user');
    if (savedUser) {
      setUsuario(JSON.parse(savedUser));
    }
    setAuthInitialized(true);
  };

  // CRUD Operations for Porcos
  const criarPorco = async (porco: Omit<Porco, 'id'>): Promise<Porco> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const novoPorco: Porco = {
      ...porco,
      id: Date.now().toString(),
    };
    
    setPorcos(prev => [...prev, novoPorco]);
    setLoading(false);
    return novoPorco;
  };

  const atualizarPorco = async (id: string, porco: Partial<Porco>): Promise<Porco> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const porcoAtualizado = { ...porcos.find(p => p.id === id)!, ...porco };
    setPorcos(prev => prev.map(p => p.id === id ? porcoAtualizado : p));
    setLoading(false);
    return porcoAtualizado;
  };

  const excluirPorco = async (id: string): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setPorcos(prev => prev.filter(p => p.id !== id));
    setLoading(false);
  };

  // CRUD Operations for Piquetes
  const criarPiquete = async (piquete: Omit<Piquete, 'id' | 'ocupacao'>): Promise<Piquete> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const novoPiquete: Piquete = {
      ...piquete,
      id: Date.now().toString(),
      ocupacao: 0,
    };
    
    setPiquetes(prev => [...prev, novoPiquete]);
    setLoading(false);
    return novoPiquete;
  };

  const atualizarPiquete = async (id: string, piquete: Partial<Piquete>): Promise<Piquete> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const piqueteAtualizado = { ...piquetes.find(p => p.id === id)!, ...piquete };
    setPiquetes(prev => prev.map(p => p.id === id ? piqueteAtualizado : p));
    setLoading(false);
    return piqueteAtualizado;
  };

  const excluirPiquete = async (id: string): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setPiquetes(prev => prev.filter(p => p.id !== id));
    setLoading(false);
  };

  // CRUD Operations for Insumos
  const criarInsumo = async (insumo: Omit<Insumo, 'id'>): Promise<Insumo> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const novoInsumo: Insumo = {
      ...insumo,
      id: Date.now().toString(),
    };
    
    setInsumos(prev => [...prev, novoInsumo]);
    setLoading(false);
    return novoInsumo;
  };

  const atualizarInsumo = async (id: string, insumo: Partial<Insumo>): Promise<Insumo> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const insumoAtualizado = { ...insumos.find(i => i.id === id)!, ...insumo };
    setInsumos(prev => prev.map(i => i.id === id ? insumoAtualizado : i));
    setLoading(false);
    return insumoAtualizado;
  };

  const excluirInsumo = async (id: string): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setInsumos(prev => prev.filter(i => i.id !== id));
    setLoading(false);
  };

  // CRUD Operations for Compostos Alimentares
  const criarCompostoAlimento = (composto: Omit<CompostoAlimento, 'id'>): CompostoAlimento => {
    const novoComposto: CompostoAlimento = {
      ...composto,
      id: Date.now().toString(),
    };
    
    setCompostos(prev => [...prev, novoComposto]);
    return novoComposto;
  };

  const editarCompostoAlimento = (id: string, composto: Partial<CompostoAlimento>): CompostoAlimento => {
    const compostoAtualizado = { ...compostos.find(c => c.id === id)!, ...composto };
    setCompostos(prev => prev.map(c => c.id === id ? compostoAtualizado : c));
    return compostoAtualizado;
  };

  const deletarCompostoAlimento = (id: string): void => {
    setCompostos(prev => prev.filter(c => c.id !== id));
  };

  // CRUD Operations for Registros de Alimentação
  const criarRegistroAlimentacao = (registro: Omit<RegistroAlimentacao, 'id'>): RegistroAlimentacao => {
    const novoRegistro: RegistroAlimentacao = {
      ...registro,
      id: Date.now().toString(),
    };
    
    setRegistrosAlimentacao(prev => [...prev, novoRegistro]);
    return novoRegistro;
  };

  const editarRegistroAlimentacao = (id: string, registro: Partial<RegistroAlimentacao>): RegistroAlimentacao => {
    const registroAtualizado = { ...registrosAlimentacao.find(r => r.id === id)!, ...registro };
    setRegistrosAlimentacao(prev => prev.map(r => r.id === id ? registroAtualizado : r));
    return registroAtualizado;
  };

  const deletarRegistroAlimentacao = (id: string): void => {
    setRegistrosAlimentacao(prev => prev.filter(r => r.id !== id));
  };

  // Statistics and Reports
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

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    // Auth
    usuario,
    authInitialized,
    login,
    logout,
    
    // Data
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
    
    // CRUD Operations
    criarPorco,
    atualizarPorco,
    excluirPorco,
    criarPiquete,
    atualizarPiquete,
    excluirPiquete,
    criarInsumo,
    atualizarInsumo,
    excluirInsumo,
    criarCompostoAlimento,
    editarCompostoAlimento,
    deletarCompostoAlimento,
    criarRegistroAlimentacao,
    editarRegistroAlimentacao,
    deletarRegistroAlimentacao,
    
    // Reports
    getDashboardData,
  };
};