import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import AccountGranted from '../../screens/AccountGranted';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'AccountGranted',
        key: 'AccountGranted-key',
    }),
}));

describe('AccountGranted', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the AccountGranted screen', () => {
        const { getByText } = render(<AccountGranted />);
        expect(getByText(/Your space is now ready/i)).toBeTruthy();
    });

    it('displays confirmation message', () => {
        const { getByText } = render(<AccountGranted />);
        expect(getByText(/adding moments/i)).toBeTruthy();
    });

    it('displays Go to Home button', () => {
        const { getByText } = render(<AccountGranted />);
        expect(getByText('Go to Home')).toBeTruthy();
    });

    it('navigates to HomeScreen on button press', () => {
        const { getByText } = render(<AccountGranted />);
        const button = getByText('Go to Home');

        fireEvent.press(button);

        expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
});
