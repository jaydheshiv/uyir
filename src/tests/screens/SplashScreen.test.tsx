import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
import SplashScreen from '../../screens/SplashScreen';

// Mock navigation
const mockReplace = jest.fn();

const mockNavigation = {
    replace: mockReplace,
} as any;

describe('SplashScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the SplashScreen', () => {
        const { UNSAFE_getAllByType } = render(<SplashScreen navigation={mockNavigation} />);
        const images = UNSAFE_getAllByType(Image);
        expect(images.length).toBeGreaterThanOrEqual(1);
    });

    it('displays the Uyir logo', () => {
        const { UNSAFE_getAllByType } = render(<SplashScreen navigation={mockNavigation} />);
        const images = UNSAFE_getAllByType(Image);
        expect(images[0].props.accessibilityLabel).toBe('Uyir Logo');
    });

    it('navigates to Walkthrough1 after timeout', async () => {
        render(<SplashScreen navigation={mockNavigation} />);

        // Fast-forward timers
        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('Walkthrough1');
        });
    });

    it('clears timeout on unmount', () => {
        const { unmount } = render(<SplashScreen navigation={mockNavigation} />);

        unmount();

        // Timeout should be cleared, navigation should not be called
        jest.advanceTimersByTime(2000);
        expect(mockReplace).not.toHaveBeenCalled();
    });
});
