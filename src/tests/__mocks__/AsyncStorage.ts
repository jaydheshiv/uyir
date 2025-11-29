// Mock for @react-native-async-storage/async-storage

const mockAsyncStorage: Record<string, string> = {};

export default {
    setItem: jest.fn((key: string, value: string) => {
        return new Promise<void>((resolve) => {
            mockAsyncStorage[key] = value;
            resolve();
        });
    }),
    getItem: jest.fn((key: string) => {
        return new Promise<string | null>((resolve) => {
            resolve(mockAsyncStorage[key] || null);
        });
    }),
    removeItem: jest.fn((key: string) => {
        return new Promise<void>((resolve) => {
            delete mockAsyncStorage[key];
            resolve();
        });
    }),
    clear: jest.fn(() => {
        return new Promise<void>((resolve) => {
            Object.keys(mockAsyncStorage).forEach((key) => {
                delete mockAsyncStorage[key];
            });
            resolve();
        });
    }),
    getAllKeys: jest.fn(() => {
        return new Promise<string[]>((resolve) => {
            resolve(Object.keys(mockAsyncStorage));
        });
    }),
    multiGet: jest.fn((keys: string[]) => {
        return new Promise<[string, string | null][]>((resolve) => {
            const result = keys.map((key) => [key, mockAsyncStorage[key] || null] as [string, string | null]);
            resolve(result);
        });
    }),
    multiSet: jest.fn((keyValuePairs: [string, string][]) => {
        return new Promise<void>((resolve) => {
            keyValuePairs.forEach(([key, value]) => {
                mockAsyncStorage[key] = value;
            });
            resolve();
        });
    }),
    multiRemove: jest.fn((keys: string[]) => {
        return new Promise<void>((resolve) => {
            keys.forEach((key) => {
                delete mockAsyncStorage[key];
            });
            resolve();
        });
    }),
};
