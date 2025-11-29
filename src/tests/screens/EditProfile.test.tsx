import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import EditProfile from '../../screens/EditProfile';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'EditProfile',
        key: 'edit-profile-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

describe('EditProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<EditProfile />);

        expect(getByText('Update profile')).toBeTruthy();
    });

    it('displays all form fields', () => {
        const { getByText } = render(<EditProfile />);

        expect(getByText('Full name')).toBeTruthy();
        expect(getByText('Date of Birth')).toBeTruthy();
        expect(getByText('Email')).toBeTruthy();
        expect(getByText('Phone Number')).toBeTruthy();
        expect(getByText('City')).toBeTruthy();
    });

    it('allows editing full name', () => {
        const { getByPlaceholderText } = render(<EditProfile />);

        const nameInput = getByPlaceholderText('Full name');
        fireEvent.changeText(nameInput, 'John Doe');

        expect(nameInput.props.value).toBe('John Doe');
    });

    it('allows editing email', () => {
        const { getByPlaceholderText } = render(<EditProfile />);

        const emailInput = getByPlaceholderText('Email');
        fireEvent.changeText(emailInput, 'newemail@example.com');

        expect(emailInput.props.value).toBe('newemail@example.com');
    });

    it('allows editing phone number', () => {
        const { getByPlaceholderText } = render(<EditProfile />);

        const phoneInput = getByPlaceholderText('Phone number');
        fireEvent.changeText(phoneInput, '9876543210');

        expect(phoneInput.props.value).toBe('9876543210');
    });

    it('allows editing city', () => {
        const { getByPlaceholderText } = render(<EditProfile />);

        const cityInput = getByPlaceholderText('City');
        fireEvent.changeText(cityInput, 'Mumbai');

        expect(cityInput.props.value).toBe('Mumbai');
    });

    it('displays save button', () => {
        const { getByText } = render(<EditProfile />);

        expect(getByText('Save')).toBeTruthy();
    });

    it('displays phone country code', () => {
        const { getByText } = render(<EditProfile />);

        expect(getByText('+91')).toBeTruthy();
    });
});
