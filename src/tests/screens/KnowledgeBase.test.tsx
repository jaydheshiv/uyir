import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import KnowledgeBase from '../../screens/KnowledgeBase';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'KnowledgeBase',
        key: 'KnowledgeBase-key',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: jest.fn(() => ({
        token: 'mock-token',
        user: { id: 1 },
    })),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
    Edit: 'Edit',
    Menu: 'Menu',
    Search: 'Search',
    Trash2: 'Trash2',
    FileImage: 'FileImage',
    FileVideo: 'FileVideo',
    FileText: 'FileText',
    Mic: 'Mic',
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn(),
    MediaType: 'mixed',
}));

// Mock Alert
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        Alert: {
            alert: jest.fn(),
        },
    };
});

// Mock fetch
globalThis.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([
            {
                id: '1',
                title: 'Test Knowledge',
                file_type: 'image/jpeg',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                persona_id: '123',
            },
        ]),
        text: () => Promise.resolve(''),
    })
) as jest.Mock;

describe('KnowledgeBase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the KnowledgeBase screen', async () => {
        const { getByText } = render(<KnowledgeBase />);

        await waitFor(() => {
            expect(getByText('Knowledge Base')).toBeTruthy();
        });
    });

    it('displays subtitle text', () => {
        const { getByText } = render(<KnowledgeBase />);
        expect(getByText('Train your avatar by adding your personalized data.')).toBeTruthy();
    });

    it('displays search bar', () => {
        const { getByPlaceholderText } = render(<KnowledgeBase />);
        expect(getByPlaceholderText(/Search in knowledge base/i)).toBeTruthy();
    });

    it('allows typing in search bar', () => {
        const { getByPlaceholderText } = render(<KnowledgeBase />);
        const searchInput = getByPlaceholderText(/Search in knowledge base/i);

        fireEvent.changeText(searchInput, 'test search');
        expect(searchInput.props.value).toBe('test search');
    });

    it('displays Files section', () => {
        const { getByText } = render(<KnowledgeBase />);
        expect(getByText(/Files/i)).toBeTruthy();
    });

    it('displays Save button', () => {
        const { getByText } = render(<KnowledgeBase />);
        expect(getByText('Save')).toBeTruthy();
    });

    it('fetches knowledge entries on mount', async () => {
        render(<KnowledgeBase />);

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalled();
        });
    });

    it('displays loading state initially', () => {
        const { getByText } = render(<KnowledgeBase />);
        expect(getByText('Loading knowledge base...')).toBeTruthy();
    });
});
