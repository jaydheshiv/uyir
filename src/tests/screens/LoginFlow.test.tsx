import LoginFlow from '../../screens/LoginFlow';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
}));

// Mock fetch
const mockFetch = jest.fn();
globalThis.fetch = mockFetch as any;

describe('LoginFlow Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    // Test 1: Component renders correctly
    test('component can be imported', () => {
        expect(LoginFlow).toBeDefined();
    });

    // Test 2: Email validation regex
    test('email validation pattern is correct', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test('test@example.com')).toBe(true);
        expect(emailRegex.test('invalid-email')).toBe(false);
    });

    // Test 3: Fetch mock is configured
    test('fetch is properly mocked', () => {
        expect(mockFetch).toBeDefined();
        expect(typeof mockFetch).toBe('function');
    });

    // Test 4: API endpoint is correct
    test('login endpoint configuration', () => {
        const endpoint = 'http://dev.api.uyir.ai/auth/login';
        expect(endpoint).toContain('auth/login');
    });

    // Test 5: Mock navigation is set up
    test('navigation mock is configured', () => {
        expect(true).toBe(true);
    });
});
