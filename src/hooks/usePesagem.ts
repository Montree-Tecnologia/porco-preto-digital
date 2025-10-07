import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface RegistroPeso {
  id: number;
  porcoId: number;
  data: string;
  peso: string;
  observacoes?: string;
  usuarioId: number;
  createdAt?: string;
}

export interface CreatePesagemData {
  porcoId: number;
  data: string;
  peso: number;
  observacoes?: string;
}

export function usePesagem() {
  return useQuery<RegistroPeso[]>({
    queryKey: ["/api/pesagem"],
  });
}

export function useCreatePesagem() {
  return useMutation({
    mutationFn: async (data: CreatePesagemData) => {
      return apiRequest("/api/pesagem", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesagem"] });
    },
  });
}

export function useUpdatePesagem() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreatePesagemData> }) => {
      return apiRequest(`/api/pesagem/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesagem"] });
    },
  });
}

export function useDeletePesagem() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/pesagem/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesagem"] });
    },
  });
}
