import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface Insumo {
  id: number;
  nome: string;
  categoria: 'vacina' | 'medicamento' | 'alimento';
  unidadeMedida: string;
  valorCompra: string;
  quantidadeEstoque: string;
  fornecedor?: string;
  dataValidade?: string;
  observacoes?: string;
  estoqueMinimo?: string;
  usuarioId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInsumoData {
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

export function useInsumos() {
  return useQuery<Insumo[]>({
    queryKey: ["/api/insumos"],
  });
}

export function useInsumo(id: number | string) {
  return useQuery<Insumo>({
    queryKey: ["/api/insumos", id],
    enabled: !!id,
  });
}

export function useCreateInsumo() {
  return useMutation({
    mutationFn: async (data: CreateInsumoData) => {
      return apiRequest("/api/insumos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insumos"] });
    },
  });
}

export function useUpdateInsumo() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateInsumoData> }) => {
      return apiRequest(`/api/insumos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/insumos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/insumos", variables.id] });
    },
  });
}

export function useDeleteInsumo() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/insumos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insumos"] });
    },
  });
}
