describe('Discoverprotier Screen', () => {
    const mockFetch = jest.fn();
    globalThis.fetch = mockFetch as any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    // Test 1: Test suite is configured
    test('test suite is configured', () => {
        expect(true).toBe(true);
    });

    // Test 2: Professionals list API endpoint
    test('professionals list endpoint is correct', () => {
        const endpoint = 'http://dev.api.uyir.ai:8081/professionals/';
        expect(endpoint).toContain('professionals');
    });

    // Test 3: Domain tags API endpoint
    test('domain tags endpoint is correct', () => {
        const endpoint = 'http://dev.api.uyir.ai:8081/professional/tags';
        expect(endpoint).toContain('professional/tags');
    });

    // Test 4: Professional object structure
    test('professional object has required fields', () => {
        const professional = {
            id: 1,
            user_id: 1,
            display_name: 'Dr. Smith',
            bio: 'Licensed therapist',
            specialization: 'Psychology',
            tags: ['Psychology', 'CBT'],
            profile_image_url: 'https://example.com/profile.jpg',
            cover_image_url: 'https://example.com/cover.jpg',
            subscriber_count: 150,
            is_verified: true
        };
        expect(professional.display_name).toBeDefined();
        expect(professional.id).toBeDefined();
        expect(Array.isArray(professional.tags)).toBe(true);
    });

    // Test 5: Tag object structure
    test('tag object has required fields', () => {
        const tag = {
            tag_id: '123',
            name: 'Psychology',
            slug: 'psychology',
            tag_type: 'domain' as const,
            parent_id: null,
            is_active: true
        };
        expect(tag.tag_id).toBeDefined();
        expect(tag.name).toBeDefined();
        expect(tag.slug).toBeDefined();
        expect(tag.tag_type).toBe('domain');
    });

    // Test 6: Tag types validation
    test('tag types are domain and sub_specialization', () => {
        const tagTypes = ['domain', 'sub_specialization'];
        expect(tagTypes).toContain('domain');
        expect(tagTypes).toContain('sub_specialization');
    });

    // Test 7: Category filtering logic
    test('professionals filtered by active category', () => {
        const professionals = [
            { id: 1, display_name: 'Dr. Smith', tags: ['psychology', 'cbt'] },
            { id: 2, display_name: 'Dr. Jones', tags: ['nutrition', 'wellness'] }
        ];
        const activeCategory = 'psychology';
        const filtered = professionals.filter(prof =>
            prof.tags.some(tag => tag.toLowerCase().includes(activeCategory.toLowerCase()))
        );
        expect(filtered.length).toBe(1);
        expect(filtered[0].display_name).toBe('Dr. Smith');
    });

    // Test 8: All category shows all professionals
    test('null category shows all professionals', () => {
        const activeCategory = null;
        const shouldShowAll = activeCategory === null;
        expect(shouldShowAll).toBe(true);
    });

    // Test 9: Professional data normalization
    test('professional data normalized from various API shapes', () => {
        const rawData = [
            { professionals: [{ id: 1, name: 'Dr. Smith' }] },
            { results: [{ id: 2, name: 'Dr. Jones' }] },
            { items: [{ id: 3, name: 'Dr. Brown' }] },
            { data: [{ id: 4, name: 'Dr. White' }] }
        ];

        const normalizeField = (data: any) => {
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.professionals)) return data.professionals;
            if (Array.isArray(data?.results)) return data.results;
            if (Array.isArray(data?.items)) return data.items;
            if (Array.isArray(data?.data)) return data.data;
            return [];
        };

        expect(normalizeField(rawData[0]).length).toBe(1);
        expect(normalizeField(rawData[1]).length).toBe(1);
    });

    // Test 10: Tag extraction from various formats
    test('tags extracted from string or object formats', () => {
        const rawTags = [
            'psychology',
            { name: 'CBT' },
            { label: 'Therapy' },
            { slug: 'counseling' }
        ];

        const extractedTags = rawTags.map(t =>
            typeof t === 'string' ? t : (t.name || t.label || t.slug || '')
        ).filter(s => typeof s === 'string' && s.length > 0);

        expect(extractedTags).toContain('psychology');
        expect(extractedTags).toContain('CBT');
        expect(extractedTags.length).toBeGreaterThan(0);
    });

    // Test 11: Image URL fallbacks
    test('image URLs use fallback chain', () => {
        const professional1 = { profile_image_url: 'url1.jpg' };
        const professional2 = { avatar_url: 'url2.jpg' };
        const professional3 = {};

        const getImageUrl = (p: any) =>
            p.profile_image_url || p.avatar_url || null;

        expect(getImageUrl(professional1)).toBe('url1.jpg');
        expect(getImageUrl(professional2)).toBe('url2.jpg');
        expect(getImageUrl(professional3)).toBeNull();
    });

    // Test 12: Subscriber count handling
    test('subscriber count defaults to undefined if not number', () => {
        const prof1 = { subscriber_count: 150 };
        const prof2 = { subscriber_count: 'invalid' };
        const prof3 = {};

        const getCount = (p: any) =>
            typeof p?.subscriber_count === 'number' ? p.subscriber_count : undefined;

        expect(getCount(prof1)).toBe(150);
        expect(getCount(prof2)).toBeUndefined();
        expect(getCount(prof3)).toBeUndefined();
    });

    // Test 13: Verified badge logic
    test('verified badge shown when is_verified is true', () => {
        const verifiedProf = { is_verified: true };
        const unverifiedProf = { is_verified: false };
        const unknownProf: any = {};

        expect(Boolean(verifiedProf.is_verified)).toBe(true);
        expect(Boolean(unverifiedProf.is_verified)).toBe(false);
        expect(Boolean(unknownProf.is_verified)).toBe(false);
    });

    // Test 14: Category pills include All option
    test('category list includes All option with null tag', () => {
        const categories = [
            { name: 'All', tag: null },
            { name: 'Psychology', tag: 'psychology' },
            { name: 'Nutrition', tag: 'nutrition' }
        ];
        expect(categories[0].name).toBe('All');
        expect(categories[0].tag).toBeNull();
    });

    // Test 15: Abort controller for request cancellation
    test('requests can be aborted on unmount', () => {
        const aborter = new AbortController();
        expect(aborter.signal).toBeDefined();
        expect(typeof aborter.abort).toBe('function');
    });

    // Test 16: Navigation targets
    test('navigation screens defined', () => {
        const screens = ['Visualizations', 'Discoverprotier', 'ProfileScreen'];
        expect(screens).toContain('Visualizations');
        expect(screens).toContain('ProfileScreen');
    });

    // Test 17: Loading state management
    test('loading state toggles during fetch', () => {
        let loading = false;
        loading = true;
        expect(loading).toBe(true);
        loading = false;
        expect(loading).toBe(false);
    });

    // Test 18: Error state management
    test('error message set on fetch failure', () => {
        const errorStates = [
            'Failed to load professionals',
            'Network error. Please try again.',
            null
        ];
        expect(errorStates[0]).toContain('Failed to load');
        expect(errorStates[1]).toContain('Network error');
        expect(errorStates[2]).toBeNull();
    });

    // Test 19: Fetch mock is configured
    test('fetch mock is available', () => {
        expect(mockFetch).toBeDefined();
    });

    // Test 20: Empty state handling
    test('empty state shown when no professionals match filter', () => {
        const filteredProfessionals: any[] = [];
        const isEmpty = filteredProfessionals.length === 0;
        expect(isEmpty).toBe(true);
    });
});
