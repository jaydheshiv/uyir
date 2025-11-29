import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Types
interface User {
    user_id?: string;
    email?: string;
    mobile?: string;
    avatar_id?: string;
    professional_id?: string;
    [key: string]: any;
}

interface ProfessionalData {
    professional_id: string;
    user_id: string;
    display_name: string;
    bio?: string;
    about?: string;
    session_price_per_hour?: number;
    subscriber_count: number;
    follower_count: number;
    upcoming_session_count: number;
    persona_id?: string; // ✅ Newly added: store persona_id returned by backend
    replica_id?: string;
}

interface AvatarState {
    selectedImages: { [key: string]: string | null };
    uploadedImageIds: { [key: string]: string | null };
    avatarId: string | null;
    avatarUrl: string | null;
    avatarName: string | null;
}

interface AppState {
    // Auth
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;

    // Profile Completion Tracking
    hasCompletedProfile: boolean;
    hasCreatedAvatar: boolean;
    hasCreatedProfessional: boolean;
    hasAcceptedProTerms: boolean;  // ✅ New: Track if user accepted pro upgrade terms
    professionalData: ProfessionalData | null;  // ✅ Store complete professional profile data

    // Avatar
    avatar: AvatarState;

    // Theme
    isDarkMode: boolean;

    // UI
    isLoading: boolean;

    // Actions - Auth
    setToken: (token: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    resetOnboardingState: () => void; // ✅ New: Reset onboarding for new signups

    // Actions - Profile Tracking
    markProfileComplete: () => void;
    markAvatarCreated: () => void;
    markProfessionalCreated: () => void;
    markProfessionalNotCreated: () => void; // ❌ New: Mark professional profile as not created
    markProTermsAccepted: () => void;  // ✅ New: Mark pro terms accepted
    setProfessionalData: (data: ProfessionalData | null) => void;  // ✅ Store professional data

    // Actions - Avatar
    setAvatarImage: (type: string, uri: string) => void;
    setAvatarImageId: (type: string, id: string) => void;
    setAvatarId: (id: string) => void;
    setAvatarUrl: (url: string | null) => void;
    setAvatarName: (name: string | null) => void;
    clearAvatar: () => void;
    syncAvatarFromUser: () => void; // ✅ New: Sync avatar state from current user

    // Actions - Theme
    toggleDarkMode: () => void;
    setDarkMode: (isDark: boolean) => void;

    // Actions - UI
    setLoading: (loading: boolean) => void;

    // Helper to get auth header
    getAuthHeader: () => { Authorization: string } | {};

    // Helper to check if user is new
    isNewUser: () => boolean;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // ============= Initial State =============
            token: null,
            user: null,
            isAuthenticated: false,
            hasCompletedProfile: false,
            hasCreatedAvatar: false,
            hasCreatedProfessional: false,
            hasAcceptedProTerms: false,  // ✅ New: Initially false
            professionalData: null,  // ✅ Initially null
            isDarkMode: false,  // ✅ Dark mode state
            avatar: {
                selectedImages: {},
                uploadedImageIds: {},
                avatarId: null,
                avatarUrl: null,
                avatarName: null,
            },
            isLoading: false,

            // ============= Auth Actions =============
            setToken: (token: string) => {
                console.log('🔐 Zustand: Setting token');
                set({ token, isAuthenticated: !!token });
            },

            setUser: (user: User) => {
                console.log('👤 Zustand: Setting user', user);

                // ✅ CRITICAL: Merge with existing user data instead of replacing
                const currentState = get();
                const existingUser = currentState.user || {};
                const mergedUser = {
                    ...existingUser,  // Keep existing data
                    ...user,          // Merge new data
                };

                console.log('👤 Merging user data:');
                console.log('  - Existing user:', existingUser);
                console.log('  - New user data:', user);
                console.log('  - Merged result:', mergedUser);

                // ✅ CRITICAL: When setting user, sync avatar state with user's data
                // This prevents showing other users' avatar data
                const newAvatarState = {
                    selectedImages: {},
                    uploadedImageIds: {},
                    avatarId: mergedUser.avatar_id || null,
                    avatarUrl: null, // Will be fetched from backend when needed
                    avatarName: mergedUser.avatar_name || null,
                };

                console.log('🔄 Syncing avatar state with user data:', {
                    oldAvatarId: currentState.avatar.avatarId,
                    newAvatarId: mergedUser.avatar_id,
                    userName: mergedUser.avatar_name
                });

                set({
                    user: mergedUser,  // Use merged user data
                    avatar: newAvatarState,
                    // Also update onboarding flags based on user data
                    hasCreatedAvatar: !!mergedUser.avatar_id,
                    hasCompletedProfile: !!mergedUser.avatar_id, // If they have avatar, profile is complete
                    // ✅ CRITICAL: Reset professional flags on login - will be set by checkProfessionalProfile
                    hasCreatedProfessional: false,
                    hasAcceptedProTerms: false,
                    professionalData: null,
                });
            },

            resetOnboardingState: () => {
                console.log('🔄 Zustand: Resetting onboarding state for new user');
                set({
                    hasCompletedProfile: false,
                    hasCreatedAvatar: false,
                    hasCreatedProfessional: false,
                    hasAcceptedProTerms: false,
                    professionalData: null,
                    avatar: {
                        selectedImages: {},
                        uploadedImageIds: {},
                        avatarId: null,
                        avatarUrl: null,
                        avatarName: null,
                    }
                });
            },

            logout: () => {
                console.log('🚪 Zustand: Logging out');
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                    hasCompletedProfile: false,
                    hasCreatedAvatar: false,
                    hasCreatedProfessional: false,
                    avatar: {
                        selectedImages: {},
                        uploadedImageIds: {},
                        avatarId: null,
                        avatarUrl: null,
                        avatarName: null,
                    }
                });
            },

            // ============= Profile Tracking Actions =============
            markProfileComplete: () => {
                console.log('✅ Zustand: Marking profile as complete');
                set({ hasCompletedProfile: true });
            },

            markAvatarCreated: () => {
                console.log('✅ Zustand: Marking avatar as created');
                set({ hasCreatedAvatar: true });
            },

            markProfessionalCreated: () => {
                console.log('✅ Zustand: Marking professional profile as created');
                set({ hasCreatedProfessional: true });
            },

            markProfessionalNotCreated: () => {
                console.log('❌ Zustand: Marking professional profile as not created');
                set({ hasCreatedProfessional: false, professionalData: null });
            },

            markProTermsAccepted: () => {
                console.log('✅ Zustand: Marking pro terms as accepted');
                set({ hasAcceptedProTerms: true });
            },

            setProfessionalData: (data: ProfessionalData | null) => {
                console.log('✅ Zustand: Setting professional data:', data ? data.display_name : 'null');
                set({ professionalData: data });
            },

            // ============= Avatar Actions =============
            setAvatarImage: (type: string, uri: string) => {
                console.log(`🖼️ Zustand: Setting avatar image for ${type}`);
                set((state) => ({
                    avatar: {
                        ...state.avatar,
                        selectedImages: {
                            ...state.avatar.selectedImages,
                            [type]: uri
                        }
                    }
                }));
            },

            setAvatarImageId: (type: string, id: string) => {
                console.log(`🆔 Zustand: Setting avatar image ID for ${type}: ${id}`);
                set((state) => ({
                    avatar: {
                        ...state.avatar,
                        uploadedImageIds: {
                            ...state.avatar.uploadedImageIds,
                            [type]: id
                        }
                    }
                }));
            },

            setAvatarId: (id: string) => {
                console.log(`✨ Zustand: Setting main avatar ID: ${id}`);
                set((state) => ({
                    avatar: {
                        ...state.avatar,
                        avatarId: id
                    },
                    user: {
                        ...state.user,
                        avatar_id: id
                    }
                }));
            },

            setAvatarUrl: (url: string | null) => {
                console.log(`🖼️ Zustand: Setting avatar URL: ${url}`);
                set((state) => ({
                    avatar: {
                        ...state.avatar,
                        avatarUrl: url
                    }
                }));
            },

            setAvatarName: (name: string | null) => {
                console.log(`📝 Zustand: Setting avatar name: ${name}`);
                set((state) => ({
                    avatar: {
                        ...state.avatar,
                        avatarName: name
                    }
                }));
            },

            clearAvatar: () => {
                console.log('🗑️ Zustand: Clearing avatar state');
                set({
                    avatar: {
                        selectedImages: {},
                        uploadedImageIds: {},
                        avatarId: null,
                        avatarUrl: null,
                        avatarName: null,
                    }
                });
            },

            syncAvatarFromUser: () => {
                console.log('🔄 Zustand: Syncing avatar from current user');
                const state = get();
                if (state.user) {
                    set({
                        avatar: {
                            selectedImages: {},
                            uploadedImageIds: {},
                            avatarId: state.user.avatar_id || null,
                            avatarUrl: null, // Will be fetched when needed
                            avatarName: state.user.avatar_name || null,
                        }
                    });
                }
            },

            // ============= Theme Actions =============
            toggleDarkMode: () => {
                console.log('🌙 Zustand: Toggling dark mode');
                set((state) => ({ isDarkMode: !state.isDarkMode }));
            },

            setDarkMode: (isDark: boolean) => {
                console.log(`🌙 Zustand: Setting dark mode to ${isDark}`);
                set({ isDarkMode: isDark });
            },

            // ============= UI Actions =============
            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },

            // ============= Helper Methods =============
            getAuthHeader: () => {
                const token = get().token;
                return token ? { Authorization: `Bearer ${token}` } : {};
            },

            isNewUser: () => {
                const state = get();
                // User is NEW if they haven't completed avatar creation AND profile setup
                // If either hasCreatedAvatar OR hasCompletedProfile is true, they've been through onboarding
                return !(state.hasCreatedAvatar || state.hasCompletedProfile);
            },
        }),
        {
            name: 'app-storage', // AsyncStorage key
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist important data (not UI state)
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                hasCompletedProfile: state.hasCompletedProfile,
                hasCreatedAvatar: state.hasCreatedAvatar,
                hasCreatedProfessional: state.hasCreatedProfessional,
                hasAcceptedProTerms: state.hasAcceptedProTerms,  // ✅ Persist pro terms
                professionalData: state.professionalData,  // ✅ Persist professional data
                isDarkMode: state.isDarkMode,  // ✅ Persist dark mode preference
                avatar: state.avatar,
            }),
        }
    )
);

// Export individual selector hooks to avoid unnecessary re-renders
// Each property should be selected separately
export const useAuth = () => {
    const token = useAppStore((state) => state.token);
    const user = useAppStore((state) => state.user);
    const isAuthenticated = useAppStore((state) => state.isAuthenticated);
    const hasCompletedProfile = useAppStore((state) => state.hasCompletedProfile);
    const setToken = useAppStore((state) => state.setToken);
    const setUser = useAppStore((state) => state.setUser);
    const logout = useAppStore((state) => state.logout);
    const resetOnboardingState = useAppStore((state) => state.resetOnboardingState);
    const getAuthHeader = useAppStore((state) => state.getAuthHeader);
    const isNewUser = useAppStore((state) => state.isNewUser);
    const markProfileComplete = useAppStore((state) => state.markProfileComplete);

    return {
        token,
        user,
        isAuthenticated,
        hasCompletedProfile,
        setToken,
        setUser,
        logout,
        resetOnboardingState,
        getAuthHeader,
        isNewUser,
        markProfileComplete,
    };
};

export const useAvatar = () => {
    const avatar = useAppStore((state) => state.avatar);
    const hasCreatedAvatar = useAppStore((state) => state.hasCreatedAvatar);
    const setAvatarImage = useAppStore((state) => state.setAvatarImage);
    const setAvatarImageId = useAppStore((state) => state.setAvatarImageId);
    const setAvatarId = useAppStore((state) => state.setAvatarId);
    const setAvatarUrl = useAppStore((state) => state.setAvatarUrl);
    const setAvatarName = useAppStore((state) => state.setAvatarName);
    const clearAvatar = useAppStore((state) => state.clearAvatar);
    const syncAvatarFromUser = useAppStore((state) => state.syncAvatarFromUser);
    const markAvatarCreated = useAppStore((state) => state.markAvatarCreated);

    return {
        avatar,
        hasCreatedAvatar,
        setAvatarImage,
        setAvatarImageId,
        setAvatarId,
        setAvatarUrl,
        setAvatarName,
        clearAvatar,
        syncAvatarFromUser,
        markAvatarCreated,
    };
};

export const useProfessional = () => {
    const hasCreatedProfessional = useAppStore((state) => state.hasCreatedProfessional);
    const hasAcceptedProTerms = useAppStore((state) => state.hasAcceptedProTerms);
    const professionalData = useAppStore((state) => state.professionalData);
    const markProfessionalCreated = useAppStore((state) => state.markProfessionalCreated);
    const markProfessionalNotCreated = useAppStore((state) => state.markProfessionalNotCreated); // ❌ New: Selector for marking not created
    const markProTermsAccepted = useAppStore((state) => state.markProTermsAccepted);
    const setProfessionalData = useAppStore((state) => state.setProfessionalData);

    return {
        hasCreatedProfessional,
        hasAcceptedProTerms,
        professionalData,
        markProfessionalCreated,
        markProfessionalNotCreated, // ❌ Include in returned actions
        markProTermsAccepted,
        setProfessionalData,
    };
};
