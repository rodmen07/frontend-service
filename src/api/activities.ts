const configuredUrl = (import.meta.env.VITE_ACTIVITIES_API_BASE_URL ?? '').trim()
export const ACTIVITIES_BASE_URL =
  configuredUrl.length > 0 ? configuredUrl : 'http://localhost:8083'

export interface Activity {
  id: string
  account_id: string | null
  contact_id: string | null
  activity_type: string
  subject: string
  notes: string | null
  due_at: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

async function request<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${ACTIVITIES_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(payload.message ?? `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export async function listActivities(token: string): Promise<Activity[]> {
  return request<Activity[]>(token, '/api/v1/activities')
}
