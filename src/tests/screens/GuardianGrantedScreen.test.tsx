import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import GuardianGrantedScreen from '../../screens/GuardianGrantedScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'GuardianGrantedScreen',
        key: 'GuardianGrantedScreen-key',
    }),
}));

describe('GuardianGrantedScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the GuardianGrantedScreen', () => {
        const { getByText } = render(<GuardianGrantedScreen />);
        expect(getByText(/guardian has approved/i)).toBeTruthy();
    });

    it('displays Continue button', () => {
        const { getByText } = render(<GuardianGrantedScreen />);
        expect(getByText('Continue')).toBeTruthy();
    });

    it('displays approval message', () => {
        const { getByText } = render(<GuardianGrantedScreen />);
        expect(getByText(/create your avatar/i)).toBeTruthy();
    });

    it('navigates to WelcomeBackScreen when Continue is pressed', async () => {
        const { getByText } = render(<GuardianGrantedScreen />);
        const continueButton = getByText('Continue');

        fireEvent.press(continueButton);
        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('WelcomeBackScreen');
        });
    });
});
