import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const res = await fetch(url, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Não autorizado");
          }
          const error = await res.json().catch(() => ({ error: "Erro desconhecido" }));
          throw new Error(error.error || `Erro: ${res.status}`);
        }

        return res.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Não autorizado");
    }
    const error = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro: ${res.status}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
