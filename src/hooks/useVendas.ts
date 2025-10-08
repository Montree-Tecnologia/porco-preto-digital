import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface Venda {
  id: number;
  data: string;
  valorTotal: string;
  comissaoPercentual: string;
  comprador: string;
  observacoes?: string;
  usuarioId: number;
  createdAt?: string;
  vendasPorcos?: {
    porco: {
      id: number;
      nome?: string;
    };
    valorIndividual: string;
  }[];
}

export interface CreateVendaData {
  data: string;
  peso: number;
  porcos: {
    porcoId: number;
    valorIndividual: number;
  }[];
  valorTotal: number;
  comissaoPercentual: number;
  comprador: string;
  observacoes?: string;
}

export function useVendas() {
  return useQuery<Venda[]>({
    queryKey: ["/api/vendas"],
  });
}

export function useVenda(id: number | string) {
  return useQuery<Venda>({
    queryKey: ["/api/vendas", id],
    enabled: !!id,
  });
}

export function useCreateVenda() {
  return useMutation({
    mutationFn: async (data: CreateVendaData) => {
      return apiRequest("/api/vendas", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
    },
  });
}

export function useUpdateVenda() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateVendaData> }) => {
      return apiRequest(`/api/vendas/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendas", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
    },
  });
}

export function useDeleteVenda() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/vendas/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
    },
  });
}
