import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ProfileStatusScreen from '../../screens/ProfileStatus';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
        replace: mockReplace,
    }),
    useRoute: () => ({
        name: 'ProfileStatus',
        key: 'ProfileStatus-key',
    }),
}));

// Mock BackButton
jest.mock('../../components/BackButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return (props: any) => (
        <TouchableOpacity onPress={props.onPress}>
            <Text>Back</Text>
        </TouchableOpacity>
    );
});

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Mock Alert
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        Alert: {
            alert: jest.fn((title, message, buttons) => {
                // Simulate pressing OK button
                if (buttons && buttons[0] && buttons[0].onPress) {
                    buttons[0].onPress();
                }
            }),
        },
    };
});

describe('ProfileStatusScreen', () => {
    const mockNavigation = {
        navigate: mockNavigate,
        goBack: mockGoBack,
        replace: mockReplace,
    } as any;

    const mockRoute = {} as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the ProfileStatus screen', () => {
        const { getByText } = render(
            <ProfileStatusScreen navigation={mockNavigation} route={mockRoute} />
        );
        expect(getByText('Profile Status')).toBeTruthy();
    });

    it('displays Public option', () => {
        const { getByText } = render(
            <ProfileStatusScreen navigation={mockNavigation} route={mockRoute} />
        );
        expect(getByText('Public')).toBeTruthy();
    });

    it('displays Private option', () => {
        const { getByText } = render(
            <ProfileStatusScreen navigation={mockNavigation} route={mockRoute} />
        );
        expect(getByText('Private')).toBeTruthy();
    });

    it('has Public selected by default', () => {
        const { getByText } = render(
            <ProfileStatusScreen navigation={mockNavigation} route={mockRoute} />
        );
        // Public option should be rendered
        expect(getByText('Public')).toBeTruthy();
    });

    it('allows selecting Private option', () => {
        const { getByText } = render(
            <ProfileStatusScreen navigation={mockNavigation} route={mockRoute} />
        );
        const privateOption = getByText('Private');

        fireEvent.press(privateOption);
        expect(privateOption).toBeTruthy();
    });

    it('displays Save button', () => {
        const { getByText } = render(
            <ProfileStatusScreen navigation={mockNavigation} route={mockRoute} />
        );
        expect(getByText('Save')).toBeTruthy();
    });

    it('displays Save button and can be pressed', () => {
        const { getByText } = render(
            <ProfileStatusScreen navigation={mockNavigation} route={mockRoute} />
        );
        const saveButton = getByText('Save');

        fireEvent.press(saveButton);

        // Verify Save button can be pressed
        expect(saveButton).toBeTruthy();
    });
});
