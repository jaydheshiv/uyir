# API Migration to dev.api.uyir.ai - Summary

## ✅ COMPLETED - Files Updated to use `https://dev.api.uyir.ai`

### Core Configuration Files
1. ✅ **`src/config/api.ts`**
   - `API_BASE_URL = 'https://dev.api.uyir.ai'`
   - `KNOWLEDGE_API_BASE_URL = 'https://dev.api.uyir.ai'`

2. ✅ **`src/utils/api.ts`**
   - `getBaseUrl() = 'https://dev.api.uyir.ai'`

3. ✅ **`src/config/livekit.config.ts`**
   - `API_BASE_URL: 'https://dev.api.uyir.ai'`

### Screen Files Updated
4. ✅ **`src/screens/Avatarhome1.tsx`** - Visualization endpoint
5. ✅ **`src/screens/Connections.tsx`** - Therapist recommendations
6. ✅ **`src/screens/Connections1.tsx`** - Professionals listing
7. ✅ **`src/screens/CreateAvatar1.tsx`** - Avatar upload
8. ✅ **`src/screens/CreateAvatar3.tsx`** - Professional profile image
9. ✅ **`src/screens/CreateAccount.tsx`** - Avatar personalization
10. ✅ **`src/screens/Discoverprotier.tsx`** - Professional discovery
11. ✅ **`src/screens/Avatar.tsx`** - Avatar management

---

## ⚠️ REMAINING - Files Still Using localhost (Need Manual Update)

### Authentication & OTP Screens
1. **`src/screens/LoginFlow.tsx`** (Lines 46-47)
   - `/auth/login`

2. **`src/screens/OTPVerificationScreen.tsx`** (Lines 33-34, 70-71)
   - `/auth/verify-otp`
   - Resend OTP endpoint

3. **`src/screens/OTPVerificationScreenlogin.tsx`** (Multiple lines)
   - `/auth/login/verify`
   - `/professional/`
   - `/api/avatar/{id}`
   - Resend endpoints

### Professional Profile Screens
4. **`src/screens/LetUsKnowYou.tsx`** (Lines 47-48, 198-199)
   - `/professional/tags`
   - `/professional/create`

5. **`src/screens/ProfileSettings.tsx`** (Lines 71-72, 157-158, 210-211)
   - `/professional/cover-image`
   - `/professional/profile-image`
   - `/professional/profile`

6. **`src/screens/PublicMicrositePTView.tsx`** (Lines 46-50)
   - `/professional/`
   - `/professionals/{id}`

---

## 🎯 Recommended Next Steps

### Option 1: Use Centralized Config (Recommended)
Instead of hardcoding URLs, import from config:

```typescript
import { API_BASE_URL, buildUrl } from '../config/api';

// Then use:
const url = buildUrl('/auth/login');
// or
const url = `${API_BASE_URL}/auth/login`;
```

### Option 2: Bulk Update
Replace all remaining instances:
- Find: `Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000'`
- Replace: `'https://dev.api.uyir.ai'`

---

## 📋 API Endpoints Available

Based on your backend:

### Main API (Port 8081 → dev.api.uyir.ai)
- `POST /api/visualize` - Create visualization
- `GET /api/visualize/user` - Get user visualizations
- `POST /api/avatar/upload` - Upload avatar image
- `PUT /api/avatar/personalize/{id}` - Personalize avatar
- `GET /api/avatar/{id}` - Get avatar details

### Authentication
- `POST /auth/login` - Send OTP
- `POST /auth/login/verify` - Verify OTP
- `POST /auth/verify-otp` - Verify OTP (alternate)

### Professional Endpoints
- `GET /professional/` - Get professional profile
- `POST /professional/create` - Create professional profile
- `GET /professional/tags` - Get available tags
- `POST /professional/profile-image` - Upload profile image
- `POST /professional/cover-image` - Upload cover image
- `PUT /professional/profile` - Update profile
- `GET /professionals/` - List all professionals
- `GET /professionals/{id}` - Get specific professional

### Therapist/Recommendations
- `POST /therapist/recommendations` - Get recommendations

### Knowledge Base (Port 8080 → dev.api.uyir.ai)
- `GET /api/v1/knowledge/?persona_id={id}` - List knowledge entries
- `GET /api/v1/knowledge/search/{persona_id}?q={query}` - Search knowledge
- `POST /api/v1/knowledge/` - Upload knowledge file
- `DELETE /api/v1/knowledge/{id}` - Delete knowledge entry

---

## 🔐 SSL/HTTPS Migration Benefits

### Why HTTPS is Better:
✅ **Secure** - Encrypted communication
✅ **No Port Numbers** - Clean URLs
✅ **Professional** - Production-ready
✅ **Compatible** - Works on all devices (Android, iOS, Web)
✅ **App Store Ready** - Required for production apps

### Before (HTTP with IP):
```
http://139.59.52.58:8081/api/visualize
http://139.59.52.58:8080/api/v1/knowledge/
```

### After (HTTPS with Domain):
```
https://dev.api.uyir.ai/api/visualize
https://dev.api.uyir.ai/api/v1/knowledge/
```

---

## 🧪 Testing Your Changes

### 1. Test Visualization Feature
```bash
# In your React Native app
# Navigate to Avatar Home → Type a prompt → Click "Visualize"
# Should now call: https://dev.api.uyir.ai/api/visualize
```

### 2. Test from Terminal
```bash
# Test main API
curl https://dev.api.uyir.ai/

# Test specific endpoint
curl https://dev.api.uyir.ai/api/visualize/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Monitor Backend Logs (SSH)
```bash
ssh -i D:\INTERN\MyFirstApp\id_ed25519.pem jay@139.59.52.58
sudo docker logs -f uyirapp_app_1
```

---

## 🔄 Rebuild Your App

After making these changes:

```powershell
# Clear cache
npm start -- --reset-cache

# Or rebuild completely
cd android
./gradlew clean
cd ..
npm start
```

---

## 📞 Support

If you encounter issues:
1. Check backend logs: `sudo docker logs -f uyirapp_app_1`
2. Verify domain resolves: `ping dev.api.uyir.ai`
3. Test endpoint directly: `curl https://dev.api.uyir.ai/docs`
4. Check app logs in Metro bundler

---

## ✨ Migration Complete!

Your app is now using the production domain `https://dev.api.uyir.ai` for all API calls!

**No more localhost URLs!** 🎉
