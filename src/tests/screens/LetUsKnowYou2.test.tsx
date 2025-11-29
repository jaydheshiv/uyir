import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
import LetUsKnowYou2 from '../../screens/LetUsKnowYou2';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'LetUsKnowYou2',
        key: 'LetUsKnowYou2-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('LetUsKnowYou2', () => {
    it('renders the LetUsKnowYou2 screen', () => {
        const { getByText } = render(<LetUsKnowYou2 />);
        expect(getByText(/how your twin will appear/i)).toBeTruthy();
    });

    it('displays the chat title', () => {
        const { getByText } = render(<LetUsKnowYou2 />);
        expect(getByText(/What.?s been on your mind/i)).toBeTruthy();
    });

    it('displays the text input field', () => {
        const { getByPlaceholderText } = render(<LetUsKnowYou2 />);
        expect(getByPlaceholderText('Let your thoughts flow')).toBeTruthy();
    });

    it('allows typing in the text input', () => {
        const { getByPlaceholderText } = render(<LetUsKnowYou2 />);
        const input = getByPlaceholderText('Let your thoughts flow');

        fireEvent.changeText(input, 'Test thoughts');
        expect(input.props.value).toBe('Test thoughts');
    });

    it('displays the Looks Good button', () => {
        const { getByText } = render(<LetUsKnowYou2 />);
        expect(getByText('Looks Good')).toBeTruthy();
    });

    it('displays avatar image', () => {
        const { UNSAFE_getAllByType } = render(<LetUsKnowYou2 />);
        const images = UNSAFE_getAllByType(Image);
        expect(images.length).toBeGreaterThanOrEqual(1);
    });
});
