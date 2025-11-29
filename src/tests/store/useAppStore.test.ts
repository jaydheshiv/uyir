import { act, renderHook } from '@testing-library/react-native';
import { useAppStore, useAuth, useAvatar, useProfessional } from '../../store/useAppStore';

describe('useAppStore (Zustand State Management)', () => {
    beforeEach(() => {
        // Reset store state before each test
        const { result } = renderHook(() => useAppStore());
        act(() => {
            result.current.logout();
        });
    });

    describe('Authentication State', () => {
        test('initial state is unauthenticated', () => {
            const { result } = renderHook(() => useAuth());

            expect(result.current.token).toBeNull();
            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });

        test('setToken updates authentication state', () => {
            const { result } = renderHook(() => useAuth());

            act(() => {
                result.current.setToken('test-token-123');
            });

            expect(result.current.token).toBe('test-token-123');
            expect(result.current.isAuthenticated).toBe(true);
        });

        test('setUser updates user state', () => {
            const { result } = renderHook(() => useAuth());
            const mockUser = {
                user_id: '123',
                email: 'test@example.com',
                avatar_id: 'avatar-123',
            };

            act(() => {
                result.current.setUser(mockUser);
            });

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.hasCompletedProfile).toBe(true); // Has avatar_id
        });

        test('logout clears all state', () => {
            const { result } = renderHook(() => useAuth());

            // Set initial data
            act(() => {
                result.current.setToken('test-token');
                result.current.setUser({ email: 'test@example.com' });
            });

            // Logout
            act(() => {
                result.current.logout();
            });

            expect(result.current.token).toBeNull();
            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });

        test('getAuthHeader returns Bearer token', () => {
            const { result } = renderHook(() => useAuth());

            act(() => {
                result.current.setToken('my-token');
            });

            const header = result.current.getAuthHeader();
            expect(header).toEqual({ Authorization: 'Bearer my-token' });
        });

        test('getAuthHeader returns empty object when no token', () => {
            const { result } = renderHook(() => useAuth());

            const header = result.current.getAuthHeader();
            expect(header).toEqual({});
        });

        test('isNewUser returns true for new users', () => {
            const { result } = renderHook(() => useAuth());

            expect(result.current.isNewUser()).toBe(true);
        });

        test('isNewUser returns false after profile creation', () => {
            const { result } = renderHook(() => useAuth());

            act(() => {
                result.current.markProfileComplete();
            });

            expect(result.current.isNewUser()).toBe(false);
        });
    });

    describe('Avatar State', () => {
        test('initial avatar state is empty', () => {
            const { result } = renderHook(() => useAvatar());

            expect(result.current.avatar.avatarId).toBeNull();
            expect(result.current.avatar.avatarUrl).toBeNull();
            expect(result.current.avatar.avatarName).toBeNull();
            expect(result.current.hasCreatedAvatar).toBe(false);
        });

        test('setAvatarImage updates selected image', () => {
            const { result } = renderHook(() => useAvatar());

            act(() => {
                result.current.setAvatarImage('face', 'file://path/to/face.jpg');
            });

            expect(result.current.avatar.selectedImages.face).toBe('file://path/to/face.jpg');
        });

        test('setAvatarId updates avatar ID', () => {
            const { result } = renderHook(() => useAvatar());

            act(() => {
                result.current.setAvatarId('avatar-123');
            });

            expect(result.current.avatar.avatarId).toBe('avatar-123');
        });

        test('markAvatarCreated updates flag', () => {
            const { result } = renderHook(() => useAvatar());

            act(() => {
                result.current.markAvatarCreated();
            });

            expect(result.current.hasCreatedAvatar).toBe(true);
        });

        test('clearAvatar resets all avatar state', () => {
            const { result } = renderHook(() => useAvatar());

            // Set some avatar data
            act(() => {
                result.current.setAvatarImage('face', 'file://face.jpg');
                result.current.setAvatarId('avatar-123');
                result.current.setAvatarName('My Avatar');
            });

            // Clear avatar
            act(() => {
                result.current.clearAvatar();
            });

            expect(result.current.avatar.avatarId).toBeNull();
            expect(result.current.avatar.avatarUrl).toBeNull();
            expect(result.current.avatar.avatarName).toBeNull();
            expect(result.current.avatar.selectedImages).toEqual({});
        });

        test('syncAvatarFromUser syncs avatar with user data', () => {
            const authHook = renderHook(() => useAuth());
            const avatarHook = renderHook(() => useAvatar());

            // Set user with avatar data
            act(() => {
                authHook.result.current.setUser({
                    email: 'test@example.com',
                    avatar_id: 'avatar-456',
                    avatar_name: 'Test Avatar',
                });
            });

            // Sync avatar
            act(() => {
                avatarHook.result.current.syncAvatarFromUser();
            });

            expect(avatarHook.result.current.avatar.avatarId).toBe('avatar-456');
            expect(avatarHook.result.current.avatar.avatarName).toBe('Test Avatar');
        });
    });

    describe('Professional State', () => {
        test('initial professional state is false', () => {
            const { result } = renderHook(() => useProfessional());

            expect(result.current.hasCreatedProfessional).toBe(false);
            expect(result.current.hasAcceptedProTerms).toBe(false);
            expect(result.current.professionalData).toBeNull();
        });

        test('markProfessionalCreated updates flag', () => {
            const { result } = renderHook(() => useProfessional());

            act(() => {
                result.current.markProfessionalCreated();
            });

            expect(result.current.hasCreatedProfessional).toBe(true);
        });

        test('markProfessionalNotCreated resets professional state', () => {
            const { result } = renderHook(() => useProfessional());

            // First create professional
            act(() => {
                result.current.markProfessionalCreated();
                result.current.setProfessionalData({
                    professional_id: 'pro-123',
                    user_id: 'user-123',
                    display_name: 'Dr. Smith',
                    subscriber_count: 10,
                    follower_count: 50,
                    upcoming_session_count: 3,
                });
            });

            // Then mark as not created
            act(() => {
                result.current.markProfessionalNotCreated();
            });

            expect(result.current.hasCreatedProfessional).toBe(false);
            expect(result.current.professionalData).toBeNull();
        });

        test('setProfessionalData stores professional profile', () => {
            const { result } = renderHook(() => useProfessional());
            const mockProfessionalData = {
                professional_id: 'pro-123',
                user_id: 'user-123',
                display_name: 'Dr. Jane Smith',
                bio: 'Clinical Psychologist',
                session_price_per_hour: 100,
                subscriber_count: 50,
                follower_count: 200,
                upcoming_session_count: 5,
            };

            act(() => {
                result.current.setProfessionalData(mockProfessionalData);
            });

            expect(result.current.professionalData).toEqual(mockProfessionalData);
        });

        test('markProTermsAccepted updates terms flag', () => {
            const { result } = renderHook(() => useProfessional());

            act(() => {
                result.current.markProTermsAccepted();
            });

            expect(result.current.hasAcceptedProTerms).toBe(true);
        });
    });

    describe('Profile Completion Tracking', () => {
        test('tracks profile completion correctly', () => {
            const { result } = renderHook(() => useAppStore());

            expect(result.current.hasCompletedProfile).toBe(false);

            act(() => {
                result.current.markProfileComplete();
            });

            expect(result.current.hasCompletedProfile).toBe(true);
        });

        test('automatically marks profile complete when user has avatar', () => {
            const { result } = renderHook(() => useAuth());

            act(() => {
                result.current.setUser({
                    email: 'test@example.com',
                    avatar_id: 'avatar-123',
                });
            });

            expect(result.current.hasCompletedProfile).toBe(true);
        });
    });

    describe('User Data Merging', () => {
        test('merges user data instead of replacing', () => {
            const { result } = renderHook(() => useAuth());

            // Set initial user data
            act(() => {
                result.current.setUser({
                    email: 'test@example.com',
                    user_id: '123',
                });
            });

            // Update with partial data
            act(() => {
                result.current.setUser({
                    avatar_id: 'avatar-456',
                });
            });

            // Should have both email and avatar_id
            expect(result.current.user?.email).toBe('test@example.com');
            expect(result.current.user?.avatar_id).toBe('avatar-456');
        });
    });

    describe('Onboarding State Reset', () => {
        test('resetOnboardingState clears all onboarding flags', () => {
            const { result } = renderHook(() => useAppStore());

            // Set some onboarding data
            act(() => {
                result.current.markProfileComplete();
                result.current.markAvatarCreated();
                result.current.markProfessionalCreated();
                result.current.setAvatarId('avatar-123');
            });

            // Reset onboarding
            act(() => {
                result.current.resetOnboardingState();
            });

            expect(result.current.hasCompletedProfile).toBe(false);
            expect(result.current.hasCreatedAvatar).toBe(false);
            expect(result.current.hasCreatedProfessional).toBe(false);
            expect(result.current.avatar.avatarId).toBeNull();
        });
    });

    describe('Complex User Flows', () => {
        test('complete signup to professional creation flow', () => {
            const { result } = renderHook(() => useAppStore());

            // Step 1: Signup and login
            act(() => {
                result.current.setToken('test-token');
                result.current.setUser({
                    user_id: '123',
                    email: 'test@example.com',
                });
            });

            expect(result.current.isAuthenticated).toBe(true);

            // Step 2: Create avatar
            act(() => {
                result.current.setAvatarId('avatar-123');
                result.current.markAvatarCreated();
                result.current.markProfileComplete();
            });

            expect(result.current.hasCreatedAvatar).toBe(true);

            // Step 3: Create professional profile
            act(() => {
                result.current.markProfessionalCreated();
                result.current.setProfessionalData({
                    professional_id: 'pro-123',
                    user_id: '123',
                    display_name: 'Dr. Smith',
                    subscriber_count: 0,
                    follower_count: 0,
                    upcoming_session_count: 0,
                });
            });

            expect(result.current.hasCreatedProfessional).toBe(true);
            expect(result.current.professionalData?.display_name).toBe('Dr. Smith');
        });

        test('logout clears everything including professional data', () => {
            const { result } = renderHook(() => useAppStore());

            // Set up complete user
            act(() => {
                result.current.setToken('test-token');
                result.current.setUser({ email: 'test@example.com' });
                result.current.setAvatarId('avatar-123');
                result.current.markProfessionalCreated();
            });

            // Logout
            act(() => {
                result.current.logout();
            });

            expect(result.current.token).toBeNull();
            expect(result.current.user).toBeNull();
            expect(result.current.avatar.avatarId).toBeNull();
            expect(result.current.hasCreatedProfessional).toBe(false);
        });
    });
});
