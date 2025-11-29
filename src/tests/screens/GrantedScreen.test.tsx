import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
import GrantedScreen from '../../screens/GrantedScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'GrantedScreen',
        key: 'GrantedScreen-key',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: jest.fn(() => ({
        isNewUser: jest.fn(() => true),
        user: {
            id: 1,
            email: 'test@example.com',
        },
    })),
}));

// Mock PrimaryButton
jest.mock('../../components/PrimaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return (props: any) => (
        <TouchableOpacity
            onPress={props.onPress}
            disabled={props.disabled}
            testID="primary-button"
        >
            <Text>{props.title}</Text>
        </TouchableOpacity>
    );
});

describe('GrantedScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the GrantedScreen', () => {
        const { getByText } = render(<GrantedScreen />);
        expect(getByText("Your account has been successfully verified. You're now ready to begin your journey with Uyir.")).toBeTruthy();
    });

    it('displays Continue button', () => {
        const { getByText } = render(<GrantedScreen />);
        expect(getByText('Continue')).toBeTruthy();
    });

    it('displays verification image', () => {
        const { UNSAFE_getAllByType } = render(<GrantedScreen />);
        const images = UNSAFE_getAllByType(Image);
        expect(images.length).toBeGreaterThanOrEqual(1);
    });

    it('shows Loading text when Continue is pressed', () => {
        const { getByText, getByTestId } = render(<GrantedScreen />);
        const continueButton = getByTestId('primary-button');

        fireEvent.press(continueButton);

        expect(getByText('Loading...')).toBeTruthy();
    });

    it('navigates after loading delay', async () => {
        const { getByTestId } = render(<GrantedScreen />);
        const continueButton = getByTestId('primary-button');

        fireEvent.press(continueButton);

        // Fast-forward timers
        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    it('displays continue button', () => {
        const { getByTestId } = render(<GrantedScreen />);
        const continueButton = getByTestId('primary-button');

        // Button should be present
        expect(continueButton).toBeTruthy();
    });
});
