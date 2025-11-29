import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../../screens/HomeScreen';

describe('HomeScreen', () => {
    it('renders the HomeScreen', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Welcome to Uyir!')).toBeTruthy();
    });

    it('displays subtitle text', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Your React Native app is ready to go.')).toBeTruthy();
    });

    it('displays Get Started button', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Get Started')).toBeTruthy();
    });

    it('handles button press', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const { getByText } = render(<HomeScreen />);
        const button = getByText('Get Started');

        fireEvent.press(button);

        expect(consoleSpy).toHaveBeenCalledWith('Button pressed!');
        consoleSpy.mockRestore();
    });
});
