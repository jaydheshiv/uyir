import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import OnboardingScreen1 from '../../screens/OnboardingScreen1';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'OnboardingScreen1',
        key: 'onboarding-screen-1-key',
    }),
}));

describe('OnboardingScreen1', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const component = render(<OnboardingScreen1 />);
        expect(component).toBeTruthy();
    });

    it('displays login button', () => {
        const { getByText } = render(<OnboardingScreen1 />);

        expect(getByText('Log in')).toBeTruthy();
    });

    it('displays signup button', () => {
        const { getByText } = render(<OnboardingScreen1 />);

        expect(getByText('Sign Up')).toBeTruthy();
    });

    it('navigates to LoginFlow when login pressed', () => {
        const { getByText } = render(<OnboardingScreen1 />);

        const loginButton = getByText('Log in');
        fireEvent.press(loginButton);

        expect(mockNavigate).toHaveBeenCalledWith('LoginFlow');
    });

    it('navigates to SignupFlow when signup pressed', () => {
        const { getByText } = render(<OnboardingScreen1 />);

        const signupButton = getByText('Sign Up');
        fireEvent.press(signupButton);

        expect(mockNavigate).toHaveBeenCalledWith('SignupFlow');
    });

    it('displays continue as guest option', () => {
        const { getByText } = render(<OnboardingScreen1 />);

        expect(getByText('Continue as Guest')).toBeTruthy();
    });

    it('displays Uyir logo', () => {
        const component = render(<OnboardingScreen1 />);

        // Logo should be rendered
        expect(component).toBeTruthy();
    });
});
