const API_ROOT = import.meta.env.VITE_API_ROOT || ''

export async function api(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('reporescue:unauthorized'))
    const error = new Error(payload.message || 'Something went wrong. Please try again.')
    error.status = response.status
    throw error
  }
  return payload
}

export const profileFrom = (user) => ({
  username: user?.username || user?.name || user?.email?.split('@')[0] || 'Developer',
  email: user?.email || '',
})
