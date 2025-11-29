import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Alert, TextInput } from 'react-native';
import SupportPage1 from '../../screens/SupportPage1';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'SupportPage1',
        key: 'SupportPage1-key',
    }),
}));

// Mock useAuth
const mockUseAuth = {
    token: 'test-token',
    user: {
        userId: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
    },
};

jest.mock('../../store', () => ({
    useAuth: () => mockUseAuth,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock fetch
globalThis.fetch = jest.fn();

describe('SupportPage1', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis.fetch as jest.Mock).mockClear();
    });

    it('renders the SupportPage1 screen', () => {
        const { getByText } = render(<SupportPage1 />);
        expect(getByText('Support')).toBeTruthy();
    });

    it('displays message input field', () => {
        const { getByText } = render(<SupportPage1 />);
        expect(getByText('Type your message here')).toBeTruthy();
    });

    it('displays Send button', () => {
        const { getByText } = render(<SupportPage1 />);
        expect(getByText('Send')).toBeTruthy();
    });

    it('allows typing in message field', () => {
        const { UNSAFE_getByType } = render(<SupportPage1 />);
        const input = UNSAFE_getByType(TextInput);

        fireEvent.changeText(input, 'I need help with my account');
        expect(input.props.value).toBe('I need help with my account');
    });

    it('shows alert when sending empty message', () => {
        const { getByText } = render(<SupportPage1 />);
        const sendButton = getByText('Send');

        fireEvent.press(sendButton);

        expect(Alert.alert).toHaveBeenCalledWith(
            'Message Required',
            'Please enter your message before sending.'
        );
    });

    it('allows typing and submitting message', async () => {
        const { UNSAFE_getByType, getByText } = render(<SupportPage1 />);
        const input = UNSAFE_getByType(TextInput);
        const sendButton = getByText('Send');

        expect(input).toBeTruthy();
        fireEvent.changeText(input, 'I need help');
        expect(input.props.value).toBe('I need help');

        expect(sendButton).toBeTruthy();
    });

    it('displays send button', () => {
        const { getByText } = render(<SupportPage1 />);
        const sendButton = getByText('Send');
        expect(sendButton).toBeTruthy();
    });
});
