# Voice Persona API Integration

## Overview
This document describes the integration of the Persona Voice Upload API into the CreateAvatar3 and Upload screens.

## API Endpoint
- **Base URL**: `http://64.227.179.250:8080`
- **Endpoint**: `/api/v1/persona/`
- **Method**: POST
- **Content-Type**: multipart/form-data

## Implementation

### 1. CreateAvatar3.tsx - Voice Recording
This screen allows users to **record their voice** directly in the app.

**Features:**
- Real-time voice recording with duration tracking
- Play/pause recorded audio
- Delete and re-record functionality
- Upload recorded audio to Persona API

**Flow:**
1. User taps the microphone button to start recording
2. Recording duration is displayed in real-time
3. User taps stop button to finish recording
4. Audio waveform visualization appears with play controls
5. User can preview the recording
6. User clicks "Upload Voice to Persona" button
7. Audio is uploaded as MP3 to the backend

**Required Permissions:**
- Android: `RECORD_AUDIO` permission

### 2. Upload.tsx - File Upload
This screen allows users to **upload an existing audio file** from their device storage.

**Features:**
- File picker supporting MP3, WAV, M4A formats
- Display selected file name
- Play/pause uploaded audio
- Delete and re-select functionality
- Upload to Persona API

**Flow:**
1. User sees an upload prompt with cloud icon
2. User taps to open file picker
3. User selects an audio file from device storage
4. File name and waveform visualization appear
5. User can preview the audio
6. User taps "Upload to Persona API" button
7. File is uploaded to the backend

## API Request Format

```typescript
const formData = new FormData();

// Required fields
formData.append('name', 'UserVoicePersona');
formData.append('llm_choice', 'llama');
formData.append('description', 'User voice persona for avatar');

// Voice file
formData.append('voice_files', {
    uri: audioFilePath,
    type: 'audio/mp3',
    name: 'recording.mp3',
});

// Make request
const response = await fetch('http://64.227.179.250:8080/api/v1/persona/', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
    },
    body: formData,
});
```

## Dependencies
The following packages were installed:

```json
{
  "react-native-audio-recorder-player": "^4.5.0",
  "react-native-document-picker": "^9.3.1"
}
```

### Installation
```bash
npm install react-native-audio-recorder-player react-native-document-picker --legacy-peer-deps
```

### iOS Setup
For iOS, add the following to `ios/MyFirstApp/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone to record audio for your avatar.</string>
<key>NSFileProviderDomainUsageDescription</key>
<string>This app needs access to your files to upload audio recordings.</string>
```

### Android Setup
For Android, the `RECORD_AUDIO` permission is requested at runtime in CreateAvatar3.tsx.

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Testing

### Test CreateAvatar3 Recording
1. Navigate to CreateAvatar3 screen
2. Grant microphone permission when prompted
3. Tap microphone button to start recording
4. Speak for a few seconds
5. Tap stop button
6. Tap play to preview
7. Tap "Upload Voice to Persona" button
8. Verify success message

### Test Upload File Selection
1. Navigate to Upload screen
2. Tap the upload area
3. Select an audio file (MP3, WAV, M4A)
4. Verify file name appears
5. Tap play button to preview
6. Tap "Upload to Persona API" button
7. Verify success message

## Error Handling
Both screens handle the following error scenarios:
- No authentication token
- Network failures
- Permission denials (recording)
- File selection cancellation
- Invalid file types
- Backend API errors

## Response Handling
On successful upload:
- 201 Created status
- PersonaOut object with voice_id from ElevenLabs
- Success alert displayed to user

On failure:
- Error alert with details from backend
- User can retry upload

## Notes
- Audio files are recorded in MP3 format for Android
- Audio files are recorded in M4A format for iOS
- The Persona API stores the voice_id for future use with voice cloning
- Both screens require user to be authenticated (token must be present)
