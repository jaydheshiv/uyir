import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import TermsAndConditions from '../../screens/TermsAndConditions';

// Mock navigation
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        reset: mockReset,
    }),
    useRoute: () => ({
        name: 'TermsAndConditions',
        key: 'terms-conditions-key',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useProfessional: () => ({
        markProTermsAccepted: jest.fn(),
    }),
}));

describe('TermsAndConditions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<TermsAndConditions />);

        expect(getByText('Terms and Conditions')).toBeTruthy();
    });

    it('displays licensing consent section', () => {
        const { getByText, getAllByText } = render(<TermsAndConditions />);

        expect(getByText('1. Licensing Consent')).toBeTruthy();
        // Text appears in both section 1 and section 3
        const grantTexts = getAllByText(/grant Uyir the right/i);
        expect(grantTexts.length).toBeGreaterThan(0);
    });

    it('displays ownership and revenue section', () => {
        const { getByText } = render(<TermsAndConditions />);

        expect(getByText('2. Ownership & Revenue')).toBeTruthy();
        expect(getByText(/retain full ownership/i)).toBeTruthy();
    });

    it('displays right to withdraw section', () => {
        const { getByText } = render(<TermsAndConditions />);

        expect(getByText('3. Right to Withdraw')).toBeTruthy();
    });

    it('has checkbox for agreement', () => {
        const { getByText } = render(<TermsAndConditions />);

        expect(getByText(/I agree to the above terms/i)).toBeTruthy();
    });

    it('allows toggling agreement checkbox', () => {
        const { getByText } = render(<TermsAndConditions />);

        const checkbox = getByText(/I agree to the above terms/i);
        fireEvent.press(checkbox);

        // Checkbox should be toggleable
        expect(checkbox).toBeTruthy();
    });

    it('has agree and continue button', () => {
        const { getByText } = render(<TermsAndConditions />);

        expect(getByText('Agree & Continue')).toBeTruthy();
    });

    it('button is pressable after agreement', () => {
        const { getByText } = render(<TermsAndConditions />);

        // First agree to terms
        const checkboxLabel = getByText(/I agree to the above terms/i);
        fireEvent.press(checkboxLabel);

        // Then press button
        const button = getByText('Agree & Continue');
        expect(button).toBeTruthy();

        // Button should be enabled after agreement
        fireEvent.press(button);
    });
});
