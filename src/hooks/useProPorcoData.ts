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
  },
  {
    id: '4',
    nome: 'Milho Moído',
    categoria: 'alimento',
    unidadeMedida: 'kg',
    valorCompra: 1.80,
    quantidadeEstoque: 800,
    fornecedor: 'Grãos Sul',
    estoqueMinimo: 200,
  },
  {
    id: '5',
    nome: 'Farelo de Soja',
    categoria: 'alimento',
    unidadeMedida: 'kg',
    valorCompra: 3.20,
    quantidadeEstoque: 600,
    fornecedor: 'Grãos Sul',
    estoqueMinimo: 150,
  },
  {
    id: '6',
    nome: 'Premix Vitamínico',
    categoria: 'alimento',
    unidadeMedida: 'kg',
    valorCompra: 15.00,
    quantidadeEstoque: 50,
    fornecedor: 'Nutri Plus',
    estoqueMinimo: 10,
  },
  {
    id: '7',
    nome: 'Amoxicilina 150mg/ml',
    categoria: 'medicamento',
    unidadeMedida: 'ml',
    valorCompra: 12.50,
    quantidadeEstoque: 150,
    fornecedor: 'Veterimed',
    dataValidade: '2025-08-31',
    estoqueMinimo: 30,
  },
  {
    id: '8',
    nome: 'Ivermectina 1%',
    categoria: 'medicamento',
    unidadeMedida: 'ml',
    valorCompra: 8.00,
    quantidadeEstoque: 200,
    fornecedor: 'Veterimed',
    dataValidade: '2025-10-15',
    estoqueMinimo: 40,
  },
  {
    id: '9',
    nome: 'Meloxicam 2mg/ml',
    categoria: 'medicamento',
    unidadeMedida: 'ml',
    valorCompra: 15.00,
    quantidadeEstoque: 100,
    fornecedor: 'Veterimed',
    dataValidade: '2025-07-20',
    estoqueMinimo: 25,
  },
  {
    id: '10',
    nome: 'Vacina Circovirose',
    categoria: 'vacina',
    unidadeMedida: 'dose',
    valorCompra: 6.50,
    quantidadeEstoque: 180,
    fornecedor: 'Veterimed',
    dataValidade: '2025-09-30',
    estoqueMinimo: 50,
  }
];

const mockCompostos: CompostoAlimento[] = [
  {
    id: '1',
    nome: 'Ração Crescimento Premium',
    ingredientes: [
      { insumoId: '4', quantidade: 40 }, // Milho Moído 40%
      { insumoId: '5', quantidade: 30 }, // Farelo de Soja 30%
      { insumoId: '1', quantidade: 25 }, // Ração Crescimento 25%
      { insumoId: '6', quantidade: 5 },  // Premix Vitamínico 5%
    ],
    custoTotal: 250.00,
    custoKg: 2.50,
  },
  {
    id: '2',
    nome: 'Ração Engorda Especial',
    ingredientes: [
      { insumoId: '4', quantidade: 45 }, // Milho Moído 45%
      { insumoId: '5', quantidade: 25 }, // Farelo de Soja 25%
      { insumoId: '2', quantidade: 26 }, // Ração Engorda 26%
      { insumoId: '6', quantidade: 4 },  // Premix Vitamínico 4%
    ],
    custoTotal: 280.00,
    custoKg: 2.80,
  },
  {
    id: '3',
    nome: 'Mix Maternidade',
    ingredientes: [
      { insumoId: '5', quantidade: 35 }, // Farelo de Soja 35%
      { insumoId: '4', quantidade: 35 }, // Milho Moído 35%
      { insumoId: '1', quantidade: 20 }, // Ração Crescimento 20%
      { insumoId: '6', quantidade: 10 }, // Premix Vitamínico 10%
    ],
    custoTotal: 320.00,
    custoKg: 3.20,
  }
];

const mockRegistrosAlimentacao: RegistroAlimentacao[] = [
  {
    id: '1',
    data: '2024-10-28',
    piqueteId: '1',
    compostoId: '1',
    quantidade: 50,
    custoTotal: 125.00,
  },
  {
    id: '2',
    data: '2024-10-27',
    piqueteId: '2',
    compostoId: '2',
    quantidade: 35,
    custoTotal: 98.00,
  },
  {
    id: '3',
    data: '2024-10-27',
    piqueteId: '1',
    insumoId: '1',
    quantidade: 30,
    custoTotal: 75.00,
  },
  {
    id: '4',
    data: '2024-10-26',
    piqueteId: '3',
    compostoId: '3',
    quantidade: 25,
    custoTotal: 80.00,
  },
  {
    id: '5',
    data: '2024-10-26',
    piqueteId: '1',
    compostoId: '1',
    quantidade: 48,
    custoTotal: 120.00,
  },
  {
    id: '6',
    data: '2024-10-25',
    piqueteId: '2',
    insumoId: '2',
    quantidade: 40,
    custoTotal: 112.00,
  },
  {
    id: '7',
    data: '2024-10-25',
    piqueteId: '1',
    compostoId: '1',
    quantidade: 52,
    custoTotal: 130.00,
  },
  {
    id: '8',
    data: '2024-10-24',
    piqueteId: '3',
    compostoId: '3',
    quantidade: 28,
    custoTotal: 89.60,
  }
];

const mockRegistrosSanitarios: RegistroSanitario[] = [
  {
    id: '1',
    data: '2024-10-25',
    porcoIds: ['1', '2', '3'],
    insumoId: '3',
    quantidade: 5.0,
    responsavel: 'Dr. Carlos Mendes',
    observacoes: 'Vacinação de rotina - todos os animais responderam bem',
    proximaAplicacao: '2025-01-25'
  },
  {
    id: '2',
    data: '2024-10-20',
    porcoIds: ['1'],
    insumoId: '3',
    quantidade: 2.0,
    responsavel: 'Maria Silva',
    observacoes: 'Reforço de vacina',
  },
  {
    id: '3',
    data: '2024-10-18',
    porcoIds: ['4', '5'],
    insumoId: '3',
    quantidade: 4.0,
    responsavel: 'Dr. Carlos Mendes',
    proximaAplicacao: '2025-01-18'
  },
  {
    id: '4',
    data: '2024-10-15',
    porcoIds: ['2', '3', '4', '5', '6'],
    insumoId: '3',
    quantidade: 10.0,
    responsavel: 'Dr. Carlos Mendes',
    observacoes: 'Campanha de vacinação preventiva',
    proximaAplicacao: '2025-01-15'
  },
  {
    id: '5',
    data: '2024-10-10',
    porcoIds: ['1', '2'],
    insumoId: '3',
    quantidade: 3.0,
    responsavel: 'Maria Silva',
    observacoes: 'Aplicação emergencial',
  },
  {
    id: '6',
    data: '2024-10-22',
    porcoIds: ['1'],
    insumoId: '7',
    quantidade: 5.0,
    responsavel: 'Dr. Carlos Mendes',
    observacoes: 'Tratamento de infecção respiratória - 3 dias',
    proximaAplicacao: '2024-10-25'
  },
  {
    id: '7',
    data: '2024-10-19',
    porcoIds: ['2', '3'],
    insumoId: '8',
    quantidade: 2.0,
    responsavel: 'Maria Silva',
    observacoes: 'Vermifugação de rotina',
    proximaAplicacao: '2025-01-19'
  },
  {
    id: '8',
    data: '2024-10-16',
    porcoIds: ['1', '2', '3'],
    insumoId: '9',
    quantidade: 3.0,
    responsavel: 'Dr. Carlos Mendes',
    observacoes: 'Anti-inflamatório pós-procedimento',
  },
  {
    id: '9',
    data: '2024-10-12',
    porcoIds: ['1', '2'],
    insumoId: '10',
    quantidade: 2.0,
    responsavel: 'Maria Silva',
    observacoes: 'Vacinação contra circovirose',
    proximaAplicacao: '2025-01-12'
  }
];

// Custom Hook
export const useProPorcoData = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [porcos, setPorcos] = useState<Porco[]>(mockPorcos);
  const [piquetes, setPiquetes] = useState<Piquete[]>(mockPiquetes);
  const [insumos, setInsumos] = useState<Insumo[]>(mockInsumos);
  const [compostos, setCompostos] = useState<CompostoAlimento[]>(mockCompostos);
  const [registrosAlimentacao, setRegistrosAlimentacao] = useState<RegistroAlimentacao[]>(mockRegistrosAlimentacao);
  const [registrosSanitarios, setRegistrosSanitarios] = useState<RegistroSanitario[]>(mockRegistrosSanitarios);
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

  // CRUD Operations for Registros Sanitários
  const criarRegistroSanitario = (registro: Omit<RegistroSanitario, 'id'>): RegistroSanitario => {
    const novoRegistro: RegistroSanitario = {
      ...registro,
      id: Date.now().toString(),
    };
    
    setRegistrosSanitarios(prev => [...prev, novoRegistro]);
    return novoRegistro;
  };

  const editarRegistroSanitario = (id: string, registro: Partial<RegistroSanitario>): RegistroSanitario => {
    const registroAtualizado = { ...registrosSanitarios.find(r => r.id === id)!, ...registro };
    setRegistrosSanitarios(prev => prev.map(r => r.id === id ? registroAtualizado : r));
    return registroAtualizado;
  };

  const deletarRegistroSanitario = (id: string): void => {
    setRegistrosSanitarios(prev => prev.filter(r => r.id !== id));
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
    
    // CRUD Operations - Porcos
    criarPorco,
    atualizarPorco,
    excluirPorco,
    
    // CRUD Operations - Piquetes
    criarPiquete,
    atualizarPiquete,
    excluirPiquete,
    
    // CRUD Operations - Insumos
    criarInsumo,
    atualizarInsumo,
    excluirInsumo,
    
    // CRUD Operations - Compostos
    criarCompostoAlimento,
    editarCompostoAlimento,
    deletarCompostoAlimento,
    
    // CRUD Operations - Alimentação
    criarRegistroAlimentacao,
    editarRegistroAlimentacao,
    deletarRegistroAlimentacao,
    
    // CRUD Operations - Sanidade
    criarRegistroSanitario,
    editarRegistroSanitario,
    deletarRegistroSanitario,
    
    // Reports
    getDashboardData,
  };
};