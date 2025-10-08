import { apiRequest } from "./queryClient";

// Auth
export const authApi = {
  login: (email: string, senha: string) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  register: (data: { nome: string; email: string; senha: string; fazenda: string }) =>
    apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest("/api/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: () =>
    apiRequest("/api/auth/me"),
};

// Porcos
export const porcosApi = {
  getAll: () => apiRequest("/api/porcos"),
  getById: (id: number) => apiRequest(`/api/porcos/${id}`),
  create: (data: any) => apiRequest("/api/porcos", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest(`/api/porcos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/porcos/${id}`, {
    method: "DELETE",
  }),
};

// Piquetes
export const piquetesApi = {
  getAll: () => apiRequest("/api/piquetes"),
  getById: (id: number) => apiRequest(`/api/piquetes/${id}`),
  create: (data: any) => apiRequest("/api/piquetes", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest(`/api/piquetes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/piquetes/${id}`, {
    method: "DELETE",
  }),
};

// Insumos
export const insumosApi = {
  getAll: () => apiRequest("/api/insumos"),
  getById: (id: number) => apiRequest(`/api/insumos/${id}`),
  create: (data: any) => apiRequest("/api/insumos", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest(`/api/insumos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/insumos/${id}`, {
    method: "DELETE",
  }),
};

// Compostos
export const compostosApi = {
  getAll: () => apiRequest("/api/compostos"),
  getById: (id: number) => apiRequest(`/api/compostos/${id}`),
  create: (data: any) => apiRequest("/api/compostos", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => apiRequest(`/api/compostos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/compostos/${id}`, {
    method: "DELETE",
  }),
};

// Alimentação
export const alimentacaoApi = {
  getAll: () => apiRequest("/api/alimentacao"),
  create: (data: any) => apiRequest("/api/alimentacao", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/alimentacao/${id}`, {
    method: "DELETE",
  }),
};

// Sanidade
export const sanidadeApi = {
  getAll: () => apiRequest("/api/sanidade"),
  create: (data: any) => apiRequest("/api/sanidade", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/sanidade/${id}`, {
    method: "DELETE",
  }),
};

// Pesagem
export const pesagemApi = {
  getAll: () => apiRequest("/api/pesagem"),
  create: (data: any) => apiRequest("/api/pesagem", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/pesagem/${id}`, {
    method: "DELETE",
  }),
};

// Vendas
export const vendasApi = {
  getAll: () => apiRequest("/api/vendas"),
  create: (data: any) => apiRequest("/api/vendas", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/vendas/${id}`, {
    method: "DELETE",
  }),
};

// Custos
export const custosApi = {
  getAll: () => apiRequest("/api/custos"),
  create: (data: any) => apiRequest("/api/custos", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest(`/api/custos/${id}`, {
    method: "DELETE",
  }),
};
