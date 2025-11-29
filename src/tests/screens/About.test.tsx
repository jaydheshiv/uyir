import { render } from '@testing-library/react-native';
import React from 'react';
import About from '../../screens/About';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'About',
        key: 'about-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

describe('About', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<About />);

        expect(getByText('About')).toBeTruthy();
    });

    it('displays about text', () => {
        const { getByText } = render(<About />);

        // Check for key phrases in about text
        expect(getByText(/Uyir appears to be a mobile application/i)).toBeTruthy();
    });

    it('mentions avatars', () => {
        const { getByText } = render(<About />);

        expect(getByText(/Avatars/i)).toBeTruthy();
    });

    it('mentions memory cards', () => {
        const { getByText } = render(<About />);

        expect(getByText(/Memory Cards/i)).toBeTruthy();
    });

    it('mentions connections', () => {
        const { getByText } = render(<About />);

        expect(getByText(/Connections/i)).toBeTruthy();
    });

    it('mentions privacy policy', () => {
        const { getByText } = render(<About />);

        expect(getByText(/Privacy Policy/i)).toBeTruthy();
    });
});
