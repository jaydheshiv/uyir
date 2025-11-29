import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import OTPVerificationScreenlogin from '../../screens/OTPVerificationScreenlogin';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        reset: jest.fn(),
    }),
    useRoute: () => ({
        name: 'OTPVerificationScreenlogin',
        key: 'otp-verification-login-key',
        params: {
            email: 'test@example.com',
            code: '1234',
        },
    }),
}));

// Mock Zustand stores
jest.mock('../../store/useAppStore', () => ({
    useAuth: () => ({
        setToken: jest.fn(),
        setUser: jest.fn(),
        isNewUser: false,
        markProfileComplete: jest.fn(),
    }),
    useAvatar: () => ({
        markAvatarCreated: jest.fn(),
    }),
    useAppStore: {
        getState: () => ({
            markProTermsAccepted: jest.fn(),
            markProfessionalCreated: jest.fn(),
            setProfessionalData: jest.fn(),
            markProfessionalNotCreated: jest.fn(),
        }),
    },
}));

describe('OTPVerificationScreenlogin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        globalThis.fetch = jest.fn();
    });

    it('renders correctly', () => {
        const { getByText } = render(<OTPVerificationScreenlogin />);

        expect(getByText('Enter Code')).toBeTruthy();
        expect(getByText(/4-Digit code/i)).toBeTruthy();
    });

    it('displays resend OTP option', () => {
        const { getByText } = render(<OTPVerificationScreenlogin />);

        expect(getByText(/Didn't get OTP/i)).toBeTruthy();
        expect(getByText(/Resend OTP/i)).toBeTruthy();
    });

    it('calls verify API with correct endpoint', async () => {
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: async () => ({
                    token: 'test-token',
                    user: { id: 1, email: 'test@example.com', avatar_id: 123 },
                }),
            })
        ) as jest.Mock;

        const { getByText } = render(<OTPVerificationScreenlogin />);

        fireEvent.press(getByText('Verify'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://dev.api.uyir.ai/auth/login/verify',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });
    });

    it('calls resend API with correct endpoint', async () => {
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: async () => ({ message: 'OTP resent' }),
            })
        ) as jest.Mock;

        const { getByText } = render(<OTPVerificationScreenlogin />);

        fireEvent.press(getByText(/Resend OTP/i));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://dev.api.uyir.ai/auth/login/resend',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('test@example.com'),
                })
            );
        });
    });

    it('handles successful login with token', async () => {
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: async () => ({
                    token: 'test-token',
                    user: { id: 1, email: 'test@example.com', avatar_id: 123 },
                }),
            })
        ) as jest.Mock;

        const { getByText } = render(<OTPVerificationScreenlogin />);

        fireEvent.press(getByText('Verify'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://dev.api.uyir.ai/auth/login/verify',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });
    });
});
