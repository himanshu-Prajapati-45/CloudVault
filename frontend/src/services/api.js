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

export const uploadFileApi = async (file, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');

        xhr.open('POST', `${API_URL}/files/upload`);

        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch {
                    resolve(JSON.parse(xhr.responseText));
                }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err.detail || 'Upload failed'));
                } catch {
                    reject(new Error('Upload failed'));
                }
            }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
    });
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

export const shareFileApi = async (fileId, expiresHours = 24, password = null) => {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
    };
    if (password) {
        options.body = JSON.stringify({ password });
    }
    const response = await fetch(`${API_URL}/files/${fileId}/share?expires_hours=${expiresHours}`, options);
    if (!response.ok) throw new Error('Failed to generate share link');
    return response.json();
};

export const revokeShareApi = async (fileId) => {
    const response = await fetch(`${API_URL}/files/${fileId}/share`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to revoke share link');
    return response.json();
};

export const changePasswordApi = async (currentPassword, newPassword) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to change password');
    }
    return response.json();
};

export const fetchMeApi = async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
};
