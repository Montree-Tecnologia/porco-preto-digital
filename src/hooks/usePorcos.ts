import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface Porco {
  id: number;
  nome?: string;
  dataNascimento: string;
  pesoInicial: string;
  pesoAlvoAbate: string;
  piqueteId: number;
  valorCompra: string;
  raca?: string;
  sexo?: 'M' | 'F';
  origem?: string;
  observacoes?: string;
  status: 'ativo' | 'vendido' | 'morto';
  usuarioId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePorcoData {
  nome?: string;
  dataNascimento: string;
  pesoInicial: number;
  pesoAlvoAbate: number;
  piqueteId: number;
  valorCompra: number;
  raca?: string;
  sexo?: 'M' | 'F';
  origem?: string;
  observacoes?: string;
  status?: 'ativo' | 'vendido' | 'morto';
}

export function usePorcos() {
  return useQuery<Porco[]>({
    queryKey: ["/api/porcos"],
  });
}

export function usePorco(id: number | string) {
  return useQuery<Porco>({
    queryKey: ["/api/porcos", id],
    enabled: !!id,
  });
}

export function useCreatePorco() {
  return useMutation({
    mutationFn: async (data: CreatePorcoData) => {
      return apiRequest("/api/porcos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
    },
  });
}

export function useUpdatePorco() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreatePorcoData> }) => {
      return apiRequest(`/api/porcos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/porcos", variables.id] });
    },
  });
}

export function useDeletePorco() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/porcos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/porcos"] });
    },
  });
}
