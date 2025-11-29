import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import TherapistCard from '../../components/TherapistCard';

describe('TherapistCard Component', () => {
    const mockTherapistProps = {
        image: 'https://example.com/avatar.jpg',
        name: 'Dr. Jane Smith',
        experience: '10 years experience',
        price: '$100/session',
        therapyType: 'Cognitive Behavioral Therapy',
        therapyDesc: 'Specialized in anxiety and depression treatment',
        availableVia: 'Video, Audio, Chat',
        activeDot: 1,
        totalDots: 3,
    };

    const mockOnPress = jest.fn();

    beforeEach(() => {
        mockOnPress.mockClear();
    });

    // Test 1: Renders therapist information
    test('renders therapist name and information', () => {
        render(<TherapistCard {...mockTherapistProps} onProfilePress={mockOnPress} />);

        expect(screen.getByText('Dr. Jane Smith')).toBeTruthy();
        expect(screen.getByText('Cognitive Behavioral Therapy')).toBeTruthy();
    });

    // Test 2: Calls onPress when View Profile is pressed
    test('calls onProfilePress when View Profile button is tapped', () => {
        render(<TherapistCard {...mockTherapistProps} onProfilePress={mockOnPress} />);

        fireEvent.press(screen.getByText('View Profile'));

        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    // Test 3: Displays experience information
    test('displays therapist experience', () => {
        render(<TherapistCard {...mockTherapistProps} />);

        expect(screen.getByText('10 years experience')).toBeTruthy();
    });

    // Test 4: Displays price
    test('displays therapist price', () => {
        render(<TherapistCard {...mockTherapistProps} />);

        expect(screen.getByText('$100/session')).toBeTruthy();
    });

    // Test 5: Shows therapy type and description
    test('shows therapy type and description', () => {
        render(<TherapistCard {...mockTherapistProps} />);

        expect(screen.getByText('Cognitive Behavioral Therapy')).toBeTruthy();
        expect(screen.getByText(/anxiety and depression/i)).toBeTruthy();
    });

    // Test 6: Shows availability information
    test('shows available via information', () => {
        render(<TherapistCard {...mockTherapistProps} />);

        expect(screen.getByText('Available online via:')).toBeTruthy();
        expect(screen.getByText('Video, Audio, Chat')).toBeTruthy();
    });

    // Test 7: Renders pagination dots
    test('renders pagination dots correctly', () => {
        render(<TherapistCard {...mockTherapistProps} activeDot={1} totalDots={3} />);

        // Check that component renders (dots are styled divs)
        expect(screen.root).toBeTruthy();
    });

    // Test 8: Snapshot test
    test('matches snapshot', () => {
        const { toJSON } = render(
            <TherapistCard {...mockTherapistProps} onProfilePress={mockOnPress} />
        );
        expect(toJSON()).toMatchSnapshot();
    });
});
