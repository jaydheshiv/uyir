import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
import Learnmore from '../../screens/Learnmore';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'Learnmore',
        key: 'Learnmore-key',
    }),
}));

describe('Learnmore', () => {
    const mockOnClose = jest.fn();
    const mockOnDone = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Learnmore screen', () => {
        const { getByText } = render(<Learnmore onClose={mockOnClose} />);
        expect(getByText('Photo Requirements')).toBeTruthy();
    });

    it('displays Good Photos section', () => {
        const { getByText } = render(<Learnmore onClose={mockOnClose} />);
        expect(getByText('Good Photos')).toBeTruthy();
    });

    it('displays Bad Photos section', () => {
        const { getByText } = render(<Learnmore onClose={mockOnClose} />);
        expect(getByText('Bad Photos')).toBeTruthy();
    });

    it('displays good photo description', () => {
        const { getByText } = render(<Learnmore onClose={mockOnClose} />);
        expect(getByText(/Recent photos of yourself/i)).toBeTruthy();
    });

    it('displays bad photo description', () => {
        const { getByText } = render(<Learnmore onClose={mockOnClose} />);
        expect(getByText(/No group photos, hats, sunglasses/i)).toBeTruthy();
    });

    it('displays Done button', () => {
        const { getByText } = render(<Learnmore onClose={mockOnClose} />);
        expect(getByText('Done')).toBeTruthy();
    });

    it('calls onDone when Done button is pressed', () => {
        const { getByText } = render(<Learnmore onClose={mockOnClose} onDone={mockOnDone} />);
        const doneButton = getByText('Done');

        fireEvent.press(doneButton);

        expect(mockOnDone).toHaveBeenCalled();
    });

    it('navigates when nextScreen prop is provided', () => {
        const { getByText } = render(
            <Learnmore onClose={mockOnClose} nextScreen="Upload" />
        );
        const doneButton = getByText('Done');

        fireEvent.press(doneButton);

        expect(mockNavigate).toHaveBeenCalledWith('Upload');
    });

    it('displays photo examples', () => {
        const { UNSAFE_getAllByType } = render(<Learnmore onClose={mockOnClose} />);
        const images = UNSAFE_getAllByType(Image);
        // Should have 4 good photos + 4 bad photos = 8 images
        expect(images.length).toBeGreaterThanOrEqual(8);
    });
});
