import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface RegistroSanitario {
  id: number;
  data: string;
  insumoId: number;
  quantidade: string;
  responsavel: string;
  observacoes?: string;
  proximaAplicacao?: string;
  usuarioId: number;
  createdAt?: string;
  registrosSanitariosPorcos?: {
    porco: {
      id: number;
      nome?: string;
    };
  }[];
}

export interface CreateSanidadeData {
  data: string;
  porcoIds: number[];
  insumoId: number;
  quantidade: number;
  responsavel: string;
  observacoes?: string;
  proximaAplicacao?: string;
}

export function useSanidade() {
  return useQuery<RegistroSanitario[]>({
    queryKey: ["/api/sanidade"],
  });
}

export function useCreateSanidade() {
  return useMutation({
    mutationFn: async (data: CreateSanidadeData) => {
      return apiRequest("/api/sanidade", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanidade"] });
    },
  });
}

export function useUpdateSanidade() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateSanidadeData> }) => {
      return apiRequest(`/api/sanidade/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanidade"] });
    },
  });
}

export function useDeleteSanidade() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/sanidade/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sanidade"] });
    },
  });
}
