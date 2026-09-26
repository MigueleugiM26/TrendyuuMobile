const API_URL = `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/authentication`;

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Credenciais inválidas");
  }

  return response.json();
}

export async function register(email: string, password: string) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Erro no registro");
  }

  return response.json();
}

export async function refreshToken(refresh: string) {
  const response = await fetch(`${API_URL}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) throw new Error("Erro ao atualizar token");

  return response.json();
}
