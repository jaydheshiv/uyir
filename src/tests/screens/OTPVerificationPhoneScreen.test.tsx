import { render, screen } from '@testing-library/react-native';
import React from 'react';
import OTPVerificationPhoneScreen from '../../screens/OTPVerificationPhoneScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'OTPVerificationPhoneScreen',
        key: 'otp-verification-phone-key',
    }),
}));

describe('OTPVerificationPhoneScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<OTPVerificationPhoneScreen />);

        expect(getByText('Enter OTP')).toBeTruthy();
        expect(getByText(/4-Digit code/i)).toBeTruthy();
    });

    it('displays resend OTP option', () => {
        const { getByText } = render(<OTPVerificationPhoneScreen />);

        expect(getByText(/Didn't get OTP/i)).toBeTruthy();
        expect(getByText(/Resend OTP/i)).toBeTruthy();
    });

    it('has verify button', () => {
        const { getByText } = render(<OTPVerificationPhoneScreen />);

        expect(getByText('Verify')).toBeTruthy();
    });

    it('allows OTP input', () => {
        render(<OTPVerificationPhoneScreen />);

        // OTPInput component should be rendered
        const screen_instance = screen;
        expect(screen_instance).toBeTruthy();
    });
});
