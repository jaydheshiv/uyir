import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import PaymentSuccessful from '../../screens/PaymentSuccessful';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'PaymentSuccessful',
        key: 'PaymentSuccessful-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('PaymentSuccessful', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the PaymentSuccessful screen', () => {
        const { getByText } = render(<PaymentSuccessful />);
        expect(getByText('Payment Successful')).toBeTruthy();
    });

    it('displays success subtitle', () => {
        const { getByText } = render(<PaymentSuccessful />);
        expect(getByText("You're now a Pro!")).toBeTruthy();
    });

    it('displays Create Your Twin button', () => {
        const { getByText } = render(<PaymentSuccessful />);
        expect(getByText('Create Your Twin')).toBeTruthy();
    });

    it('navigates to LetUsKnowYou on button press', () => {
        const { getByText } = render(<PaymentSuccessful />);
        const button = getByText('Create Your Twin');

        fireEvent.press(button);

        expect(mockNavigate).toHaveBeenCalledWith('LetUsKnowYou');
    });
});
