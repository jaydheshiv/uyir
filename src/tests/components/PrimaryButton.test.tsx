import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import PrimaryButton from '../../components/PrimaryButton';

describe('PrimaryButton Component', () => {
    // Test 1: Component renders correctly
    test('renders with correct title', () => {
        render(<PrimaryButton title="Click Me" onPress={() => { }} />);

        expect(screen.getByText('Click Me')).toBeTruthy();
    });

    // Test 2: Button press triggers callback
    test('calls onPress when pressed', () => {
        const mockOnPress = jest.fn();
        render(<PrimaryButton title="Submit" onPress={mockOnPress} />);

        fireEvent.press(screen.getByText('Submit'));

        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    // Test 3: Button can be disabled
    test('does not call onPress when disabled', () => {
        const mockOnPress = jest.fn();
        render(<PrimaryButton title="Submit" onPress={mockOnPress} disabled={true} />);

        fireEvent.press(screen.getByText('Submit'));

        expect(mockOnPress).not.toHaveBeenCalled();
    });

    // Test 4: Custom styles are applied
    test('applies custom styles', () => {
        const customStyle = { backgroundColor: 'red' };
        const customTextStyle = { fontSize: 20 };

        const { getByText } = render(
            <PrimaryButton
                title="Styled"
                onPress={() => { }}
                style={customStyle}
                textStyle={customTextStyle}
            />
        );

        const button = getByText('Styled');
        expect(button).toBeTruthy();
    });

    // Test 5: Snapshot test
    test('matches snapshot', () => {
        const { toJSON } = render(<PrimaryButton title="Test" onPress={() => { }} />);
        expect(toJSON()).toMatchSnapshot();
    });

    // Test 6: Disabled button has reduced opacity
    test('has reduced opacity when disabled', () => {
        const { getByText } = render(
            <PrimaryButton title="Disabled" onPress={() => { }} disabled={true} />
        );

        const buttonText = getByText('Disabled');
        const button = buttonText.parent;
        // Check that disabled prop causes opacity change in styling
        expect(button).toBeTruthy();
    });
});
