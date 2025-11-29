import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export const tokenStorage = {
    // Save token after login/OTP verification
    async saveToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
            console.log('Token saved successfully');
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    },

    // Get token for API requests
    async getToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            return token;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    // Remove token on logout
    async removeToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_DATA_KEY);
            console.log('Token removed successfully');
        } catch (error) {
            console.error('Error removing token:', error);
            throw error;
        }
    },

    // Save user data
    async saveUserData(userData: any): Promise<void> {
        try {
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
            console.log('User data saved successfully');
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    },

    // Get user data
    async getUserData(): Promise<any | null> {
        try {
            const userData = await AsyncStorage.getItem(USER_DATA_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            return !!token;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    },
};

// Helper function to get Authorization header
export const getAuthHeader = async (): Promise<{ Authorization: string } | {}> => {
    const token = await tokenStorage.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};
