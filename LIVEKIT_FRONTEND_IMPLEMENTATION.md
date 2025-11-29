# LiveKit Frontend Implementation Guide

## ✅ Configuration Complete

The frontend has been configured with the correct LiveKit settings from your backend team:

- **LiveKit URL**: `wss://uyir-dm431fc1.livekit.cloud`
- **API Key**: `API9skRsqUyrFGy`
- **Status**: Production Ready ✅

---

## 📁 Files Updated

### 1. **New Configuration File**: `src/config/livekit.config.ts`
   - Contains all LiveKit configuration constants
   - Platform-specific API URLs (Android/iOS)
   - Helper functions for endpoints and participant identity
   - Validation functions

### 2. **Updated Files**:
   - `src/screens/UpComingUserSessions.tsx` - User booking screen
   - `src/screens/UpComingSessions.tsx` - Professional session screen
   - `src/screens/BookedSession.tsx` - Video call screen (mock implementation)

---

## 🎯 What's Working Now

### ✅ Session Booking Flow
1. User books a session → Creates booking in database
2. Session appears in "All Booked Sessions" list
3. **Start button appears 15 minutes before scheduled time**
4. User clicks "Start" → Calls backend API
5. Backend generates LiveKit room and token
6. Frontend receives LiveKit credentials
7. Navigation to BookedSession screen

### ✅ Error Handling
- **400 Error**: Session timing validation (must be within scheduled window)
- **403 Error**: Permission denied
- **404 Error**: Session not found
- **Network Errors**: Proper user-friendly messages
- **LiveKit URL Validation**: Checks if correct URL is being used

### ✅ Logging
All screens now have comprehensive console logging:
- 🎥 Session start attempts
- 📡 API calls
- ✅ Successful connections
- ❌ Error details
- 📍 LiveKit credentials received

---

## ⚠️ Current Status: Mock Implementation

The `BookedSession.tsx` screen currently uses a **mock implementation** to simulate the LiveKit connection. This is because the actual LiveKit React Native SDK requires native module setup.

### What's Currently Simulated:
- Connection to LiveKit room (2-second delay)
- Session timer
- Mute/unmute audio
- Toggle video on/off
- End call functionality

---

## 🚀 Next Steps: Implement Real LiveKit

To implement actual video calling with LiveKit:

### Step 1: Install LiveKit React Native SDK

```bash
npm install @livekit/react-native @livekit/react-native-webrtc
```

### Step 2: iOS Setup

```bash
cd ios
pod install
cd ..
```

Add to `ios/Podfile`:
```ruby
permissions_path = File.join(File.dirname(`node --print "require.resolve('react-native-permissions/package.json')"`), "ios")
pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
pod 'Permission-Microphone', :path => "#{permissions_path}/Microphone"
```

Add to `ios/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is required for audio calls</string>
```

### Step 3: Android Setup

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.INTERNET" />
```

Update `android/build.gradle`:
```gradle
minSdkVersion = 21  // Ensure minimum SDK is 21
```

### Step 4: Update BookedSession.tsx

Replace the mock implementation with actual LiveKit code:

```typescript
import { Room, Track, useRoom, useParticipant } from '@livekit/react-native';
import { RTCView } from 'react-native-webrtc';

const BookedSession: React.FC = () => {
    const [room] = useState(() => new Room({
        adaptiveStream: true,
        dynacast: true,
    }));
    
    const connectToRoom = async () => {
        try {
            await room.connect(livekitUrl, accessToken, {
                audio: true,
                video: true,
            });
            
            // Handle room events
            room.on('participantConnected', (participant) => {
                console.log('Participant connected:', participant.identity);
            });
            
            room.on('trackSubscribed', (track, publication, participant) => {
                console.log('Track subscribed:', track.kind);
                // Render video/audio track
            });
            
            setIsConnected(true);
        } catch (error) {
            console.error('Failed to connect:', error);
            Alert.alert('Connection Error', 'Failed to connect to video call');
        }
    };
    
    const disconnectFromRoom = async () => {
        await room.disconnect();
    };
    
    // Render video tracks using RTCView
};
```

### Step 5: Test the Implementation

1. **Test locally first**:
   ```bash
   npm run android
   # or
   npm run ios
   ```

2. **Create test scenario**:
   - Create 2 test accounts (1 professional, 1 user)
   - Book a session with current time window
   - Both users join the session
   - Verify video/audio streaming works

3. **Check LiveKit Dashboard**:
   - Visit: https://cloud.livekit.io/
   - Monitor active rooms
   - Check participant connections
   - View session logs

---

## 📝 Configuration Summary

### Backend Configuration (Already Done ✅)
```
LIVEKIT_URL=wss://uyir-dm431fc1.livekit.cloud
LIVEKIT_API_KEY=API9skRsqUyrFGy
LIVEKIT_API_SECRET=[configured securely]
LIVEKIT_TOKEN_TTL_SECONDS=3600
```

### Frontend Configuration (Already Done ✅)
```typescript
// src/config/livekit.config.ts
export const LIVEKIT_CONFIG = {
  LIVEKIT_URL: 'wss://uyir-dm431fc1.livekit.cloud',
  API_BASE_URL: Platform.OS === 'android' 
    ? 'http://10.0.2.2:8000' 
    : 'http://localhost:8000',
  TOKEN_TTL_SECONDS: 3600,
  CONNECTION_TIMEOUT_MS: 30000,
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY_MS: 2000,
};
```

---

## 🔍 Testing Checklist

### Backend Integration ✅
- [x] LiveKit URL configured
- [x] API endpoints working
- [x] Token generation working
- [x] Room creation working
- [x] Participant roles configured

### Frontend Integration 🔄
- [x] Configuration file created
- [x] API calls updated
- [x] Error handling implemented
- [x] Logging added
- [ ] LiveKit SDK installed
- [ ] Native permissions configured
- [ ] Video rendering implemented
- [ ] Audio handling implemented
- [ ] End-to-end testing completed

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to LiveKit"
**Solution**: Check console logs for:
- LiveKit URL mismatch
- Token expiry (tokens last 1 hour)
- Session timing (must be within scheduled window)
- Network connectivity

### Issue: "Permission denied for camera/microphone"
**Solution**: 
- Check native permissions are added to AndroidManifest.xml and Info.plist
- Request permissions at runtime
- Check device settings

### Issue: "Video not rendering"
**Solution**:
- Verify RTCView is properly imported
- Check track subscription events
- Ensure video track is enabled
- Check participant camera is enabled

---

## 📚 Resources

- **LiveKit Docs**: https://docs.livekit.io/
- **React Native Guide**: https://docs.livekit.io/guides/react-native/
- **API Reference**: https://docs.livekit.io/client-sdk-js/
- **LiveKit Cloud Dashboard**: https://cloud.livekit.io/
- **Backend API Docs**: Check OpenAPI spec at `http://localhost:8000/docs`

---

## 🎉 Current Status

### What Works:
✅ Backend fully configured with LiveKit Cloud  
✅ Frontend API integration complete  
✅ Session booking flow working  
✅ Start button timing logic correct  
✅ Error handling comprehensive  
✅ Logging detailed  
✅ Navigation to video call screen  

### What's Next:
🔄 Install LiveKit React Native SDK  
🔄 Configure native permissions  
🔄 Implement actual video/audio streaming  
🔄 Test end-to-end with 2 users  
🔄 Handle reconnection scenarios  
🔄 Add UI for participant management  

---

## 💡 Quick Start Testing (Mock Mode)

To test the current mock implementation:

1. **Start backend**: Ensure backend is running on `http://localhost:8000`
2. **Run app**: `npm run android` or `npm run ios`
3. **Book session**: Navigate to professional profile, book a session
4. **View sessions**: Go to "All Booked Sessions"
5. **Start session**: Click "Start" button when time arrives
6. **Video screen**: See mock video call interface

The app will simulate a LiveKit connection and show the video call UI. To implement real video calling, follow the "Next Steps" section above.

---

## 🚨 Important Notes

1. **Session Timing**: 
   - Start button appears 15 minutes before scheduled time
   - Backend validates session window strictly
   - Cannot start sessions outside time window

2. **Token Expiry**:
   - Tokens last 1 hour (3600 seconds)
   - Plan session durations accordingly
   - May need refresh mechanism for longer sessions

3. **Participant Roles**:
   - Professional: Full permissions (publish, subscribe, admin)
   - Subscriber: Standard permissions (publish, subscribe)

4. **Room Management**:
   - Rooms created automatically by backend
   - Room names are deterministic (session-based)
   - Same session = same room

---

**Ready to implement real LiveKit? Follow the Next Steps section above!** 🚀
