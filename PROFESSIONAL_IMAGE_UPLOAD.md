# Professional Profile Image Upload

## Overview
This document explains the professional profile image upload feature in the `CreateAvatar3.tsx` screen.

## Endpoint
```
POST /professional/profile-image
```

## Implementation Details

### Screen: `CreateAvatar3.tsx`

#### Features
1. **Image Picker Integration**
   - Uses `react-native-image-picker` library
   - Opens device gallery to select image
   - Quality set to 0.8 for optimized upload

2. **Real-time Upload**
   - Image uploads immediately after selection
   - Shows loading spinner during upload
   - Displays success/error feedback

3. **Upload States**
   - `isUploading` - Shows loading indicator
   - `selectedImage` - Local image URI for preview
   - `uploadedImageUrl` - Backend URL after successful upload

4. **Continue Button Logic**
   - Requires image selection
   - Requires successful upload (uploadedImageUrl exists)
   - Disabled during upload process

### Request Details

#### Headers
```typescript
{
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json'
}
```

#### Body (FormData)
```typescript
{
  file: {
    uri: string,           // Local file URI
    type: string,          // MIME type (e.g., 'image/jpeg')
    name: string           // Filename (e.g., 'professional-profile.jpg')
  }
}
```

#### Expected Response (Success)
```json
{
  "image_url": "https://...",
  "status": "success",
  "message": "Profile image uploaded successfully"
}
```

#### Expected Response (Error)
```json
{
  "detail": "Error message"
}
```

## User Flow

1. **Click Learn More** → Opens modal with information
2. **Click Done in Modal** → Closes modal, opens image picker
3. **Select Image** → Image displays in preview box
4. **Upload Starts** → Shows loading spinner
5. **Upload Completes** → Shows success message, enables Continue button
6. **Click Continue** → Navigate to next screen

## UI States

### Before Upload
- Empty dashed border box
- Purple "+" button
- Continue button disabled

### During Upload
- Loading spinner in place of image
- "Uploading image..." text below
- No "+" button visible
- Continue button disabled

### After Successful Upload
- Image preview displayed
- "✓ Image uploaded successfully" text in green
- Purple "+" button (allows re-upload)
- Continue button enabled

### After Upload Failure
- Dashed border box (empty state restored)
- Error alert shown to user
- Continue button disabled

## Error Handling

### Image Picker Errors
- User cancels → No action, remains on screen
- Permission denied → Alert shown
- Unknown error → Alert with retry option

### Upload Errors
- Network error → "Could not connect to server" alert
- Authentication error → "Not authenticated" alert
- Backend error → Shows backend error message
- All errors → Clear selected image, reset state

## Backend Requirements

### Endpoint Configuration
- Method: `POST`
- Path: `/professional/profile-image`
- Authentication: Required (Bearer token)
- Content-Type: `multipart/form-data`

### Expected Validations
- File type: Image only (jpg, png, etc.)
- File size: TBD by backend
- User must have professional profile created
- User must be authenticated

### Storage
- Image should be stored securely
- Return publicly accessible URL
- Link to professional profile in database

## Testing Checklist

- [ ] Image picker opens when clicking "+" button
- [ ] Selected image displays in preview
- [ ] Upload progress shows loading spinner
- [ ] Success message appears after upload
- [ ] Continue button enables after successful upload
- [ ] Can re-upload different image
- [ ] Error alerts show for network failures
- [ ] Error alerts show for authentication issues
- [ ] Backend stores image correctly
- [ ] Backend returns valid image URL

## Integration Points

### With Professional Onboarding Flow
This screen is part of the professional onboarding:
```
LetUsKnowYou → UploadContent → LetUsKnowYou2 → TermsAndConditions → ProfileScreen
                                    ↑
                              CreateAvatar3 may be used here
```

### With Zustand Store
- Uses `useAuth()` hook for token
- Could store uploaded image URL for future reference
- Professional data may reference this image

## Future Enhancements

1. **Image Cropping**
   - Allow user to crop image before upload
   - Maintain aspect ratio

2. **Multiple Images**
   - Support gallery of professional images
   - Set primary image

3. **Compression**
   - Client-side image compression
   - Reduce upload size and time

4. **Progress Bar**
   - Show upload percentage
   - More granular feedback

5. **Image Filters**
   - Apply professional filters
   - Enhance image quality
