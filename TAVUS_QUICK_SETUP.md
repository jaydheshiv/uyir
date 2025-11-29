# Tavus CVI Integration - Quick Setup Checklist

## ✅ Immediate Setup Tasks

### 1. **Get Tavus Account** (5 minutes)
- [ ] Sign up at https://platform.tavus.io/
- [ ] Verify your email
- [ ] Complete onboarding

### 2. **Get API Key** (2 minutes)
- [ ] Navigate to Settings > API Keys
- [ ] Generate new API key
- [ ] Copy API key

### 3. **Update Configuration** (1 minute)
```typescript
// File: src/services/tavusService.ts
// Line 7: Replace with your actual API key
const TAVUS_API_KEY = 'tavus-api-xxxxxxxxxxxxxxxxxxxxxxxx';
```

### 4. **Install Native Dependencies** (iOS only)
```bash
cd ios
pod install
cd ..
```

### 5. **Add Permissions** 

**iOS** - Update `ios/MyFirstApp/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for video calls with AI professionals</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for video calls with AI professionals</string>
```

**Android** - Update `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 🎬 Create Your First Replica

### For Testing (Use Default Tavus Replica)
If you just want to test quickly:

```typescript
// In PublicMicrositePTView.tsx, line 275
// Replace:
const replicaId = professional.replica_id || 'YOUR_DEFAULT_REPLICA_ID';

// With Tavus demo replica ID (if available):
const replicaId = professional.replica_id || 'r_demo_replica_12345';
```

### For Production (Create Real Replica)

1. **Record Training Video**
   - Record 5-10 minutes of video
   - Look directly at camera
   - Good lighting
   - Clear audio
   - Professional speaks naturally

2. **Upload to Accessible URL**
   - Upload to S3, Cloudinary, or similar
   - Make sure URL is publicly accessible
   - Get the direct URL (e.g., `https://mybucket.s3.amazonaws.com/dr-smith-training.mp4`)

3. **Create Replica via API**
```bash
curl --request POST \
  --url https://tavusapi.com/v2/replicas \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: YOUR_API_KEY' \
  --data '{
    "train_video_url": "https://yourbucket.s3.amazonaws.com/training-video.mp4",
    "replica_name": "Dr. Smith AI Twin"
  }'
```

4. **Save replica_id**
Response will include:
```json
{
  "replica_id": "r79e1c033f",
  "status": "processing"
}
```

5. **Update Backend Database**
Add `replica_id` field to professional records:
```sql
ALTER TABLE professionals ADD COLUMN replica_id VARCHAR(50);
UPDATE professionals SET replica_id = 'r79e1c033f' WHERE professional_id = 'prof123';
```

---

## 🧪 Testing Steps

### 1. **Test Without Real Replica** (Mock Mode)
```typescript
// In tavusService.ts, temporarily use test mode:
const request: CreateConversationRequest = {
  replica_id: replicaId,
  test_mode: true,  // ← Add this line
  // ... rest of config
};
```

This creates a conversation but doesn't actually start a call (free for testing).

### 2. **Test on Real Device**
```bash
# iOS
npx react-native run-ios --device

# Android
npx react-native run-android
```

**Note**: Emulators have limited camera/microphone support.

### 3. **Test Flow**
1. Open app
2. Navigate to a professional's profile
3. Click "Twin Window" tab
4. Click "Start Video Call" button
5. Verify loading indicator appears
6. Check console for logs:
   - `🎥 Creating Tavus conversation...`
   - `✅ Tavus conversation created`
   - `🎥 Initializing conversation...`
   - `✅ Joined meeting successfully`

### 4. **Test Controls**
- [ ] Toggle microphone on/off
- [ ] Toggle camera on/off
- [ ] Enable noise cancellation
- [ ] Leave call button

---

## 🔍 Verification Checklist

### Code Integration
- [x] TavusConversation component created
- [x] tavusService.ts created
- [x] PublicMicrositePTView updated with Tavus integration
- [x] Professional interface includes replica_id field
- [ ] API key configured (YOU NEED TO DO THIS)
- [ ] Permissions added to iOS/Android configs (YOU NEED TO DO THIS)

### Backend Requirements
- [ ] Professional model has `replica_id` field
- [ ] API endpoint returns `replica_id` in professional profile
- [ ] Database stores replica IDs

### Testing
- [ ] App builds successfully
- [ ] No TypeScript errors
- [ ] Camera permission prompt appears
- [ ] Microphone permission prompt appears
- [ ] Video call UI renders correctly
- [ ] Call controls work (mic, camera, leave)

---

## 🚨 If Something Goes Wrong

### Build Errors

**"Cannot find module '@daily-co/react-native-daily-js'"**
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

**"Native module not found"**
```bash
# iOS
cd ios
pod deintegrate
pod install
cd ..

# Android
cd android
./gradlew clean
cd ..
```

### Runtime Errors

**"Failed to create conversation"**
- Check API key is correct
- Verify replica_id exists
- Check network connection

**"Cannot access camera/microphone"**
- Grant permissions in device settings
- Check Info.plist / AndroidManifest.xml

**"Video not showing"**
- Test on real device (not emulator)
- Check camera is not being used by another app
- Verify WebRTC is supported

---

## 📞 Quick Start Commands

```bash
# 1. Install dependencies (already done)
npm install

# 2. Install iOS pods
cd ios && pod install && cd ..

# 3. Run on iOS
npx react-native run-ios

# 4. Run on Android
npx react-native run-android

# 5. Check for errors
npm run type-check
```

---

## 🎯 Success Criteria

You've successfully integrated Tavus when:

✅ User can click "Start Video Call" button
✅ Loading indicator shows while connecting
✅ Video interface appears with controls
✅ User can toggle camera on/off
✅ User can toggle microphone on/off
✅ User can leave call and return to chat view
✅ No console errors during call
✅ Call ends gracefully when user leaves

---

## 📱 Next Steps After Basic Setup

1. **Create replicas for all professionals**
2. **Set up webhook endpoint for conversation events**
3. **Add session billing/payment**
4. **Implement conversation history**
5. **Add session rating/feedback**
6. **Configure production API key storage**
7. **Set up monitoring and analytics**

---

## 🔗 Important Links

- **Tavus Dashboard**: https://platform.tavus.io/
- **API Docs**: https://docs.tavus.io/
- **Create Replica API**: https://docs.tavus.io/api-reference/replicas/create-replica
- **Daily.co Docs**: https://docs.daily.co/
- **Support**: support@tavus.io

---

**Estimated Setup Time**: 30 minutes (excluding replica creation)

**Need Help?** Check TAVUS_INTEGRATION_GUIDE.md for detailed explanations.
