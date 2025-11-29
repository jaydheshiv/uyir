import { tokenStorage } from './tokenStorage';

// Base URL configuration - Using HTTP with port 8081 until HTTPS is configured
const getBaseUrl = (): string => {
    return 'http://dev.api.uyir.ai:8081';
};

// Generic API call function
export const apiCall = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    requiresAuth: boolean = true,
    isMultipart: boolean = false
): Promise<any> => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const headers: any = {
        'accept': 'application/json',
    };

    // Add Content-Type for JSON requests (not for multipart)
    if (!isMultipart && body) {
        headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if required
    if (requiresAuth) {
        const token = await tokenStorage.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            throw new Error('No authentication token found');
        }
    }

    const options: RequestInit = {
        method,
        headers,
    };

    // Add body for POST/PUT requests
    if (body) {
        options.body = isMultipart ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.detail || data.message || 'API request failed',
                data,
            };
        }

        return data;
    } catch (error: any) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
};

// Specific API functions
export const authAPI = {
    login: (credentials: { email?: string; mobile?: string }) =>
        apiCall('/auth/login', 'POST', credentials, false),

    verifyOTP: (data: { email?: string; mobile?: string; otp: string }) =>
        apiCall('/auth/login/verify', 'POST', data, false),

    logout: async () => {
        await tokenStorage.removeToken();
    },
};

export const creatorAPI = {
    createProfile: (profileData: { display_name: string; bio?: string }) =>
        apiCall('/subscriptions/create-creator', 'POST', profileData),

    uploadAvatar: async (imageFile: any) => {
        const formData = new FormData();
        formData.append('file', imageFile);
        return apiCall('/api/avatar/upload', 'POST', formData, true, true);
    },
};

export const subscriptionAPI = {
    // Add subscription related endpoints here
};

export default {
    authAPI,
    creatorAPI,
    subscriptionAPI,
    apiCall,
};
