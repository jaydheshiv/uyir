import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Walkthrough1 from '../../screens/Walkthrough1';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'Walkthrough1',
        key: 'Walkthrough1-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

describe('Walkthrough1', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Walkthrough1 screen', () => {
        const { getByText } = render(<Walkthrough1 />);
        expect(getByText('Welcome to Uyir')).toBeTruthy();
    });

    it('displays subtitle text', () => {
        const { getByText } = render(<Walkthrough1 />);
        expect(getByText(/Start your journey of memories and emotions/i)).toBeTruthy();
    });

    it('displays Skip button', () => {
        const { getByText } = render(<Walkthrough1 />);
        expect(getByText('Skip')).toBeTruthy();
    });

    it('displays Continue button', () => {
        const { getByText } = render(<Walkthrough1 />);
        expect(getByText('Continue')).toBeTruthy();
    });

    it('navigates to OnboardingScreen1 on Skip button press', () => {
        const { getByText } = render(<Walkthrough1 />);
        const skipButton = getByText('Skip');

        fireEvent.press(skipButton);

        expect(mockNavigate).toHaveBeenCalledWith('OnboardingScreen1');
    });

    it('navigates to Walkthrough2 on Continue button press', () => {
        const { getByText } = render(<Walkthrough1 />);
        const continueButton = getByText('Continue');

        fireEvent.press(continueButton);

        expect(mockNavigate).toHaveBeenCalledWith('Walkthrough2');
    });
});
