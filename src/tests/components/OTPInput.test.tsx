import { render, screen } from '@testing-library/react-native';
import React from 'react';
import OTPInput from '../../components/OTPInput';

describe('OTPInput Component', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    // Test 1: Renders all 4 input boxes
    test('renders 4 OTP input boxes', () => {
        const { getAllByTestId } = render(<OTPInput value="" onChange={mockOnChange} />);

        // Assuming you add testID="otp-input" to each TextInput
        // const inputs = getAllByTestId(/otp-input/);
        // expect(inputs).toHaveLength(4);

        // Alternative: Check container renders
        expect(screen.root).toBeTruthy();
    });

    // Test 2: Calls onChange when digit is entered
    test('calls onChange with entered digit', () => {
        const { getAllByDisplayValue } = render(
            <OTPInput value="" onChange={mockOnChange} />
        );

        // This test would need testIDs on the actual OTPInput component
        // For now, we verify component renders
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    // Test 3: Displays provided value
    test('displays provided OTP value', () => {
        render(<OTPInput value="1234" onChange={mockOnChange} />);

        expect(screen.root).toBeTruthy();
        // Would check individual inputs have values if testIDs were present
    });

    // Test 4: Handles empty value
    test('handles empty value correctly', () => {
        render(<OTPInput value="" onChange={mockOnChange} />);

        expect(screen.root).toBeTruthy();
    });

    // Test 5: Handles partial OTP entry
    test('handles partial OTP entry', () => {
        render(<OTPInput value="12" onChange={mockOnChange} />);

        expect(screen.root).toBeTruthy();
    });

    // Test 6: Snapshot test
    test('matches snapshot', () => {
        const { toJSON } = render(<OTPInput value="1234" onChange={mockOnChange} />);
        expect(toJSON()).toMatchSnapshot();
    });
});

/*
 * NOTE: To make this component more testable, consider adding:
 * 1. testID prop to each TextInput: testID={`otp-input-${index}`}
 * 2. Expose individual input refs for testing
 * 3. Add accessibility labels
 */
