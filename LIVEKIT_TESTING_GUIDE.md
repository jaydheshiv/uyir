# LiveKit Video Call Testing Guide

## Prerequisites
- ✅ LiveKit SDK installed (`@livekit/react-native` + `@livekit/react-native-webrtc`)
- ✅ Native permissions configured (iOS Info.plist + Android Manifest)
- ✅ BookedSession.tsx updated with real LiveKit integration
- ✅ Backend running with LiveKit Cloud credentials
- 🔧 2 test devices OR 1 physical device + 1 emulator

## Testing Scenarios

### 🎯 Scenario 1: Two Physical Devices (Recommended)

**Why recommended:** Most realistic testing environment, tests actual camera/microphone hardware and network conditions.

#### Setup:
1. **Device 1 (Professional Account)**
   - Install the app on first physical device
   - Log in as a professional account
   - Go to "Upcoming Sessions" screen

2. **Device 2 (Client Account)**
   - Install the app on second physical device
   - Log in as a client account
   - Book a session with the professional from Device 1
   - Go to "All Booked Sessions" screen

#### Test Steps:
1. **Book Session** (Device 2 - Client)
   ```
   - Navigate to professional's profile
   - Select an available time slot (set it 2-3 minutes in the future)
   - Confirm booking
   - Verify session appears in "All Booked Sessions"
   ```

2. **Wait for Start Time**
   ```
   - Both devices should show the session in upcoming sessions
   - 15 minutes before start time, Start button should appear
   - For quick testing: Book session with start_time = current time + 2 minutes
   ```

3. **Start Video Call - Professional** (Device 1)
   ```
   - Click "Start" button on the session
   - Grant camera/microphone permissions if prompted
   - Should see "You are now connected" screen
   - Should see own video in small window (top right)
   - Should see placeholder waiting for other participant
   ```

4. **Join Video Call - Client** (Device 2)
   ```
   - Click "Start" button on the same session
   - Grant camera/microphone permissions if prompted
   - Should see "You are now connected" screen
   - Should see professional's video in large window
   - Should see own video in small window (top right)
   ```

5. **Test Video/Audio Controls**
   ```
   Professional (Device 1):
   - Toggle microphone on/off → Client should hear/not hear
   - Toggle camera on/off → Client should see video disappear/appear
   
   Client (Device 2):
   - Toggle microphone on/off → Professional should hear/not hear
   - Toggle camera on/off → Professional should see video disappear/appear
   ```

6. **Test Session Timer**
   ```
   - Verify timer starts from 00:00 on both devices
   - Check timer increments every second
   - Timers should be in sync (±1-2 seconds acceptable)
   ```

7. **Test Suggestions Modal** (Professional only)
   ```
   - After 3 seconds, suggestion popup should appear
   - Click suggestions to test interaction
   - Close modal with chevron button
   ```

8. **End Call**
   ```
   - Click red end call button (center)
   - Should disconnect gracefully
   - Should navigate back to previous screen
   - Other participant should see disconnection
   ```

---

### 🎯 Scenario 2: Physical Device + Emulator

**When to use:** Only 1 physical device available, or testing platform-specific issues.

#### Setup:
1. **Physical Device (Professional)**
   - Install app on phone/tablet
   - Connect to same Wi-Fi as your computer
   - Log in as professional

2. **Android Emulator (Client)**
   - Run: `npm run android` in terminal
   - Log in as client
   - Emulator can access backend at `http://10.0.2.2:8000`

#### Important Notes:
- ⚠️ Emulator camera uses simulated/webcam input
- ⚠️ Audio quality may be poor in emulator
- ⚠️ Network latency will be lower (both on same machine)
- ✅ Good for testing UI and basic connectivity

#### Test Steps:
Follow same steps as Scenario 1, but be aware of limitations:
- Emulator video may show black screen or webcam feed
- Audio may echo or have artifacts
- Focus testing on: connection flow, UI behavior, disconnection handling

---

### 🎯 Scenario 3: Two Emulators (Not Recommended)

**Why not recommended:** Very resource-intensive, poor video/audio quality, doesn't test real hardware.

**Only use for:** Testing multi-platform (Android + iOS) simultaneously.

#### Setup:
1. Terminal 1: `npm run android` → Android Emulator
2. Terminal 2: `npm run ios` → iOS Simulator

#### Limitations:
- Both emulators running = high CPU/RAM usage
- Slow performance may cause false failures
- Audio/video quality will be very poor
- Network conditions unrealistic

---

## Test Checklist

### ✅ Connection Tests
- [ ] Professional can start session
- [ ] Client can join session
- [ ] Both see "You are now connected" message
- [ ] Connection established within 5 seconds
- [ ] No error alerts during connection

### ✅ Video Tests
- [ ] Professional sees own video (mirrored, top right)
- [ ] Client sees own video (mirrored, top right)
- [ ] Professional sees client's video (large view)
- [ ] Client sees professional's video (large view)
- [ ] Video toggle works for both participants
- [ ] Video placeholder shows when camera off

### ✅ Audio Tests
- [ ] Professional can hear client
- [ ] Client can hear professional
- [ ] Microphone toggle works for both
- [ ] No echo or feedback
- [ ] Clear audio quality

### ✅ UI Tests
- [ ] Session timer displays correctly
- [ ] Timer increments every second
- [ ] Suggestion modal appears after 3 seconds (professional)
- [ ] Video control buttons are responsive
- [ ] End call button works
- [ ] Navigation works after call ends

### ✅ Error Handling
- [ ] Graceful handling if one participant disconnects
- [ ] Proper error message if network fails
- [ ] Can end call even if connection lost
- [ ] No app crashes during testing

---

## Quick Test Script (5 Minutes)

**For rapid testing during development:**

1. **Setup** (1 min)
   ```
   - Use 2 physical devices OR 1 device + 1 emulator
   - Professional logged in on Device 1
   - Client logged in on Device 2
   ```

2. **Book Session** (1 min)
   ```
   - Client books session with start_time = NOW + 2 minutes
   - Both devices show session in upcoming list
   ```

3. **Start & Join** (1 min)
   ```
   - Wait for Start button to appear (15 mins before, or immediately if start_time < 15 mins away)
   - Professional clicks Start
   - Client clicks Start
   - Both connected within 5 seconds
   ```

4. **Quick Checks** (2 min)
   ```
   - ✅ See each other's video
   - ✅ Toggle mic on Device 1 → Device 2 hears change
   - ✅ Toggle camera on Device 2 → Device 1 sees change
   - ✅ Timer running
   - ✅ End call button works
   ```

---

## Troubleshooting

### Issue: "Cannot connect" error
**Solutions:**
- Verify backend is running (`http://localhost:8000/docs`)
- Check LiveKit URL in config: `wss://uyir-dm431fc1.livekit.cloud`
- Ensure access token is valid (check console logs)
- Try restarting backend

### Issue: No Start button appearing
**Solutions:**
- Check session start_time (must be within 15 minutes or past)
- Reload the screen (pull to refresh)
- Verify session exists in backend database
- Check console logs for API errors

### Issue: Black screen / No video
**Solutions:**
- Grant camera permissions (check Settings → App → Permissions)
- Try toggling camera off and on
- Restart the app
- Check if camera is being used by another app

### Issue: No audio / Can't hear
**Solutions:**
- Grant microphone permissions
- Check device volume (not muted)
- Toggle microphone off and on
- Check AudioSession configuration in code
- Try using headphones/Bluetooth to isolate issue

### Issue: One participant can't join
**Solutions:**
- Verify both using same `roomName` (check console logs)
- Check that both have valid tokens
- Ensure backend generated tokens for both participants
- Try disconnecting and reconnecting

### Issue: Poor video quality
**Solutions:**
- Check network speed (both devices on good Wi-Fi)
- LiveKit automatically adjusts quality based on bandwidth
- Physical devices will have better quality than emulators
- Try reducing participants (2 max recommended for testing)

---

## Console Log Monitoring

Watch these logs during testing:

### Successful Connection:
```
🔗 Connecting to LiveKit room: session_12345
🔗 LiveKit URL: wss://uyir-dm431fc1.livekit.cloud
🔗 Participant: professional_67890
🔗 Token length: 234
✅ Connected to LiveKit room
```

### Successful Video Toggle:
```
📹 Video toggled: false
(video should turn off)
📹 Video toggled: true
(video should turn on)
```

### Successful Mic Toggle:
```
🎤 Mute toggled: true
(mic should mute)
🎤 Mute toggled: false
(mic should unmute)
```

### Expected on Disconnect:
```
👋 Ending call
👋 Disconnected from LiveKit room
```

---

## Advanced Testing

### Network Condition Testing
1. Enable airplane mode on one device → Should show connection error
2. Switch between Wi-Fi and mobile data → Should reconnect automatically
3. Introduce network lag (use Network Link Conditioner on iOS) → Video should adapt quality

### Permission Testing
1. Revoke camera permission mid-call → Should show placeholder
2. Revoke microphone permission → Should mute automatically
3. Deny permissions initially → Should show permission request

### Edge Cases
1. End call from professional side → Client should disconnect
2. End call from client side → Professional should disconnect
3. Both click end simultaneously → Both should disconnect gracefully
4. Start call without backend running → Should show error alert

---

## Success Criteria

**Your implementation is working correctly if:**
- ✅ Can establish video call between 2 users within 5 seconds
- ✅ Both participants see each other's video clearly
- ✅ Audio works bidirectionally with no echo
- ✅ All controls (mute, video toggle, end call) work reliably
- ✅ Session timer is accurate
- ✅ Graceful disconnection with no crashes
- ✅ Proper error messages for connection failures

**Ready for production when:**
- ✅ Tested on multiple physical devices (Android + iOS)
- ✅ Tested on different network conditions (Wi-Fi, 4G, 5G)
- ✅ Tested with various camera/microphone hardware
- ✅ All edge cases handled gracefully
- ✅ No memory leaks after multiple sessions
- ✅ Backend health check returns success
- ✅ LiveKit dashboard shows successful connections

---

## Post-Testing Checklist

After successful testing:
- [ ] Document any bugs found
- [ ] Update backend if any API changes needed
- [ ] Optimize video quality settings if needed
- [ ] Add analytics/logging for production monitoring
- [ ] Create user documentation for video call feature
- [ ] Plan for scaling (concurrent sessions)
- [ ] Set up LiveKit Cloud production plan (if using free tier)

---

## Need Help?

**Check these resources:**
- LiveKit React Native Docs: https://docs.livekit.io/guides/react-native/
- LiveKit Cloud Dashboard: https://cloud.livekit.io/
- Backend API Docs: http://localhost:8000/docs
- Project Documentation: `LIVEKIT_INTEGRATION_SUMMARY.md`

**Common Commands:**
```bash
# Rebuild Android
npm run android

# Rebuild iOS (Mac only)
npm run ios

# Check backend health
curl http://localhost:8000/health

# View backend logs
docker logs <backend_container_id>

# Clear React Native cache
npm start -- --reset-cache
```

---

## Next Steps

Once testing is successful:
1. **Production Deployment**
   - Update LiveKit credentials for production
   - Configure proper token expiration
   - Set up monitoring and alerts

2. **Feature Enhancements**
   - Screen sharing
   - Chat during video call
   - Recording sessions
   - Noise cancellation
   - Virtual backgrounds

3. **Optimization**
   - Reduce connection time
   - Improve video quality
   - Optimize battery usage
   - Reduce bandwidth consumption

Good luck testing! 🎉
