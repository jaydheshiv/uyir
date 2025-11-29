# User Authentication & Onboarding Flow

## Instagram-Style User Experience

### 🆕 New User Flow (First Time Signup)

```
1. CreateAccountScreen (Signup Form)
   ↓ Enter email/mobile
   ↓ Click "Create Account"
   
2. OTPVerificationScreen (Signup OTP)
   ↓ Enter 4-digit OTP
   ↓ Verify
   ↓ Token saved ✅
   ↓ User marked as NEW (no avatar_id)
   
3. GrantedScreen (Welcome)
   ↓ "Account Granted" message
   ↓ Click Continue
   
4. CreateAvatar1 (Upload Avatar - Instagram Style)
   ↓ Upload profile photo
   ↓ API: POST /api/avatar/upload
   ↓ Mark: hasCreatedAvatar = true ✅
   
5. CreateAccount (Profile Details)
   ↓ Fill: Name, Date of Birth, About Me
   ↓ API: PUT /api/avatar/personalize/{avatar_id}
   ↓ Mark: hasCompletedProfile = true ✅
   
6. Avatarhome1 (Main App)
   ✅ User is now fully onboarded
```

---

### 👤 Returning User Flow (Login)

```
1. LoginFlow (Login Form)
   ↓ Enter email/mobile + password
   ↓ Click "Continue"
   
2. OTPVerificationScreenlogin (Login OTP)
   ↓ Enter 4-digit OTP
   ↓ Verify
   ↓ Token saved ✅
   ↓ Backend returns user data with avatar_id
   ↓ Detect: userData.avatar_id exists
   ↓ Mark: hasCreatedAvatar = true ✅
   ↓ Mark: hasCompletedProfile = true ✅
   ↓ isNewUser() returns FALSE
   
3. Avatarhome1 (Main App)
   ✅ Skip all onboarding - go straight to app!
```

---

## State Management (Zustand)

### Profile Completion Tracking Flags

```typescript
interface AppState {
  hasCompletedProfile: boolean;    // ✅ User filled profile details
  hasCreatedAvatar: boolean;       // ✅ User uploaded avatar
  hasCreatedProfessional: boolean; // ✅ User created pro profile (optional)
  hasAcceptedProTerms: boolean;    // ✅ User accepted pro upgrade (optional)
}
```

### Key Logic: isNewUser()

```typescript
isNewUser: () => {
  const state = get();
  // User is NEW if they haven't completed avatar AND profile
  // If either flag is true, they've been through onboarding
  return !(state.hasCreatedAvatar || state.hasCompletedProfile);
}
```

### Backend Integration

**On Login OTP Verification:**
```typescript
// Check if backend returns avatar_id
if (userData.avatar_id) {
  markAvatarCreated();      // ✅ Set hasCreatedAvatar = true
  markProfileComplete();    // ✅ Set hasCompletedProfile = true
}

// Smart routing
if (isNewUser()) {
  navigate('GrantedScreen');  // New user → onboarding
} else {
  navigate('Avatarhome1');    // Returning user → main app
}
```

---

## Screen Details

### CreateAvatar1 (Instagram-Style Photo Upload)
- **Purpose**: Upload profile avatar (like Instagram signup)
- **API**: `POST /api/avatar/upload`
- **Success Action**: 
  - Saves `avatarId` to Zustand
  - Marks `hasCreatedAvatar = true`
  - Navigates to `CreateAccount`

### CreateAccount (Profile Details)
- **Purpose**: Fill name, DOB, about me
- **API**: `PUT /api/avatar/personalize/{avatar_id}`
- **Success Action**:
  - Marks `hasCompletedProfile = true`
  - Marks `hasCreatedAvatar = true`
  - Navigates to `Avatarhome1`

### Avatarhome1 (Main App)
- **Purpose**: Main application screen
- **Access**: 
  - New users: After completing onboarding
  - Returning users: Immediately after login

---

## Persistence

All flags persist to AsyncStorage via Zustand middleware:
```typescript
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'app-storage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      token: state.token,
      user: state.user,
      hasCompletedProfile: state.hasCompletedProfile,
      hasCreatedAvatar: state.hasCreatedAvatar,
      // ... other flags
    })
  }
)
```

**This means:**
- ✅ Onboarding completion survives app restarts
- ✅ User stays logged in
- ✅ Returning users never see onboarding again

---

## Console Logs for Debugging

### New User Flow:
```
✅ Token saved to Zustand: eyJhbGciOiJIUzI1NiIs...
✅ User data saved to Zustand: {user_id: "...", email: "..."}
🆕 New user - navigating to onboarding
🖼️ Zustand: Setting avatar image for happiest
✅ Zustand: Marking avatar as created
✅ Zustand: Marking profile as complete
```

### Returning User Flow:
```
✅ Token saved to Zustand: eyJhbGciOiJIUzI1NiIs...
✅ User data saved to Zustand: {user_id: "...", avatar_id: "..."}
✅ User has avatar_id, marking as returning user
👤 Returning user - navigating to Avatarhome1
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/store/useAppStore.ts` | Zustand store with profile tracking |
| `src/screens/OTPVerificationScreenlogin.tsx` | Login OTP + smart routing |
| `src/screens/OTPVerificationScreen.tsx` | Signup OTP |
| `src/screens/CreateAvatar1.tsx` | Avatar upload (Instagram style) |
| `src/screens/CreateAccount.tsx` | Profile details form |
| `src/screens/Avatarhome1.tsx` | Main app screen |

---

## Testing Checklist

### Test New User (First Time):
- [ ] Signup with new email/mobile
- [ ] Verify OTP
- [ ] See GrantedScreen welcome
- [ ] Upload avatar photo
- [ ] Fill profile details
- [ ] Land on Avatarhome1
- [ ] Console shows: `🆕 New user - navigating to onboarding`

### Test Returning User:
- [ ] Logout
- [ ] Login with same credentials
- [ ] Verify OTP
- [ ] Skip directly to Avatarhome1 (NO onboarding)
- [ ] Console shows: `👤 Returning user - navigating to Avatarhome1`

### Test Persistence:
- [ ] Complete onboarding as new user
- [ ] Force quit app
- [ ] Relaunch app
- [ ] Login again
- [ ] Should skip to Avatarhome1 (flags persisted)

---

## Summary

✅ **Instagram-style flow implemented**
- New users: Guided through avatar upload and profile setup
- Returning users: Direct access to main app
- Backend-driven detection via `avatar_id`
- Persistent state across app restarts
- Clean, intuitive user experience

🎯 **Zero configuration needed** - works automatically based on user data from backend!
