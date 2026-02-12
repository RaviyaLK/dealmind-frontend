import api from './client'

// ── Auth ──
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  me: () => api.get('/api/auth/me'),
}

// ── Deals ──
export const dealsAPI = {
  list: (params) => api.get('/api/deals/', { params }),
  get: (id) => api.get(`/api/deals/${id}`),
  create: (data) => api.post('/api/deals/', data),
  update: (id, data) => api.patch(`/api/deals/${id}`, data),
  delete: (id) => api.delete(`/api/deals/${id}`),
  getRequirements: (id) => api.get(`/api/deals/${id}/requirements`),
  getAnalysis: (id) => api.get(`/api/deals/${id}/analysis`),
  getAlerts: (id) => api.get(`/api/deals/${id}/alerts`),
  getDocuments: (id) => api.get(`/api/deals/${id}/documents`),
}

// ── Employees ──
export const employeesAPI = {
  list: (params) => api.get('/api/employees/', { params }),
  create: (data) => api.post('/api/employees/', data),
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/employees/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  match: (dealId) => api.get(`/api/employees/match/${dealId}`),
  delete: (id) => api.delete(`/api/employees/${id}`),
}

// ── Assignments ──
export const assignmentsAPI = {
  list: (dealId) => api.get(`/api/deals/${dealId}/assignments`),
  assign: (dealId, data) => api.post(`/api/deals/${dealId}/assignments`, data),
  autoAssign: (dealId, maxEmployees = 5) =>
    api.post(`/api/deals/${dealId}/assignments/auto`, { max_employees: maxEmployees }),
  update: (dealId, assignmentId, data) =>
    api.patch(`/api/deals/${dealId}/assignments/${assignmentId}`, data),
  remove: (dealId, assignmentId) =>
    api.delete(`/api/deals/${dealId}/assignments/${assignmentId}`),
  availableEmployees: (dealId) => api.get(`/api/deals/${dealId}/available-employees`),
}

// ── Documents ──
export const documentsAPI = {
  list: (params) => api.get('/api/documents/', { params }),
  get: (id) => api.get(`/api/documents/${id}`),
  upload: (file, dealId, category) => {
    const form = new FormData()
    form.append('file', file)
    if (dealId) form.append('deal_id', dealId)
    if (category) form.append('doc_category', category)
    return api.post('/api/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  process: (id) => api.post(`/api/documents/${id}/process`),
  delete: (id) => api.delete(`/api/documents/${id}`),
  createFromText: (dealId, category, title, textContent) => {
    const form = new FormData()
    form.append('deal_id', dealId)
    form.append('doc_category', category)
    form.append('title', title)
    form.append('text_content', textContent)
    return api.post('/api/documents/create-from-text', form)
  },
}

// ── Alerts ──
export const alertsAPI = {
  list: (params) => api.get('/api/alerts/', { params }),
  get: (id) => api.get(`/api/alerts/${id}`),
  update: (id, data) => api.patch(`/api/alerts/${id}`, data),
  toggleAction: (alertId, actionId) =>
    api.patch(`/api/alerts/${alertId}/actions/${actionId}`),
  summary: () => api.get('/api/alerts/summary'),
  clearForDeal: (dealId) => api.delete(`/api/alerts/deal/${dealId}`),
}

// ── Proposals ──
export const proposalsAPI = {
  list: (params) => api.get('/api/proposals/', { params }),
  get: (id) => api.get(`/api/proposals/${id}`),
  create: (data) => api.post('/api/proposals/', data),
  review: (id, data) => api.patch(`/api/proposals/${id}/review`, data),
  export: (id, format) =>
    api.post(`/api/proposals/${id}/export`, { format }),
  exportDocx: (id, templateId = 'modern') =>
    api.get(`/api/proposals/${id}/export/docx`, {
      params: { template_id: templateId },
      responseType: 'blob',
    }),
  templates: () => api.get('/api/proposals/templates'),
}

// ── Agents ──
export const agentsAPI = {
  run: (dealId, flowType, documentId = null) => {
    const payload = { deal_id: dealId, flow_type: flowType }
    if (documentId) payload.document_id = documentId
    return api.post('/api/agents/run', payload)
  },
  status: (taskId) => api.get(`/api/agents/status/${taskId}`),
}

// ── RAG ──
export const ragAPI = {
  stats: () => api.get('/api/rag/stats'),
  query: (query, collection, nResults) =>
    api.post('/api/rag/query', { query, collection, n_results: nResults }),
}

// ── Integrations (Google Gmail + Calendar) ──
export const integrationsAPI = {
  googleAuthUrl: () => api.get('/api/integrations/google/auth'),
  googleStatus: () => api.get('/api/integrations/google/status'),
  googleDisconnect: () => api.delete('/api/integrations/google/disconnect'),
  getEmails: (params) => api.get('/api/integrations/google/emails', { params }),
  sendEmail: (data) => api.post('/api/integrations/google/send-email', data),
  getCalendar: (params) => api.get('/api/integrations/google/calendar', { params }),
}

// ── WebSocket ──
const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws')

export function connectAgentWS(taskId, onMessage, onClose) {
  const ws = new WebSocket(`${WS_BASE}/ws/agent/${taskId}`)
  ws.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data))
    } catch (e) {
      console.warn('WS parse error:', e)
    }
  }
  ws.onclose = onClose || (() => {})
  ws.onerror = (err) => console.error('WebSocket error:', err)
  return ws
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export { API_BASE_URL }
