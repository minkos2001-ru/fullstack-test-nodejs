import { API_URL } from "@/config/api"

export default async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(
      data?.errors
        ? data?.errors.join(", ")
        : data?.message || "Ошибка запроса к серверу"
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
