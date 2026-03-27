const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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

export function createOrder(token, orderData) {
  return request('/orders', {
    method: 'POST',
    token,
    body: orderData,
  })
}

export function getOrders(token) {
  return request('/orders', {
    token,
  })
}
