// Centralized API endpoints used across the app
// All services are now hosted on DigitalOcean with domain
// Using HTTP with port 8081 until HTTPS is configured on the server

// Main API (Visualizations, etc.)
export const API_BASE_URL = 'http://dev.api.uyir.ai:8081';

// Knowledge & Persona API (now unified with main API)
export const KNOWLEDGE_API_BASE_URL = 'http://dev.api.uyir.ai:8081';

// Helper to build main API URLs
export const buildUrl = (path: string) => {
    const trimmed = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${trimmed}`;
};

// Helper to build Knowledge API URLs
export const buildKnowledgeUrl = (path: string) => {
    const trimmed = path.startsWith('/') ? path : `/${path}`;
    return `${KNOWLEDGE_API_BASE_URL}${trimmed}`;
};

// Minimal, RN-friendly GET with optional bearer token
export const authGet = async (url: string, token?: string, timeoutMs = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, {
            method: 'GET',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                Accept: 'application/json',
                Connection: 'close',
            },
            signal: controller.signal,
        } as any);
    } finally {
        clearTimeout(id);
    }
};

// Multipart POST helper (used by Knowledge/Persona uploads)
export const authMultipartPost = async (
    url: string,
    formData: FormData,
    token?: string,
    timeoutMs = 60000
) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                Accept: 'application/json',
            },
            body: formData,
            signal: controller.signal,
        } as any);
    } finally {
        clearTimeout(id);
    }
};
