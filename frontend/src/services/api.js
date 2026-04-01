const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

export const loginApi = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
};

export const registerApi = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Registration failed');
    }
    return response.json();
};

export const googleAuthApi = async (credential) => {
    const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Google Login failed');
    }
    return response.json();
};

export const fetchFilesApi = async () => {
    const response = await fetch(`${API_URL}/files/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
};

export const fetchTrashedFilesApi = async () => {
    const response = await fetch(`${API_URL}/files/trash`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch trash');
    return response.json();
};

export const uploadFileApi = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/files/upload`, {
        method: 'POST',
        headers: {
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
};

export const deleteFileApi = async (fileId) => {
    const response = await fetch(`${API_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Delete failed');
    return response.json();
};

export const permanentDeleteFileApi = async (fileId) => {
    const response = await fetch(`${API_URL}/files/${fileId}/permanent`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Permanent delete failed');
    return response.json();
};

export const restoreFileApi = async (fileId) => {
    const response = await fetch(`${API_URL}/files/${fileId}/restore`, {
        method: 'POST',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Restore failed');
    return response.json();
};

export const searchFilesApi = async (query) => {
    const response = await fetch(`${API_URL}/files/search?q=${encodeURIComponent(query)}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
};

export const fetchStorageStatsApi = async () => {
    const response = await fetch(`${API_URL}/files/storage-stats`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch storage stats');
    return response.json();
};

export const shareFileApi = async (fileId, expiresHours = 24) => {
    const response = await fetch(`${API_URL}/files/${fileId}/share?expires_hours=${expiresHours}`, {
        method: 'POST',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to generate share link');
    return response.json();
};
