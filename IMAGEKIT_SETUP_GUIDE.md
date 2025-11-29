# ImageKit Integration Setup Guide

## ✅ What Has Been Done

ImageKit.io has been integrated into your React Native app to optimize image delivery. Here's what was implemented:

### 1. **Packages Installed**
- `imagekit-javascript` - ImageKit SDK for URL generation and transformations
- `react-native-url-polyfill` - Required for React Native 16+ compatibility

### 2. **Files Created**
- `src/config/imagekit.ts` - Configuration file (needs your ImageKit URL endpoint)
- `src/lib/imagekit.ts` - Helper functions for image transformations
- `App.tsx` - Updated with URL polyfill import

### 3. **Screens Updated with ImageKit Transformations**

#### ✅ ProfileSettings.tsx
- **Cover image**: 800x360px, WebP/AVIF, quality 85%
- **Profile image**: 120x120px (2x for retina), face-focused cropping

#### ✅ ProfileScreen.tsx
- **Professional compact avatar**: 80x80px (2x retina), face detection
- **Regular user avatar**: 140x140px (2x retina), face detection

#### ✅ MicrositePTView.tsx
- **Cover header**: Full width x 220px height
- **Profile avatar**: 108x108px double-bordered circle

#### ✅ Avatarhome1.tsx
- **Profile header**: 60x60px avatar
- **Visualization images**: Responsive width, progressive JPEG

---

## 🚀 Setup Steps (Required)

### Step 1: Get Your ImageKit URL Endpoint

1. Go to https://imagekit.io/dashboard
2. Sign up or log in
3. Go to **URL Endpoints** section: https://imagekit.io/dashboard/url-endpoints
4. Copy your URL endpoint (looks like: `https://ik.imagekit.io/your_imagekit_id`)

### Step 2: Update Configuration File

Open `src/config/imagekit.ts` and replace `YOUR_IMAGEKIT_ID`:

```typescript
export const imagekitConfig = {
  urlEndpoint: 'https://ik.imagekit.io/YOUR_ACTUAL_ID_HERE',
};
```

**Example:**
```typescript
export const imagekitConfig = {
  urlEndpoint: 'https://ik.imagekit.io/demo123',
};
```

### Step 3: Configure ImageKit Dashboard

1. Go to **Integration** → **Origin** in ImageKit dashboard
2. Add your DigitalOcean Spaces URL as an origin:
   - Name: `DigitalOcean Spaces`
   - Type: `Web Server`
   - Base URL: `https://blr1.digitaloceanspaces.com/uyir`

This allows ImageKit to fetch images from your DigitalOcean storage.

---

## 📋 How It Works

### Current Flow (Before ImageKit):
```
User uploads → DigitalOcean Spaces
Backend returns: https://blr1.digitaloceanspaces.com/uyir/.../image.jpg
Frontend displays: Direct DigitalOcean URL (large, unoptimized)
```

### New Flow (With ImageKit):
```
User uploads → DigitalOcean Spaces (NO CHANGE)
Backend returns: https://blr1.digitaloceanspaces.com/uyir/.../image.jpg (NO CHANGE)

Frontend transforms URL:
  ↓
ImageKit URL: https://ik.imagekit.io/your_id/tr:w-300,h-200,q-85,f-auto/https://blr1.digitaloceanspaces.com/.../image.jpg
  ↓
Browser fetches from ImageKit CDN
  ↓
ImageKit:
  1. Fetches from DigitalOcean
  2. Resizes, crops, converts to WebP
  3. Caches result
  4. Serves optimized image
```

---

## 🎯 Benefits You Get

### Performance
- **30-50% smaller files** with automatic WebP/AVIF conversion
- **Global CDN delivery** for faster loading worldwide
- **Progressive JPEG** for faster perceived loading
- **Caching** - transformed images cached for instant delivery

### Image Quality
- **AI-based face detection** - avatars automatically centered on faces
- **Smart cropping** - maintains important parts of images
- **Retina-ready** - 2x images for high-DPI displays
- **Consistent sizing** - all images perfectly sized for their context

### Developer Experience
- **No backend changes** - upload flow stays the same
- **Automatic fallbacks** - if ImageKit fails, original URL still works
- **Easy to use** - just wrap URLs with transformation functions

---

## 🧪 Testing

### 1. Start the App
```powershell
npm start
# In another terminal:
npm run android
# or
npm run ios
```

### 2. Test Image Upload
1. Go to **ProfileSettings** screen
2. Upload a cover photo and profile picture
3. Check browser network tab - you should see ImageKit URLs like:
   ```
   https://ik.imagekit.io/your_id/tr:w-800,h-360,q-85,f-auto,cm-at_max/https://blr1...
   ```

### 3. Verify Transformations
- Cover image should be exactly 800x360px
- Profile avatar should be 120x120px circle
- Images should be in WebP format (check Content-Type header)
- File sizes should be 30-50% smaller than originals

### 4. Test Fallbacks
- Turn off internet → Images should show placeholder icons
- Use invalid image URL → Should fall back to next image or placeholder

---

## 📚 Using ImageKit in Other Screens

### Basic Usage

```typescript
import { applyPreset } from '../lib/imagekit';

// Profile avatar (circular, face-focused)
<Image source={{ 
  uri: applyPreset(imageUrl, 'profileAvatar', 60) || undefined 
}} />

// Cover photo
<Image source={{ 
  uri: applyPreset(imageUrl, 'coverPhoto', 800, 300) || undefined 
}} />

// Thumbnail
<Image source={{ 
  uri: applyPreset(imageUrl, 'thumbnail', 150) || undefined 
}} />

// Content image (visualization, posts, etc)
<Image source={{ 
  uri: applyPreset(imageUrl, 'contentImage', 400) || undefined 
}} />
```

### Custom Transformations

```typescript
import { getImagekitUrlFromSrc } from '../lib/imagekit';

const transformedUrl = getImagekitUrlFromSrc(originalUrl, [
  {
    width: 500,
    height: 300,
    cropMode: 'pad_resize', // Add padding to maintain aspect ratio
    background: 'F0F0F0', // Light gray padding
    quality: 90,
    format: 'auto', // Auto WebP/AVIF
    focus: 'face', // AI face detection
  }
]);

<Image source={{ uri: transformedUrl || undefined }} />
```

---

## 🔧 Available Transformation Parameters

### Size & Cropping
- `width`, `height` - Dimensions in pixels
- `cropMode` - `force`, `at_max`, `pad_resize`, etc.
- `aspectRatio` - e.g., `'16-9'`, `'4-3'`

### Quality & Format
- `quality` - 1-100 (85 recommended for photos)
- `format` - `'auto'`, `'webp'`, `'avif'`, `'jpg'`, `'png'`
- `progressive` - `true` for progressive JPEG

### Smart Features
- `focus` - `'face'`, `'auto'`, `'center'`
- `blur` - 1-100 for blur effect
- `dpr` - `'auto'` for automatic retina support

Full list: https://imagekit.io/docs/image-transformation

---

## ⚠️ Important Notes

### URL Endpoint is Public (Safe)
- Your `urlEndpoint` is visible in browser network requests
- This is **normal and safe** - it's meant to be public
- Real security is handled by origin configurations in ImageKit dashboard

### Original Images Stay in DigitalOcean
- ImageKit doesn't store your originals
- It fetches from DigitalOcean, transforms, and caches
- Your backend upload endpoints don't need any changes

### Fallback Safety
- If ImageKit service is down, app falls back to original URLs
- If transformation fails, original image is served
- If image fails to load, placeholder icon is shown

---

## 🐛 Troubleshooting

### Images Not Transforming?
1. Check `src/config/imagekit.ts` has correct `urlEndpoint`
2. Verify origin is configured in ImageKit dashboard
3. Check browser console for errors
4. Look at network tab - URL should include `/tr:...` transformations

### Images Not Loading?
1. Check DigitalOcean Spaces is publicly accessible
2. Verify CORS is enabled on DigitalOcean
3. Check ImageKit dashboard → Media Library for cached images
4. Try accessing ImageKit URL directly in browser

### "Cannot read property 'url'" Error?
- Make sure imageUrl is not null before calling `applyPreset`
- Always use `|| undefined` fallback:
  ```typescript
  uri: applyPreset(imageUrl, 'profileAvatar', 60) || undefined
  ```

---

## 📊 Monitoring & Analytics

### ImageKit Dashboard
- Go to https://imagekit.io/dashboard
- **Usage** tab shows bandwidth savings, transformation counts
- **Analytics** tab shows performance metrics
- **Media Library** shows all cached images

### Performance Metrics to Track
- **Bandwidth savings**: 30-50% reduction expected
- **Load times**: Images should load 2-3x faster
- **Cache hit rate**: Should be 80%+ after initial loads

---

## 🎓 Next Steps

1. **Update PublicMicrositePTView** (TODO) - Apply transformations to remaining screen
2. **Test on real devices** - Verify performance improvements
3. **Monitor ImageKit dashboard** - Check usage and cache efficiency
4. **Optimize further** - Adjust quality settings based on analytics

---

## 📞 Support

- ImageKit Docs: https://imagekit.io/docs
- React Native Guide: https://imagekit.io/docs/integration/react-native
- Support: support@imagekit.io

---

**Status**: ✅ Core integration complete, ready for testing
**Last Updated**: October 31, 2025
