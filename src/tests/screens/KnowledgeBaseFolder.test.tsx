import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import KnowledgeBaseFolder from '../../screens/KnowledgeBaseFolder';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'KnowledgeBaseFolder',
        key: 'KnowledgeBaseFolder-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
    Edit: 'Edit',
    Menu: 'Menu',
}));

describe('KnowledgeBaseFolder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the KnowledgeBaseFolder screen', () => {
        const { getByText } = render(<KnowledgeBaseFolder />);
        expect(getByText('Knowledge Base')).toBeTruthy();
    });

    it('displays section description', () => {
        const { getByText } = render(<KnowledgeBaseFolder />);
        expect(getByText('Folders created by you')).toBeTruthy();
    });

    it('displays search bar', () => {
        const { getByPlaceholderText } = render(<KnowledgeBaseFolder />);
        expect(getByPlaceholderText('Search in knowledge base')).toBeTruthy();
    });

    it('allows typing in search bar', () => {
        const { getByPlaceholderText } = render(<KnowledgeBaseFolder />);
        const searchInput = getByPlaceholderText('Search in knowledge base');

        fireEvent.changeText(searchInput, 'test folder');
        expect(searchInput.props.value).toBe('test folder');
    });

    it('displays Files label', () => {
        const { getByText } = render(<KnowledgeBaseFolder />);
        expect(getByText('Files')).toBeTruthy();
    });

    it('renders folder cards', () => {
        const { getAllByText } = render(<KnowledgeBaseFolder />);
        const folderTitles = getAllByText('About Me');
        // Should render 8 folders with "About Me" title
        expect(folderTitles.length).toBe(8);
    });
});
