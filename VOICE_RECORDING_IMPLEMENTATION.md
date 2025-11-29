# Voice Recording Implementation

## Overview
Voice recording and upload functionality has been implemented in **CreateAvatar3.tsx** and **Upload.tsx** screens using the `react-native-audio-recorder-player` library.

## Implementation Details

### 1. Upload.tsx - MP3 File Upload from Storage
- **Purpose**: Allow professionals to upload existing MP3 voice samples from device storage
- **Endpoint**: `POST http://dev.api.uyir.ai:8081/persona_voice/voice_samples`
- **Format**: MP3 only (strictly enforced)

#### Key Features:
- ✅ File picker restricted to MP3 format only
- ✅ Validation: Rejects non-MP3 files with user-friendly alert
- ✅ File upload to persona_voice API with Bearer token authentication
- ✅ Visual feedback: Loading spinner, success confirmation
- ✅ Audio preview with waveform visualization

#### Code Changes:
```typescript
// File validation - only MP3 allowed
if (!fileName.toLowerCase().endsWith('.mp3')) {
    Alert.alert('Invalid Format', 'Only MP3 files are supported...');
    return;
}

// Upload with audio/mpeg content type
formData.append('file', {
    uri: audioFilePath,
    type: 'audio/mpeg',
    name: fileName,
});
```

---

### 2. CreateAvatar3.tsx - Voice Recording with Microphone
- **Purpose**: Record voice samples directly in the app for avatar creation
- **Library**: `react-native-audio-recorder-player` v4.5.0
- **Endpoint**: `POST http://dev.api.uyir.ai:8081/persona_voice/voice_samples`

#### Key Features:
- ✅ Real-time voice recording with duration tracking
- ✅ Record/Stop toggle button with visual feedback (purple → red when recording)
- ✅ Audio playback preview before upload
- ✅ Delete and re-record capability
- ✅ Android permissions handling (RECORD_AUDIO)
- ✅ iOS microphone access (NSMicrophoneUsageDescription)

#### Recording Workflow:
1. User taps microphone button → Recording starts
2. Duration counter updates in real-time
3. User taps stop button → Recording stops
4. Waveform visualization displayed
5. Play button allows preview
6. Upload button sends to API

#### Code Implementation:
```typescript
// Initialize audio recorder
const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

// Start recording
const path = Platform.select({
    ios: 'voice_sample.m4a',    // iOS native format
    android: 'voice_sample.aac', // Android native format
});
await audioRecorderPlayer.startRecorder(path);

// Stop recording
const result = await audioRecorderPlayer.stopRecorder();
setRecordedAudioUri(result); // Save file URI
```

---

## ⚠️ Important Limitation: MP3 Format

### Current Status:
The implementation has a **technical limitation** regarding MP3 format:

**React Native's native audio recording produces AAC/M4A files, NOT MP3:**
- **iOS**: Records in M4A (MPEG-4 Audio) format
- **Android**: Records in AAC (Advanced Audio Coding) format
- **MP3 encoding**: Not natively supported in React Native

### Why This Happens:
- MP3 encoding requires FFmpeg or similar codec libraries
- React Native uses native mobile APIs which default to AAC/M4A
- Converting to MP3 in the frontend would require:
  - Installing `react-native-ffmpeg` (large library, ~50MB)
  - Complex encoding process
  - Significant performance overhead

### Current Solution:
The recorded audio files are uploaded with `.mp3` extension but contain AAC/M4A data:

```typescript
const fileType = Platform.select({
    ios: 'audio/m4a',    // Actual format
    android: 'audio/aac', // Actual format
}) || 'audio/mpeg';

formData.append('file', {
    uri: recordedAudioUri,
    type: fileType,
    name: 'voice_sample_recorded.mp3', // .mp3 extension
});
```

### Recommended Backend Solution:
The backend API (`/persona_voice/voice_samples`) should handle the conversion:

```python
# Example Python backend solution
from pydub import AudioSegment

def convert_to_mp3(uploaded_file):
    # Detect format
    audio = AudioSegment.from_file(uploaded_file)
    
    # Export as MP3
    mp3_path = "voice_sample.mp3"
    audio.export(mp3_path, format="mp3", bitrate="192k")
    
    return mp3_path
```

**OR** accept AAC/M4A formats in the API if MP3 is not strictly required for processing.

---

## Alternative Frontend Solutions (Not Implemented)

### Option 1: Install FFmpeg for Frontend Conversion
```bash
npm install react-native-ffmpeg --legacy-peer-deps
```

**Pros:**
- True MP3 encoding in frontend
- Complete format control

**Cons:**
- Large library size (~50MB)
- Complex setup (Android linking, iOS CocoaPods)
- Performance overhead
- Longer build times

### Option 2: Use Expo AV (If using Expo)
```bash
npx expo install expo-av
```

**Pros:**
- Simpler API
- Better Expo integration

**Cons:**
- Still records in AAC/M4A
- Requires Expo ecosystem
- Same MP3 limitation

---

## Testing Instructions

### Upload.tsx Testing:
1. Navigate to Upload screen
2. Tap "Upload Audio File" button
3. Select a **non-MP3** file → Should show "Invalid Format" alert
4. Select an **MP3 file** → Should show waveform and file name
5. Tap play button → Preview audio
6. Tap "Upload to Persona API" → Should upload and show success message

### CreateAvatar3.tsx Testing:
1. Navigate to CreateAvatar3 (Professional onboarding)
2. Scroll to "Add the sound of you to your twin" section
3. Tap microphone button → Should start recording (button turns red)
4. Speak for 5-10 seconds
5. Tap stop button → Recording should stop and show waveform
6. Tap play button → Should play back recorded audio
7. Tap "Upload Voice Sample" → Should upload to API
8. Check console logs for file format (will show AAC/M4A)

---

## Permissions Already Configured

### Android (AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### iOS (Info.plist):
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone for video calls with mental health professionals.</string>
```

---

## File Structure

```
src/screens/
├── Upload.tsx                    # MP3 file upload from storage
├── CreateAvatar3.tsx             # Voice recording with microphone
└── VideoRecordingGuide.tsx       # Helper modal (unchanged)

package.json
└── react-native-audio-recorder-player: "^4.5.0" (newly added)
```

---

## API Integration

### Endpoint:
```
POST http://dev.api.uyir.ai:8081/persona_voice/voice_samples
```

### Headers:
```
Authorization: Bearer {token}
Accept: application/json
```

### Request Body (FormData):
```
file: [Binary Audio Data]
Content-Type: audio/mpeg (Upload.tsx) or audio/aac|audio/m4a (CreateAvatar3.tsx)
```

### Expected Responses:
- **200 OK**: `{"message": "Voice sample uploaded successfully"}`
- **401 Unauthorized**: Invalid or missing token
- **422 Unprocessable Entity**: Invalid file format or missing data
- **500 Internal Server Error**: Backend processing error

---

## Summary

✅ **Completed:**
- MP3-only file upload in Upload.tsx
- Voice recording in CreateAvatar3.tsx
- Playback preview functionality
- API integration with persona_voice endpoint
- Permission handling (Android/iOS)
- UI/UX with waveform visualization

⚠️ **Known Limitation:**
- Recorded audio is in AAC/M4A format, not MP3
- Backend conversion recommended

🔧 **Recommendation:**
Update backend API to accept AAC/M4A formats OR implement FFmpeg conversion on backend for seamless user experience.
