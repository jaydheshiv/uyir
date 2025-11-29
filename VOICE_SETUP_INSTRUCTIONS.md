# Voice Recording & Upload Setup Instructions

## Quick Setup Guide

### Step 1: Install Dependencies ✅ (Already Done)
The required packages have been installed:
```bash
npm install react-native-audio-recorder-player react-native-document-picker --legacy-peer-deps
```

### Step 2: iOS Configuration

#### A. Install Pods
```bash
cd ios
pod install
cd ..
```

#### B. Update Info.plist
Add these permissions to `ios/MyFirstApp/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone to record audio for your avatar.</string>
<key>NSFileProviderDomainUsageDescription</key>
<string>This app needs access to your files to upload audio recordings.</string>
```

### Step 3: Android Configuration

#### A. Update AndroidManifest.xml
Add these permissions to `android/app/src/main/AndroidManifest.xml` inside the `<manifest>` tag:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### B. Rebuild Android
```bash
cd android
./gradlew clean
cd ..
```

### Step 4: Rebuild the App

#### For iOS:
```bash
npx react-native run-ios
```

#### For Android:
```bash
npx react-native run-android
```

## Features Implemented

### CreateAvatar3.tsx
- ✅ Real-time voice recording
- ✅ Recording duration display
- ✅ Audio playback preview
- ✅ Delete and re-record
- ✅ Upload to Persona API endpoint
- ✅ Loading states and error handling

### Upload.tsx
- ✅ File picker for audio files (MP3, WAV, M4A)
- ✅ Display selected file name
- ✅ Audio playback preview
- ✅ Delete and re-select file
- ✅ Upload to Persona API endpoint
- ✅ Loading states and error handling

## API Integration
Both screens now integrate with:
- **Endpoint**: `http://64.227.179.250:8080/api/v1/persona/`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Auth**: Bearer token from app store

## Testing Checklist

### CreateAvatar3 (Recording)
- [ ] Microphone permission request appears
- [ ] Recording starts when mic button is tapped
- [ ] Duration counter updates in real-time
- [ ] Recording stops when stop button is tapped
- [ ] Waveform visualization appears
- [ ] Play button works correctly
- [ ] Upload button sends to API successfully
- [ ] Success/error messages display correctly

### Upload (File Upload)
- [ ] Upload button appears when no file is selected
- [ ] File picker opens when tapped
- [ ] Selected file name displays correctly
- [ ] Waveform visualization appears
- [ ] Play button works correctly
- [ ] Upload button sends to API successfully
- [ ] Success/error messages display correctly

## Troubleshooting

### Common Issues

**1. Module not found errors**
```bash
npm install
cd ios && pod install && cd ..
```

**2. Permission errors on Android**
- Check AndroidManifest.xml has correct permissions
- Clear app data and reinstall
- Grant permissions manually in device settings

**3. Recording fails on iOS**
- Check Info.plist has microphone usage description
- Rebuild app after adding permissions

**4. File picker not opening**
- Check file provider permissions in Info.plist
- Try reinstalling the app

**5. Upload fails**
- Verify token is present in app store
- Check network connectivity
- Verify API endpoint is accessible

## Next Steps

1. Run the setup commands above
2. Test both screens thoroughly
3. Verify API uploads are working
4. Check that voice persona is created in backend
5. Test with different audio file formats

## Support
For issues, check:
- TypeScript errors in VS Code
- Runtime errors in Metro bundler
- Network requests in React Native Debugger
