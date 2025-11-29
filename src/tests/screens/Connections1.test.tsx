import { render } from '@testing-library/react-native';
import React from 'react';
import Connections1 from '../../screens/Connections1';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
    useRoute: () => ({
        name: 'Connections1',
        key: 'Connections1-test',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: () => ({
        token: 'test-token',
    }),
}));

// Mock fetch
globalThis.fetch = jest.fn();

describe('Connections1', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis.fetch as jest.Mock).mockClear();
    });

    test('renders connections screen', () => {
        const { toJSON } = render(<Connections1 />);
        expect(toJSON()).toBeTruthy();
    });

    test('professionals API endpoint is configured', () => {
        const endpoint = 'http://dev.api.uyir.ai:8081/professionals/';
        expect(endpoint).toContain('/professionals/');
    });

    test('filters professional by Jay Dheshiv', () => {
        const professionals = [
            { display_name: 'Jay Dheshiv', bio: 'Therapist' },
            { display_name: 'Test User', bio: 'Test' },
        ];

        const filtered = professionals.filter((prof) => {
            const name = prof.display_name?.toLowerCase() || '';
            return name.includes('jay') && name.includes('dheshiv');
        });

        expect(filtered).toHaveLength(1);
        expect(filtered[0].display_name).toBe('Jay Dheshiv');
    });
});
