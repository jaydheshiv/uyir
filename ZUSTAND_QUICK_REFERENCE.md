# Zustand Quick Reference 🚀

## Import Hooks

```typescript
import { useAuth, useAvatar, useAppStore } from '../store/useAppStore';
```

---

## 🔐 Authentication

### Get Token
```typescript
const { token, isAuthenticated } = useAuth();
```

### Save Token (After Login/Signup)
```typescript
const { setToken, setUser } = useAuth();

// After OTP verification
setToken(data.token);
setUser(data.user);
```

### Logout
```typescript
const { logout } = useAuth();
logout(); // Clears token, user, and avatar state
```

### Get Auth Header
```typescript
const { getAuthHeader } = useAuth();
const headers = getAuthHeader(); // Returns { Authorization: "Bearer ..." }
```

---

## 🖼️ Avatar State

### Get Avatar Data
```typescript
const { avatar } = useAvatar();

// Access properties
avatar.avatarId           // Main avatar ID
avatar.selectedImages     // { happy: "uri...", calm: "uri..." }
avatar.uploadedImageIds   // { happy: "id123", calm: "id456" }
```

### Set Avatar Image (Local Preview)
```typescript
const { setAvatarImage } = useAvatar();
setAvatarImage('happy', imageUri);
```

### Set Avatar Image ID (After Upload)
```typescript
const { setAvatarImageId } = useAvatar();
setAvatarImageId('happy', 'uploaded-image-id-123');
```

### Set Main Avatar ID
```typescript
const { setAvatarId } = useAvatar();
setAvatarId('avatar-uuid-from-backend');
```

### Clear Avatar State
```typescript
const { clearAvatar } = useAvatar();
clearAvatar(); // Resets all avatar data
```

---

## 🌐 API Calls with Token

### Option 1: Use Token Directly
```typescript
const { token } = useAuth();

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

### Option 2: Use Auth Header Helper
```typescript
const { token, getAuthHeader } = useAuth();

const response = await fetch(url, {
  method: 'POST',
  headers: {
    ...getAuthHeader(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

## 🎯 Common Patterns

### Check if User is Authenticated
```typescript
const { isAuthenticated, token } = useAuth();

useEffect(() => {
  if (!isAuthenticated) {
    navigation.navigate('LoginFlow');
  }
}, [isAuthenticated]);
```

### Access Full Store
```typescript
const store = useAppStore();

// Access everything
console.log(store.token);
console.log(store.user);
console.log(store.avatar);
console.log(store.isLoading);

// Call actions
store.setToken('new-token');
store.setLoading(true);
```

### Selective Updates (Optimized)
```typescript
// Only re-renders when token changes
const token = useAppStore((state) => state.token);

// Only re-renders when avatar.avatarId changes
const avatarId = useAppStore((state) => state.avatar.avatarId);
```

---

## 📦 Store Structure

```
useAppStore
├── token: string | null
├── user: User | null
├── isAuthenticated: boolean
├── avatar
│   ├── selectedImages: { [key: string]: string | null }
│   ├── uploadedImageIds: { [key: string]: string | null }
│   └── avatarId: string | null
├── isLoading: boolean
└── Actions
    ├── setToken(token)
    ├── setUser(user)
    ├── logout()
    ├── setAvatarImage(type, uri)
    ├── setAvatarImageId(type, id)
    ├── setAvatarId(id)
    ├── clearAvatar()
    ├── setLoading(loading)
    └── getAuthHeader()
```

---

## 🔄 State Flow Examples

### Login Flow
```typescript
// 1. OTPVerificationScreenlogin.tsx
const { setToken, setUser } = useAuth();

const response = await fetch('/auth/login/verify', { ... });
const data = await response.json();

setToken(data.token);        // ✅ Saved to Zustand + AsyncStorage
setUser(data.user);          // ✅ Saved to Zustand + AsyncStorage

// 2. Any other screen
const { token } = useAuth(); // ✅ Token available immediately!
```

### Avatar Upload Flow
```typescript
// 1. CreateAvatar1.tsx
const { token } = useAuth();
const { setAvatarImage, setAvatarId } = useAvatar();

// Upload image
setAvatarImage('happy', localUri);     // Show preview
const response = await fetch('/api/avatar/upload', { ... });
setAvatarId(response.data.avatar_id);  // ✅ Stored in Zustand

// 2. CreateAccount.tsx (NO navigation params!)
const { avatar } = useAvatar();
const avatarId = avatar.avatarId;      // ✅ Available automatically!
```

---

## 🐛 Debugging

### View Current State
```typescript
const store = useAppStore.getState();
console.log('Full State:', store);
```

### Subscribe to Changes
```typescript
useAppStore.subscribe((state) => {
  console.log('State Changed:', state);
});
```

### Check Logs
Look for these emojis in console:
- 🔐 Token operations
- 👤 User operations
- 🖼️ Avatar image operations
- 🆔 Avatar ID operations
- ✨ Main avatar ID operations
- 🚪 Logout operations
- 🗑️ Clear operations

---

## ⚡ Performance Tips

### Use Selective Selectors
```typescript
// ❌ Bad - Re-renders on any state change
const store = useAppStore();

// ✅ Good - Only re-renders when token changes
const token = useAppStore((state) => state.token);
```

### Use Provided Hooks
```typescript
// ✅ Best - Optimized hooks
const { token, user } = useAuth();
const { avatar } = useAvatar();
```

---

## 🎨 TypeScript

### User Type
```typescript
interface User {
  user_id?: string;
  email?: string;
  mobile?: string;
  avatar_id?: string;
  professional_id?: string;
  [key: string]: any;
}
```

### Avatar State Type
```typescript
interface AvatarState {
  selectedImages: { [key: string]: string | null };
  uploadedImageIds: { [key: string]: string | null };
  avatarId: string | null;
}
```

---

## 📝 Cheat Sheet

| Task | Code |
|------|------|
| Get token | `const { token } = useAuth()` |
| Save token | `setToken(token)` |
| Get avatar ID | `const { avatar } = useAvatar()` → `avatar.avatarId` |
| Set avatar ID | `setAvatarId(id)` |
| Check auth | `const { isAuthenticated } = useAuth()` |
| Logout | `logout()` |
| Get auth header | `getAuthHeader()` |
| Clear avatar | `clearAvatar()` |

---

**Quick Start:** Import hook → Destructure what you need → Use it! 🎉
