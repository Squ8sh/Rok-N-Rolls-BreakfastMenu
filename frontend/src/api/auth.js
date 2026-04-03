const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_STORAGE_KEY = 'rok_n_rolls_auth_token'

function getErrorMessage(payload, fallbackMessage) {
  if (!payload || typeof payload !== 'object') {
    return fallbackMessage
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if (payload.errors && typeof payload.errors === 'object') {
    const firstErrorList = Object.values(payload.errors)[0]
    const firstError = Array.isArray(firstErrorList) ? firstErrorList[0] : null

    if (typeof firstError === 'string' && firstError.trim()) {
      return firstError
    }
  }

  return fallbackMessage
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {
    Accept: 'application/json',
  }

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, `Ошибка запроса: статус ${response.status}`))
  }

  return payload
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || ''
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export async function registerUser({ name, email, password, passwordConfirmation }) {
  return request('/auth/register', {
    method: 'POST',
    body: {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    },
  })
}

export async function loginUser({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  })
}

export async function getCurrentUser(token) {
  return request('/auth/me', {
    token,
  })
}

export async function logoutUser(token) {
  return request('/auth/logout', {
    method: 'POST',
    token,
  })
}
