import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface Piquete {
  id: number;
  nome: string;
  capacidadeMaxima: number;
  area?: string;
  tipo?: string;
  observacoes?: string;
  usuarioId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePiqueteData {
  nome: string;
  capacidadeMaxima: number;
  area?: number;
  tipo?: string;
  observacoes?: string;
}

export function usePiquetes() {
  return useQuery<Piquete[]>({
    queryKey: ["/api/piquetes"],
  });
}

export function usePiquete(id: number | string) {
  return useQuery<Piquete>({
    queryKey: ["/api/piquetes", id],
    enabled: !!id,
  });
}

export function useCreatePiquete() {
  return useMutation({
    mutationFn: async (data: CreatePiqueteData) => {
      return apiRequest("/api/piquetes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/piquetes"] });
    },
  });
}

export function useUpdatePiquete() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreatePiqueteData> }) => {
      return apiRequest(`/api/piquetes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/piquetes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/piquetes", variables.id] });
    },
  });
}

export function useDeletePiquete() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/piquetes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/piquetes"] });
    },
  });
}
