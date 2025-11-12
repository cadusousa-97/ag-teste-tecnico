const BASE_URL = "http://localhost:3001/api";

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error: any) {
    if (error.success === false) {
      throw error;
    }
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw {
        success: false,
        error: "Servidor indisponível. Tente novamente mais tarde.",
      };
    }
    throw error;
  }
}

export const fetcher = (endpoint: string) =>
  apiFetch(endpoint, { method: "GET" });

export const api = {
  post: (endpoint: string, body: any, options?: RequestInit) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: (endpoint: string, body: any, options?: RequestInit) =>
    apiFetch(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiFetch(endpoint, { ...options, method: "DELETE" }),
};
