# Wireless Installation Methods for Physical Device

## Method 1: Wireless ADB (Android 11+)

### One-Time Setup (requires USB once):
1. Connect phone via USB
2. Enable USB debugging
3. Run these commands:

```powershell
adb tcpip 5555
adb shell ip addr show wlan0 | findstr inet
# Note the IP address (e.g., 192.168.1.100)
adb connect 192.168.1.100:5555
```

4. Disconnect USB cable
5. Phone stays connected wirelessly!

### For Future Connections:
```powershell
adb connect YOUR_PHONE_IP:5555
npx react-native run-android
```

---

## Method 2: Build APK and Transfer Wirelessly

### Step 1: Build the APK
```powershell
cd D:\INTERN\MyFirstApp\android
.\gradlew assembleDebug
cd ..
```

APK will be at: `android\app\build\outputs\apk\debug\app-debug.apk`

### Step 2: Transfer APK to Phone (Choose one):

#### A. Email
- Email the APK to yourself
- Open email on phone
- Download and install APK

#### B. WhatsApp/Telegram
- Send APK to yourself
- Download on phone
- Install

#### C. Google Drive / Dropbox
- Upload APK to cloud
- Download on phone
- Install

#### D. Local Web Server
```powershell
# In project directory
cd android\app\build\outputs\apk\debug
python -m http.server 8000
```
- On phone browser: `http://YOUR_PC_IP:8000`
- Download `app-debug.apk`
- Install

#### E. Shared Folder (Windows)
- Right-click APK folder → Properties → Sharing → Share
- Access from phone file manager
- Install

---

## Method 3: Expo Go / Development Build (Easiest)

If you migrate to Expo:
```powershell
npx expo start
```
Scan QR code with phone - no installation needed!

---

## Method 4: Android Studio Wireless Pairing (Android 11+)

1. Open Android Studio
2. Tools → Device Manager
3. Click "Pair using Wi-Fi"
4. On phone: Settings → Developer Options → Wireless debugging
5. Click "Pair device with pairing code"
6. Enter code in Android Studio
7. Connected wirelessly!

---

## Quick Install Steps (APK Method)

```powershell
# Build APK
cd android
.\gradlew assembleDebug
cd ..

# APK location
# android\app\build\outputs\apk\debug\app-debug.apk
```

Transfer to phone and install!

