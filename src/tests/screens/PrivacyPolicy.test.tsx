import { render } from '@testing-library/react-native';
import React from 'react';
import PrivacyPolicy from '../../screens/PrivacyPolicy';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'PrivacyPolicy',
        key: 'privacy-policy-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

describe('PrivacyPolicy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<PrivacyPolicy />);

        expect(getByText('Privacy Policy')).toBeTruthy();
    });

    it('displays privacy policy text', () => {
        const { getByText } = render(<PrivacyPolicy />);

        // Check for key phrases in privacy text
        expect(getByText(/your privacy is our utmost priority/i)).toBeTruthy();
    });

    it('mentions UYIR in privacy text', () => {
        const { getByText } = render(<PrivacyPolicy />);

        expect(getByText(/UYIR/i)).toBeTruthy();
    });

    it('mentions data collection', () => {
        const { getByText } = render(<PrivacyPolicy />);

        expect(getByText(/data we collect/i)).toBeTruthy();
    });

    it('mentions security measures', () => {
        const { getByText } = render(<PrivacyPolicy />);

        expect(getByText(/security measures/i)).toBeTruthy();
    });
});
