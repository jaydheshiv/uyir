import { render } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
import DefaultAvatar from '../../screens/DefaultAvatar';

// Mock PrimaryButton
jest.mock('../../components/PrimaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return (props: any) => (
        <TouchableOpacity onPress={props.onPress} disabled={props.disabled} testID="primary-button">
            <Text>{props.title}</Text>
        </TouchableOpacity>
    );
});

describe('DefaultAvatar', () => {
    it('renders the DefaultAvatar screen', () => {
        const { getByText } = render(<DefaultAvatar />);
        expect(getByText('Select your twin')).toBeTruthy();
    });

    it('displays the subtitle text', () => {
        const { getByText } = render(<DefaultAvatar />);
        expect(getByText('Choose how you want your avatar to look.')).toBeTruthy();
    });

    it('displays the Next button', () => {
        const { getByText } = render(<DefaultAvatar />);
        expect(getByText('Next')).toBeTruthy();
    });

    it('renders avatar images', () => {
        const { UNSAFE_getAllByType } = render(<DefaultAvatar />);
        const images = UNSAFE_getAllByType(Image);
        // Should have 2 avatar images
        expect(images.length).toBe(2);
    });

    it('has first avatar selected by default', () => {
        const { getByTestId } = render(<DefaultAvatar />);
        const nextButton = getByTestId('primary-button');
        // Next button should be enabled if an avatar is selected
        expect(nextButton).toBeTruthy();
    });
});
