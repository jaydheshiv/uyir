import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock navigation BEFORE importing component
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'Walkthrough2',
        key: 'Walkthrough2-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

// Mock react-native-svg properly
jest.mock('react-native-svg', () => {
    const React = require('react');
    const { View } = require('react-native');

    const Svg = (props: any) => React.createElement(View, props, props.children);
    const Circle = (props: any) => React.createElement(View, props);
    const Path = (props: any) => React.createElement(View, props);

    return {
        __esModule: true,
        default: Svg,
        Svg,
        Circle,
        Path,
    };
});

// Import component AFTER all mocks
import Walkthrough2 from '../../screens/Walkthrough2';

describe('Walkthrough2', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Walkthrough2 screen', () => {
        const { getByText } = render(<Walkthrough2 />);
        expect(getByText('Create your personal timeline')).toBeTruthy();
    });

    it('displays subtitle text', () => {
        const { getByText } = render(<Walkthrough2 />);
        expect(getByText(/Capture moments and emotions/i)).toBeTruthy();
    });

    it('displays Skip button', () => {
        const { getByText } = render(<Walkthrough2 />);
        expect(getByText('Skip')).toBeTruthy();
    });

    it('displays Continue button', () => {
        const { getByText } = render(<Walkthrough2 />);
        expect(getByText('Continue')).toBeTruthy();
    });

    it('navigates to OnboardingScreen1 on Skip button press', () => {
        const { getByText } = render(<Walkthrough2 />);
        const skipButton = getByText('Skip');

        fireEvent.press(skipButton);

        expect(mockNavigate).toHaveBeenCalledWith('OnboardingScreen1');
    });

    it('navigates to Walkthrough3 on Continue button press', () => {
        const { getByText } = render(<Walkthrough2 />);
        const continueButton = getByText('Continue');

        fireEvent.press(continueButton);

        expect(mockNavigate).toHaveBeenCalledWith('Walkthrough3');
    });
});
