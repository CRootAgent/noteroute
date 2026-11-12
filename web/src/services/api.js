const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper fetch with JSON envelope handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `HTTP Error ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// 1. AUTHENTICATION (MongoDB Real)
export async function apiRegister(name, email, password) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

export async function apiLogin(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function apiGetMe(email) {
  return apiRequest(`/auth/me?email=${encodeURIComponent(email || '')}`);
}

// 2. WORKSPACES (CRUD)
export async function apiGetWorkspaces() {
  const res = await apiRequest('/workspaces');
  return res.data || [];
}

export async function apiCreateWorkspace(name, description) {
  const res = await apiRequest('/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name, description })
  });
  return res.data;
}

export async function apiDeleteWorkspace(id) {
  return apiRequest(`/workspaces/${id}`, {
    method: 'DELETE'
  });
}

// 3. DOCUMENTS EXPLORER & INGESTION
export async function apiGetDocuments(workspaceId) {
  const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : '';
  const res = await apiRequest(`/documents${query}`);
  return res.data || [];
}

export async function apiUploadDocument(workspaceId, file) {
  const formData = new FormData();
  formData.append('workspace_id', workspaceId);
  formData.append('document', file);

  const res = await apiRequest('/documents/upload', {
    method: 'POST',
    body: formData
  });
  return res.data;
}

export async function apiDeleteDocument(id) {
  return apiRequest(`/documents/${id}`, {
    method: 'DELETE'
  });
}

export function getDownloadUrl(documentId) {
  return `${BASE_URL}/documents/${documentId}/download`;
}

// 4. SMART MULTI-LLM ROUTER CHAT
export async function apiSendChat({ workspaceId, prompt, modelTarget = 'gemini', history = [] }) {
  const res = await apiRequest('/router/chat', {
    method: 'POST',
    body: JSON.stringify({
      workspace_id: workspaceId,
      prompt,
      model_target: modelTarget,
      history
    })
  });
  return res.data;
}

// 5. METRICS & HEALTH
export async function apiGetMetrics() {
  const res = await apiRequest('/router/metrics');
  return res.data || {};
}

export async function apiCheckHealth() {
  const res = await apiRequest('/health');
  return res.data || {};
}
