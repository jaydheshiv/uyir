import { render } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
import Invite from '../../screens/Invite';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'Invite',
        key: 'Invite-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('Invite', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Invite screen', () => {
        const { getByText } = render(<Invite />);
        expect(getByText('Sharing Profile')).toBeTruthy();
    });

    it('displays profile name', () => {
        const { getByText } = render(<Invite />);
        expect(getByText('Sadhguru')).toBeTruthy();
    });

    it('displays connection text', () => {
        const { getByText } = render(<Invite />);
        expect(getByText(/You can now connect/i)).toBeTruthy();
    });

    it('displays UYIR branding', () => {
        const { getByText } = render(<Invite />);
        expect(getByText('UYIR')).toBeTruthy();
    });

    it('displays People on UYIR section', () => {
        const { getByText } = render(<Invite />);
        expect(getByText('People on UYIR')).toBeTruthy();
    });

    it('displays people names', () => {
        const { getByText } = render(<Invite />);
        expect(getByText('Ashley Kamin')).toBeTruthy();
        expect(getByText('Amber Spiers')).toBeTruthy();
        expect(getByText('Simon Pickford')).toBeTruthy();
        expect(getByText('Kristina Pickles')).toBeTruthy();
    });

    it('displays MORE section', () => {
        const { getByText } = render(<Invite />);
        expect(getByText('MORE')).toBeTruthy();
    });

    it('displays share options', () => {
        const { getByText } = render(<Invite />);
        expect(getByText('AirDrop')).toBeTruthy();
        expect(getByText('Messages')).toBeTruthy();
        expect(getByText('Mail')).toBeTruthy();
        expect(getByText('Notes')).toBeTruthy();
    });

    it('displays profile image', () => {
        const { UNSAFE_getAllByType } = render(<Invite />);
        const images = UNSAFE_getAllByType(Image);
        expect(images.length).toBeGreaterThan(0);
    });

    it('displays QR code', () => {
        const { UNSAFE_getAllByType } = render(<Invite />);
        const images = UNSAFE_getAllByType(Image);
        // Should have profile image, QR code, people images, and share icons
        expect(images.length).toBeGreaterThanOrEqual(5);
    });
});
