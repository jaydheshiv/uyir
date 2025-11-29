import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ContentVisibility from '../../screens/ContentVisibility';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'ContentVisibility',
        key: 'ContentVisibility-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
    Edit: 'Edit',
}));

describe('ContentVisibility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the ContentVisibility screen', () => {
        const { getByText } = render(<ContentVisibility />);
        expect(getByText('Content Visibility')).toBeTruthy();
    });

    it('displays Knowledge Base menu option', () => {
        const { getByText } = render(<ContentVisibility />);
        expect(getByText('Knowledge Base')).toBeTruthy();
    });

    it('displays General menu option', () => {
        const { getByText } = render(<ContentVisibility />);
        expect(getByText('General')).toBeTruthy();
    });

    it('navigates to CvKnowledgeBase on Knowledge Base press', () => {
        const { getByText } = render(<ContentVisibility />);
        const knowledgeBaseButton = getByText('Knowledge Base');

        fireEvent.press(knowledgeBaseButton);

        expect(mockNavigate).toHaveBeenCalledWith('CvKnowledgeBase');
    });

    it('navigates to CvGeneral on General press', () => {
        const { getByText } = render(<ContentVisibility />);
        const generalButton = getByText('General');

        fireEvent.press(generalButton);

        expect(mockNavigate).toHaveBeenCalledWith('CvGeneral');
    });
});
