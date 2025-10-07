import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface CompostoAlimentar {
  id: number;
  nome: string;
  ingredientes: {
    insumoId: number;
    quantidade: number;
  }[];
  custoTotal: string;
  custoKg: string;
  usuarioId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompostoData {
  nome: string;
  ingredientes: {
    insumoId: number;
    quantidade: number;
  }[];
  custoTotal: number;
  custoKg: number;
}

export function useCompostos() {
  return useQuery<CompostoAlimentar[]>({
    queryKey: ["/api/compostos"],
  });
}

export function useComposto(id: number | string) {
  return useQuery<CompostoAlimentar>({
    queryKey: ["/api/compostos", id],
    enabled: !!id,
  });
}

export function useCreateComposto() {
  return useMutation({
    mutationFn: async (data: CreateCompostoData) => {
      return apiRequest("/api/compostos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compostos"] });
    },
  });
}

export function useUpdateComposto() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateCompostoData> }) => {
      return apiRequest(`/api/compostos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/compostos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compostos", variables.id] });
    },
  });
}

export function useDeleteComposto() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/compostos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compostos"] });
    },
  });
}
