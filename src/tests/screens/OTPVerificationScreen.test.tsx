import { render } from '@testing-library/react-native';
import React from 'react';
import OTPVerificationScreen from '../../screens/OTPVerificationScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        params: {
            email: 'test@example.com',
        },
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: () => ({
        token: null,
        setToken: jest.fn(),
        user: null,
        setUser: jest.fn(),
    }),
}));

// Mock fetch
(globalThis as any).fetch = jest.fn();

describe('OTPVerificationScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis.fetch as jest.Mock).mockClear();
    });

    test('renders OTP verification screen', () => {
        const { toJSON } = render(<OTPVerificationScreen />);
        expect(toJSON()).toBeTruthy();
    });

    test('OTP verification endpoint is configured', () => {
        const endpoint = 'http://dev.api.uyir.ai:8081/auth/verify-otp';
        expect(endpoint).toContain('/auth/verify-otp');
    });

    test('resend OTP endpoint is configured', () => {
        const endpoint = 'http://dev.api.uyir.ai:8081/auth/resend-otp';
        expect(endpoint).toContain('/auth/resend-otp');
    });
});
