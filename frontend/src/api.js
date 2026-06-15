const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('bietbot_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data.data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getMe: () => request('/auth/me'),

  chat: (message, sessionId) =>
    request('/chat', { method: 'POST', body: JSON.stringify({ message, sessionId }) }),

  getQuickReplies: () => request('/chat/quick-replies'),

  getCategories: (active) => request(`/categories${active ? '?active=true' : ''}`),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getFaqs: (params = '') => request(`/faqs${params}`),
  createFaq: (data) => request('/faqs', { method: 'POST', body: JSON.stringify(data) }),
  updateFaq: (id, data) => request(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFaq: (id) => request(`/faqs/${id}`, { method: 'DELETE' }),

  getContacts: () => request('/contacts'),
  createContact: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),

  getDates: () => request('/dates'),
  createDate: (data) => request('/dates', { method: 'POST', body: JSON.stringify(data) }),
  updateDate: (id, data) => request(`/dates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDate: (id) => request(`/dates/${id}`, { method: 'DELETE' }),

  getStats: () => request('/admin/stats'),
};

export default api;
