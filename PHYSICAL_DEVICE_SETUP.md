# Physical Device Setup & LiveKit Testing Guide

## Part 1: Installing App on Physical Android Device

### Prerequisites
- Android phone with USB debugging enabled
- USB cable to connect phone to computer
- Android SDK installed (comes with React Native setup)

### Step 1: Enable Developer Options on Your Phone
1. Go to **Settings** → **About Phone**
2. Find **Build Number** and tap it **7 times**
3. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging
1. Go to **Settings** → **System** → **Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB** (if available)

### Step 3: Connect Phone to Computer
1. Connect your Android phone via USB cable
2. On your phone, you'll see a prompt "Allow USB debugging?"
3. Check "Always allow from this computer" and tap **OK**

### Step 4: Verify Device Connection
Open PowerShell in your project directory and run:
```powershell
cd D:\INTERN\MyFirstApp
adb devices
```

You should see something like:
```
List of devices attached
ABC123XYZ    device
```

If you see "unauthorized", check your phone for the USB debugging prompt.

### Step 5: Install and Run on Physical Device

#### Option A: Run directly (Development Build)
```powershell
# Make sure Metro bundler is running in one terminal
npm start

# In another terminal, run:
npx react-native run-android
```

The app will automatically install and launch on your **connected physical device** (if it's the only device connected).

#### Option B: Build APK for Installation

**For Development APK (Debug Build):**
```powershell
cd android
.\gradlew assembleDebug
cd ..
```

The APK will be at:
`android\app\build\outputs\apk\debug\app-debug.apk`

**Install the APK:**
```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

**For Production APK (Release Build):**
```powershell
cd android
.\gradlew assembleRelease
cd ..
```

The APK will be at:
`android\app\build\outputs\apk\release\app-release.apk`

#### Option C: Transfer APK to Phone Manually
1. Build the APK (see Option B)
2. Copy `app-debug.apk` to your phone via USB, email, or cloud storage
3. On your phone, navigate to the APK file
4. Tap to install (you may need to enable "Install from Unknown Sources")

---

## Part 2: Testing LiveKit with Physical Device + Emulator

### Testing Scenario
- **Device 1 (Physical Phone)**: Professional/Therapist account
- **Device 2 (Emulator)**: User/Patient account
- **Goal**: Make a video call between them using LiveKit

### Setup Steps

#### 1. Prepare Two Different User Accounts

You need two separate accounts:

**Account A - Professional (Therapist)**
- Email: `therapist@test.com`
- Should have professional profile set up
- Should have approved sessions

**Account B - User (Patient)**
- Email: `patient@test.com`
- Should have booked a session with the therapist

#### 2. Start Both Devices

**Terminal 1 - Metro Bundler:**
```powershell
npm start
```

**Terminal 2 - Physical Device:**
```powershell
# Make sure phone is connected
adb devices
npx react-native run-android
```

**Terminal 3 - Emulator:**
```powershell
# Start emulator first
emulator -avd <your_avd_name>

# Or use Android Studio to start emulator
# Then run:
npx react-native run-android
```

> **Note**: To run on both devices simultaneously, you may need to use the `--deviceId` flag:

```powershell
# For physical device
npx react-native run-android --deviceId=ABC123XYZ

# For emulator
npx react-native run-android --deviceId=emulator-5554
```

#### 3. Testing LiveKit Video Call Flow

**Step-by-Step Testing:**

1. **On Physical Device (Therapist)**:
   - Login as professional account
   - Navigate to "Upcoming Sessions" or "My Sessions"
   - You should see scheduled sessions with patients

2. **On Emulator (Patient)**:
   - Login as user/patient account
   - Navigate to "My Bookings" (UpComingUserSessions screen)
   - You should see your booked session
   - Tap "Start Session" button when session time arrives

3. **Start the Call (Patient Side)**:
   - When patient taps "Start Session", it calls:
     - `POST /sessions/{session_id}/generate-call-link`
   - This generates a LiveKit room and token
   - Patient is redirected to `VideoCall` screen
   - LiveKit connects to the room

4. **Join the Call (Therapist Side)**:
   - Therapist taps "Start Session" on their side
   - Same API call generates a token for the same room
   - Therapist is redirected to `VideoCall` screen
   - Both participants are now in the same LiveKit room

5. **During the Call**:
   - Both devices should see each other's video
   - Audio should be working both ways
   - Test controls:
     - Mute/Unmute microphone
     - Enable/Disable camera
     - Switch front/back camera (on physical device)
     - End call button

#### 4. Important Configuration Checks

**Check LiveKit Configuration** (`src/config/livekit.config.ts`):
```typescript
export const LIVEKIT_CONFIG = {
  url: 'wss://your-livekit-server.com', // Make sure this is correct
  // ...other settings
};
```

**Check Backend API** (`src/config/api.ts`):
```typescript
export const API_BASE_URL = 'http://dev.api.uyir.ai:8081';
```

**Network Requirements**:
- Both devices must have internet connection
- Physical device must be able to reach:
  - Backend API: `http://dev.api.uyir.ai:8081`
  - LiveKit server: Your LiveKit WebSocket URL
  
- Emulator must be able to reach same endpoints
  - Use `10.0.2.2` instead of `localhost` if backend is on your computer

#### 5. Troubleshooting

**Problem: Physical device can't connect to API**
```powershell
# Check if phone can reach the API
# On your phone, open browser and navigate to:
http://dev.api.uyir.ai:8081

# If it doesn't work, make sure:
# 1. Phone is on same network as backend (if backend is local)
# 2. Firewall allows connections
# 3. API is using actual IP address, not localhost
```

**Problem: "Metro bundler not found"**
- Make sure `npm start` is running before launching app
- Clear cache: `npm start -- --reset-cache`

**Problem: App crashes on physical device**
```powershell
# Check logs
adb logcat | findstr "ReactNative"

# Or more detailed:
adb logcat *:E
```

**Problem: LiveKit connection fails**
- Check LiveKit server is running and accessible
- Verify WebSocket URL is correct (wss://, not ws://)
- Check firewall/network settings
- Look at app console logs for LiveKit errors

**Problem: Can't see remote participant's video**
- Make sure both users are in the same room (same session_id)
- Check that both have camera permissions granted
- Verify LiveKit token generation is working for both users
- Check LiveKit server logs

#### 6. Testing Checklist

- [ ] Physical device connected via ADB
- [ ] Emulator running
- [ ] Metro bundler running
- [ ] App installed on both devices
- [ ] Two different user accounts created
- [ ] Session booked between the two users
- [ ] Both devices can reach backend API
- [ ] Both devices can reach LiveKit server
- [ ] Camera/Microphone permissions granted on both
- [ ] Test video call initiated
- [ ] Both participants can see/hear each other
- [ ] Call controls working (mute, camera, etc.)
- [ ] Call can be ended properly

---

## Part 3: Alternative Testing Methods

### Method 1: Two Physical Devices
- Install on two physical phones
- Each phone logs in with different account
- More realistic testing scenario

### Method 2: Browser + Physical Device
- Use LiveKit browser test app on computer
- Connect to same room from phone
- Good for debugging LiveKit issues

### Method 3: Two Emulators
```powershell
# Start first emulator
emulator -avd Pixel_4_API_30 -port 5554

# Start second emulator (different port)
emulator -avd Pixel_5_API_30 -port 5556

# Install on first emulator
npx react-native run-android --deviceId=emulator-5554

# Install on second emulator
npx react-native run-android --deviceId=emulator-5556
```

---

## Quick Commands Reference

```powershell
# Check connected devices
adb devices

# Install on specific device
adb -s <device_id> install app-debug.apk

# Run on specific device
npx react-native run-android --deviceId=<device_id>

# View logs from specific device
adb -s <device_id> logcat

# Uninstall app
adb uninstall com.myfirstapp

# Start Metro bundler
npm start

# Clear Metro cache
npm start -- --reset-cache

# Build debug APK
cd android && .\gradlew assembleDebug && cd ..

# Build release APK
cd android && .\gradlew assembleRelease && cd ..
```

---

## Network Configuration for Local Development

If your backend is running on your local machine:

**For Emulator:**
- Use `http://10.0.2.2:8081` instead of `localhost:8081`

**For Physical Device:**
- Use your computer's actual IP address: `http://192.168.x.x:8081`
- Find your IP: `ipconfig` in PowerShell
- Make sure phone and computer are on same WiFi network

**Example Update in `src/config/api.ts`:**
```typescript
// For physical device testing with local backend
export const API_BASE_URL = 'http://192.168.1.100:8081'; // Your computer's IP
```

---

## Additional Tips

1. **Keep Metro Bundler Running**: Always have `npm start` running in a separate terminal
2. **Reload App**: Shake physical device and tap "Reload" to refresh code changes
3. **Debug Menu**: Shake device → "Debug" to open Chrome debugger
4. **Console Logs**: Use `adb logcat` to see console.log outputs from app
5. **Hot Reload**: Enable "Fast Refresh" in dev menu for automatic updates

Good luck with your LiveKit testing! 🚀
