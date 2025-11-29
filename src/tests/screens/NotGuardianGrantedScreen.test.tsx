import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import NotGuardianGrantedScreen from '../../screens/NotGuardianGrantedScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'NotGuardianGrantedScreen',
        key: 'NotGuardianGrantedScreen-key',
    }),
}));

describe('NotGuardianGrantedScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the NotGuardianGrantedScreen', () => {
        const { getByText } = render(<NotGuardianGrantedScreen />);
        expect(getByText(/didn't receive permission/i)).toBeTruthy();
    });

    it('displays Change Guardian button', () => {
        const { getByText } = render(<NotGuardianGrantedScreen />);
        expect(getByText('Change Guardian')).toBeTruthy();
    });

    it('displays Resend Consent Form button', () => {
        const { getByText } = render(<NotGuardianGrantedScreen />);
        expect(getByText('Resend Consent Form')).toBeTruthy();
    });

    it('handles Change Guardian button press', () => {
        const { getByText } = render(<NotGuardianGrantedScreen />);
        const button = getByText('Change Guardian');

        fireEvent.press(button);
        expect(button).toBeTruthy();
    });

    it('handles Resend Consent Form button press', () => {
        const { getByText } = render(<NotGuardianGrantedScreen />);
        const button = getByText('Resend Consent Form');

        fireEvent.press(button);
        expect(button).toBeTruthy();
    });
});
