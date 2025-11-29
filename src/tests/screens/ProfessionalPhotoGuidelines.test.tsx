import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ProfessionalPhotoGuidelines from '../../screens/ProfessionalPhotoGuidelines';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'ProfessionalPhotoGuidelines',
        key: 'ProfessionalPhotoGuidelines-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock PrimaryButton
jest.mock('../../components/PrimaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return (props: any) => (
        <TouchableOpacity onPress={props.onPress} testID="primary-button">
            <Text>{props.title}</Text>
        </TouchableOpacity>
    );
});

describe('ProfessionalPhotoGuidelines', () => {
    it('renders the ProfessionalPhotoGuidelines screen', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        expect(getByText('Prepare your recording environment')).toBeTruthy();
    });

    it('displays Text Tips tab by default', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        expect(getByText('Text Tips')).toBeTruthy();
        expect(getByText('Video Tips')).toBeTruthy();
    });

    it('displays Good Photos section', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        expect(getByText('Good Photos')).toBeTruthy();
    });

    it('displays Bad Photos section', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        expect(getByText('Bad Photos')).toBeTruthy();
    });

    it('displays How to Record section', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        expect(getByText('How to Record?')).toBeTruthy();
    });

    it('switches to Video Tips tab', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        const videoTab = getByText('Video Tips');

        fireEvent.press(videoTab);

        // After switching, should see Do's section
        expect(getByText("Do's")).toBeTruthy();
    });

    it('displays Video Tips content after tab switch', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        const videoTab = getByText('Video Tips');

        fireEvent.press(videoTab);

        expect(getByText("Don'ts")).toBeTruthy();
    });

    it('displays I Understand button', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        expect(getByText('I Understand')).toBeTruthy();
    });

    it('has recording tips with numbered steps', () => {
        const { getByText } = render(<ProfessionalPhotoGuidelines />);
        expect(getByText('Pick an image that captures your essence')).toBeTruthy();
        expect(getByText('Add the sound of you to your twin')).toBeTruthy();
        expect(getByText('Let us set up your pro account')).toBeTruthy();
    });
});
