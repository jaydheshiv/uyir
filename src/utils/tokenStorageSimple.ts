// Simple in-memory token storage (no persistence)
// Use this as a fallback if AsyncStorage has issues

let authToken: string | null = null;
let userData: any = null;

export const tokenStorage = {
    // Save token
    async saveToken(token: string): Promise<void> {
        authToken = token;
        console.log('Token saved (in-memory):', token);
    },

    // Get token
    async getToken(): Promise<string | null> {
        return authToken;
    },

    // Remove token
    async removeToken(): Promise<void> {
        authToken = null;
        userData = null;
        console.log('Token removed');
    },

    // Save user data
    async saveUserData(data: any): Promise<void> {
        userData = data;
        console.log('User data saved (in-memory)');
    },

    // Get user data
    async getUserData(): Promise<any | null> {
        return userData;
    },

    // Check if authenticated
    async isAuthenticated(): Promise<boolean> {
        return !!authToken;
    },
};

// Helper function to get Authorization header
export const getAuthHeader = async (): Promise<{ Authorization: string } | {}> => {
    const token = await tokenStorage.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};
