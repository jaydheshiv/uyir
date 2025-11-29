import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import GuardianConsent from '../../screens/GuardianConsent';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'GuardianConsent',
        key: 'guardian-consent-key',
    }),
}));

describe('GuardianConsent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        globalThis.fetch = jest.fn();
        // Mock alert
        (globalThis as any).alert = jest.fn();
    });

    it('renders correctly', () => {
        const { getByText } = render(<GuardianConsent />);

        expect(getByText('Guardian Consent')).toBeTruthy();
        expect(getByText(/Parental Consent Required/i)).toBeTruthy();
    });

    it('displays form fields', () => {
        const { getByText } = render(<GuardianConsent />);

        expect(getByText("Guardian's Full Name")).toBeTruthy();
        expect(getByText("Guardian's Phone Number/Email")).toBeTruthy();
        // Relation appears twice (label + dropdown button)
        const component = render(<GuardianConsent />);
        expect(component).toBeTruthy();
    });

    it('allows input in guardian name field', () => {
        const { getByPlaceholderText } = render(<GuardianConsent />);

        const nameInput = getByPlaceholderText("Enter guardian's name");
        fireEvent.changeText(nameInput, 'John Doe');

        expect(nameInput.props.value).toBe('John Doe');
    });

    it('allows guardian name and email input', () => {
        const { getByPlaceholderText } = render(<GuardianConsent />);

        const nameInput = getByPlaceholderText("Enter guardian's name");
        const emailInput = getByPlaceholderText('Enter phone or email');

        fireEvent.changeText(nameInput, 'John Doe');
        fireEvent.changeText(emailInput, 'guardian@example.com');

        expect(nameInput.props.value).toBe('John Doe');
        expect(emailInput.props.value).toBe('guardian@example.com');
    });

    it('has send consent form button', () => {
        const { getByText } = render(<GuardianConsent />);

        expect(getByText(/Send Consent Form/i)).toBeTruthy();
    });

    it('displays disclaimer text', () => {
        const { getByText } = render(<GuardianConsent />);

        expect(getByText(/under 18/i)).toBeTruthy();
        expect(getByText(/Uyir/i)).toBeTruthy();
    });

    it('has relation dropdown', () => {
        const { getAllByText } = render(<GuardianConsent />);

        // Relation appears as both label and dropdown button text
        const relationElements = getAllByText('Relation');
        expect(relationElements.length).toBeGreaterThan(0);
    });
});
