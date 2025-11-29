# 🎥 LiveKit Video Call - Quick Start

## ✅ Setup Complete!

All LiveKit integration is done. Here's how to test:

---

## 🚀 Quick Test (5 Minutes)

### 1. **Get 2 Devices**
- Option A: 2 physical phones/tablets (BEST)
- Option B: 1 physical + 1 emulator
- Option C: 2 emulators (works but slower)

### 2. **Start Backend**
```bash
# Make sure backend is running
docker-compose up
# OR
python main.py
```

### 3. **Install App**
```bash
# Device 1
npm run android

# Device 2
npm run android  # or run on second physical device
```

### 4. **Log In**
- Device 1: Professional account
- Device 2: Client account

### 5. **Book Session**
```
Device 2 (Client):
1. Navigate to professional's profile
2. Click available time slot
3. Set: start_time = NOW + 2 minutes
4. Confirm booking
5. Go to "All Booked Sessions"
```

### 6. **Start Call**
```
Both Devices:
1. Wait for "Start" button (appears 15 mins before, or immediately if start_time < 15 mins)
2. Click "Start"
3. Grant camera/microphone permissions (first time)
4. See "You are now connected"
```

### 7. **Test Features**
```
✅ See each other's video
✅ Hear each other's audio
✅ Toggle microphone on/off
✅ Toggle camera on/off
✅ Session timer running
✅ Click "End Call" button
```

---

## 📱 Expected Behavior

### **Professional View:**
- Large video: Client's camera
- Small video (top right): Own camera (mirrored)
- Controls: Mic, Camera, End Call, Timer
- Suggestion popup appears after 3 seconds

### **Client View:**
- Large video: Professional's camera
- Small video (top right): Own camera (mirrored)
- Controls: Mic, Camera, End Call, Timer

---

## 🔍 Console Logs

**Good Connection:**
```
🔗 Connecting to LiveKit room: session_12345
🔗 LiveKit URL: wss://uyir-dm431fc1.livekit.cloud
✅ Connected to LiveKit room
```

**Controls Working:**
```
🎤 Mute toggled: true
📹 Video toggled: false
```

**End Call:**
```
👋 Ending call
👋 Disconnected from LiveKit room
```

---

## ⚠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| No Start button | Check session start time (must be ≤ 15 mins away) |
| Can't connect | Verify backend running at localhost:8000 |
| No video | Grant camera permission in device Settings |
| No audio | Grant microphone permission, check volume |
| Black screen | Restart app, check camera not used by another app |

---

## 📂 Files Changed

- ✅ `src/screens/BookedSession.tsx` - Real LiveKit video call
- ✅ `ios/MyFirstApp/Info.plist` - Camera/mic permissions
- ✅ `android/app/src/main/AndroidManifest.xml` - Audio/camera permissions
- ✅ Installed: `@livekit/react-native` + `@livekit/react-native-webrtc`

---

## 📚 Full Documentation

- `LIVEKIT_IMPLEMENTATION_COMPLETE.md` - Complete summary
- `LIVEKIT_TESTING_GUIDE.md` - Detailed testing procedures
- `LIVEKIT_INTEGRATION_SUMMARY.md` - Technical details

---

## 🎉 Success = Both Users See/Hear Each Other!

If you can:
1. ✅ Connect within 5 seconds
2. ✅ See each other's video
3. ✅ Hear each other clearly
4. ✅ Toggle controls working
5. ✅ End call gracefully

**Then your LiveKit integration is working! 🎊**

---

## 🐛 Still Having Issues?

1. Check backend logs
2. Check React Native logs (npm start terminal)
3. Verify LiveKit URL: `wss://uyir-dm431fc1.livekit.cloud`
4. Clear cache: `npm start -- --reset-cache`
5. Restart devices
6. Check `LIVEKIT_TESTING_GUIDE.md` troubleshooting section

---

## 📞 Need 2 Test Accounts?

**Professional Account:**
- Email: professional@test.com
- Password: test123

**Client Account:**
- Email: client@test.com
- Password: test123

*(Use your actual test accounts)*

---

**Ready to test? Start with step 1 above! 🚀**
