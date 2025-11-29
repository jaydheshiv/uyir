# 🔄 Returning User Detection Flow

## Overview
The app now intelligently detects returning users and skips onboarding screens they've already completed, providing a seamless experience.

## How It Works

### 1. **Profile Completion Tracking**
Three boolean flags in Zustand store track onboarding progress:
- `hasCompletedProfile`: User finished basic profile setup
- `hasCreatedAvatar`: User created and personalized their avatar
- `hasCreatedProfessional`: User completed professional profile

### 2. **Automatic Persistence**
All flags are automatically saved to AsyncStorage via Zustand's persist middleware. They survive:
- ✅ App restarts
- ✅ Device reboots
- ✅ App updates (as long as storage isn't cleared)

### 3. **Smart Navigation Logic**

#### Login Flow (OTPVerificationScreenlogin.tsx)
```typescript
if (isNewUser()) {
  // hasCompletedProfile is false → First time user
  navigation.navigate('GrantedScreen'); // Start onboarding
} else {
  // hasCompletedProfile is true → Returning user
  navigation.navigate('Home'); // Skip directly to main app
}
```

#### Signup Flow (OTPVerificationScreen.tsx)
```typescript
// Always navigate to BasicDetails for new signups
navigation.navigate('BasicDetails'); 
```

## Profile Completion Markers

### Avatar Creation (CreateAvatar1.tsx)
```typescript
// After successful avatar upload
setAvatarImage(imageUri);
setAvatarImageId(response.data.image_id);
setAvatarId(response.data.avatar_id);
// No marker here - wait until personalization is complete
```

### Profile Setup (CreateAccount.tsx)
```typescript
// After successful avatar personalization
markAvatarCreated();      // Avatar is fully set up
markProfileComplete();    // Basic profile is complete
```

### Professional Profile (LetUsKnowYou.tsx)
```typescript
// After successful professional profile creation
markProfessionalCreated(); // Professional details added
```

## User Journey

### 🆕 New User Journey
1. **Signup/Login** → OTP Verification
2. **isNewUser() = true** → Navigate to GrantedScreen
3. **Onboarding Flow**:
   - GrantedScreen (welcome)
   - CreateAvatar1 (upload photo)
   - CreateAccount (personalize avatar) → `markProfileComplete()`
   - LetUsKnowYou (professional details) → `markProfessionalCreated()`
4. **Complete** → Navigate to main app

### 👤 Returning User Journey
1. **Login** → OTP Verification
2. **isNewUser() = false** → Navigate to Home
3. **Done** → Skip all onboarding, go straight to main app

## Using the Hooks

### In Components
```typescript
import { useAuth } from '../store/useAppStore';

const MyComponent = () => {
  const { isNewUser, hasCompletedProfile, markProfileComplete } = useAuth();

  // Check if user is new
  if (isNewUser()) {
    console.log('First time user!');
  }

  // Check specific completion status
  if (hasCompletedProfile) {
    console.log('User has completed basic setup');
  }

  // Mark profile as complete
  const handleComplete = () => {
    markProfileComplete();
  };
};
```

### Available Hooks
```typescript
// Auth + Profile Tracking
const { 
  isNewUser,               // () => boolean - Check if user is new
  hasCompletedProfile,     // boolean - Basic profile completed
  markProfileComplete,     // () => void - Mark profile complete
} = useAuth();

// Avatar Tracking
const {
  hasCreatedAvatar,        // boolean - Avatar created
  markAvatarCreated,       // () => void - Mark avatar created
} = useAvatar();

// Professional Tracking
const {
  hasCreatedProfessional,  // boolean - Professional profile created
  markProfessionalCreated, // () => void - Mark professional complete
} = useProfessional();
```

## Testing

### Test New User Flow
1. Clear app data: 
   - Android: Settings → Apps → MyFirstApp → Clear Data
   - iOS: Uninstall and reinstall
2. Sign up with new account
3. Verify navigation goes through full onboarding
4. Check console logs for `🆕 New user - navigating to onboarding`

### Test Returning User Flow
1. Complete onboarding once (don't clear data)
2. Log out and log back in
3. Verify navigation skips to Home screen
4. Check console logs for `👤 Returning user - skipping to home`

### Test Interrupted Onboarding
1. Start onboarding but close app before completing
2. Reopen app and log in
3. Flags show partial completion:
   - `hasCreatedAvatar: false` → User hasn't finished avatar
   - `hasCompletedProfile: false` → User hasn't finished profile

## Console Logs

Look for these emoji markers in console:
- `🆕 New user - navigating to onboarding` - First time user detected
- `👤 Returning user - skipping to home` - Returning user detected
- `✅ Profile completion marked` - Profile marked complete
- `✅ Avatar creation marked` - Avatar marked complete
- `✅ Professional profile marked` - Professional details marked complete

## Resetting Profile Status

### Programmatically
```typescript
const { logout } = useAuth();
logout(); // Clears all flags and token
```

### Manually
- Delete AsyncStorage data for the app
- OR clear app data from device settings
- OR uninstall/reinstall the app

## Future Enhancements

### Granular Resume
Currently, `isNewUser()` checks only `hasCompletedProfile`. You could enhance it to resume at exact step:
```typescript
// Resume at specific onboarding step
const getNextOnboardingScreen = () => {
  if (!hasCreatedAvatar) return 'CreateAvatar1';
  if (!hasCompletedProfile) return 'CreateAccount';
  if (!hasCreatedProfessional) return 'LetUsKnowYou';
  return 'Home'; // All complete
};
```

### Profile Completion Percentage
```typescript
const getProfileCompletion = () => {
  const steps = [hasCreatedAvatar, hasCompletedProfile, hasCreatedProfessional];
  const completed = steps.filter(Boolean).length;
  return (completed / steps.length) * 100;
};
```

### Profile Update Detection
Track when user updates their profile after initial completion:
```typescript
profileLastUpdated: null as Date | null,
updateProfile: () => {
  set({ profileLastUpdated: new Date() });
}
```

## Troubleshooting

### User Always Goes to Onboarding
- Check: `hasCompletedProfile` flag in AsyncStorage
- Debug: Add `console.log('isNewUser:', isNewUser(), 'hasCompleted:', hasCompletedProfile)`
- Solution: Ensure `markProfileComplete()` is called in CreateAccount.tsx

### User Always Skips Onboarding
- Check: Profile flags might be true from previous session
- Debug: Log all flags: `console.log(useAuth.getState())`
- Solution: Clear AsyncStorage data for testing

### Flags Not Persisting
- Check: Zustand persist middleware is configured correctly
- Debug: Look for AsyncStorage errors in console
- Solution: Verify `partialize` includes all profile flags

## Architecture Benefits

✅ **Single Source of Truth**: All profile state in one Zustand store
✅ **Automatic Persistence**: No manual AsyncStorage calls needed
✅ **Type Safety**: TypeScript ensures correct usage
✅ **Scalable**: Easy to add more profile completion stages
✅ **Testable**: Clear functions to mock in tests
✅ **Performance**: Synchronous access, no async/await overhead
