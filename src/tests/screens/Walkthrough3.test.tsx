import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Walkthrough3 from '../../screens/Walkthrough3';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'Walkthrough3',
        key: 'Walkthrough3-key',
    }),
}));

describe('Walkthrough3', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Walkthrough3 screen', () => {
        const { getByText } = render(<Walkthrough3 />);
        expect(getByText('Unlock the Pro experience')).toBeTruthy();
    });

    it('displays subtitle text', () => {
        const { getByText } = render(<Walkthrough3 />);
        expect(getByText(/Explore avatars of friends and creators/i)).toBeTruthy();
    });

    it('displays Skip button', () => {
        const { getByText } = render(<Walkthrough3 />);
        expect(getByText('Skip')).toBeTruthy();
    });

    it('displays Continue button', () => {
        const { getByText } = render(<Walkthrough3 />);
        expect(getByText('Continue')).toBeTruthy();
    });

    it('navigates to OnboardingScreen1 on Skip button press', () => {
        const { getByText } = render(<Walkthrough3 />);
        const skipButton = getByText('Skip');

        fireEvent.press(skipButton);

        expect(mockNavigate).toHaveBeenCalledWith('OnboardingScreen1');
    });

    it('navigates to OnboardingScreen1 on Continue button press', () => {
        const { getByText } = render(<Walkthrough3 />);
        const continueButton = getByText('Continue');

        fireEvent.press(continueButton);

        expect(mockNavigate).toHaveBeenCalledWith('OnboardingScreen1');
    });
});
