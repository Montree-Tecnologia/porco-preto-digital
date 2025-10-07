import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface RegistroAlimentacao {
  id: number;
  data: string;
  piqueteId?: number;
  porcoId?: number;
  insumoId?: number;
  compostoId?: number;
  quantidade: string;
  custoTotal: string;
  usuarioId: number;
  createdAt?: string;
}

export interface CreateAlimentacaoData {
  data: string;
  piqueteId?: number;
  porcoId?: number;
  insumoId?: number;
  compostoId?: number;
  quantidade: number;
  custoTotal: number;
}

export function useAlimentacao() {
  return useQuery<RegistroAlimentacao[]>({
    queryKey: ["/api/alimentacao"],
  });
}

export function useCreateAlimentacao() {
  return useMutation({
    mutationFn: async (data: CreateAlimentacaoData) => {
      return apiRequest("/api/alimentacao", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alimentacao"] });
    },
  });
}

export function useUpdateAlimentacao() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateAlimentacaoData> }) => {
      return apiRequest(`/api/alimentacao/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alimentacao"] });
    },
  });
}

export function useDeleteAlimentacao() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/alimentacao/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alimentacao"] });
    },
  });
}
