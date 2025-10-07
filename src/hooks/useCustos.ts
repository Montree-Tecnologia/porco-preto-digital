import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface Custo {
  id: number;
  tipo: 'comissionamento' | 'operacional' | 'administrativo' | 'outros';
  descricao: string;
  valor: string;
  data: string;
  observacoes?: string;
  usuarioId: number;
  createdAt?: string;
}

export interface CreateCustoData {
  tipo: 'comissionamento' | 'operacional' | 'administrativo' | 'outros';
  descricao: string;
  valor: number;
  data: string;
  observacoes?: string;
}

export function useCustos() {
  return useQuery<Custo[]>({
    queryKey: ["/api/custos"],
  });
}

export function useCusto(id: number | string) {
  return useQuery<Custo>({
    queryKey: ["/api/custos", id],
    enabled: !!id,
  });
}

export function useCreateCusto() {
  return useMutation({
    mutationFn: async (data: CreateCustoData) => {
      return apiRequest("/api/custos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custos"] });
    },
  });
}

export function useUpdateCusto() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateCustoData> }) => {
      return apiRequest(`/api/custos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/custos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/custos", variables.id] });
    },
  });
}

export function useDeleteCusto() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/custos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custos"] });
    },
  });
}
