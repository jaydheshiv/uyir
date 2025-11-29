# Dark Theme Implementation Guide

## Overview
The app now has a complete dark theme system that can be toggled on/off from the ProfileSettings screen. The theme state persists across app restarts using AsyncStorage.

## Components Created

### 1. **ThemeContext** (`src/theme/ThemeContext.tsx`)
- Defines light and dark color palettes with comprehensive color definitions
- Provides `useTheme()` hook to access theme colors anywhere in the app
- `ThemeProvider` component wraps the app to make theme available globally
- Theme automatically updates when `isDarkMode` state changes in Zustand store

**Key Colors Defined:**
- Background colors (light/dark backgrounds)
- Text colors (primary, secondary, tertiary)
- Border colors
- Component-specific colors (tabs, buttons, inputs)
- Overlay colors

### 2. **Dark Theme Toggle Button** (ProfileSettings.tsx)
- Added dark theme toggle at the top of ProfileSettings screen
- Uses moon icon and toggle switch
- Connected to Zustand store's `toggleDarkMode()` action
- Updates automatically when theme changes

**UI Elements:**
- Moon icon (20px, purple color)
- Label: "Dark Theme"
- Toggle switch that reflects current `isDarkMode` state
- Styled with purple/theme colors

### 3. **Zustand Store Updates** (useAppStore.ts)
Already configured with:
- `isDarkMode: boolean` - tracks current theme state
- `toggleDarkMode()` - flips between light and dark
- `setDarkMode(isDark: boolean)` - explicitly sets theme
- Dark mode preference persisted in AsyncStorage

### 4. **Navigation Wrapper** (AppNavigator.tsx)
- Wrapped entire navigation container with `<ThemeProvider>`
- This makes theme available to all screens

## How to Apply Dark Theme to Screens

### Step 1: Import useTheme Hook
```typescript
import { useTheme } from '../theme/ThemeContext';
```

### Step 2: Call Hook in Component
```typescript
export default function MyScreen() {
  const { theme } = useTheme();
  // ... rest of component
}
```

### Step 3: Use Theme Colors in Styles
Apply theme colors dynamically inline:

```typescript
// Container
<View style={[styles.container, { backgroundColor: theme.background }]}>

// Text
<Text style={[styles.title, { color: theme.text }]}>Title</Text>

// Card
<View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>

// Input
<TextInput
  style={[styles.input, { 
    backgroundColor: theme.inputBackground,
    color: theme.inputText,
    borderColor: theme.inputBorder
  }]}
  placeholderTextColor={theme.inputPlaceholder}
/>
```

## Screens Already Updated with Dark Theme

1. **ProfileSettings.tsx**
   - Dark theme toggle button fully functional
   - Button connected to store action

2. **Avatarhome1.tsx**
   - Container background uses theme
   - Profile name, entry count use theme text colors
   - Main card uses theme colors
   - Input area uses theme colors
   - Entry bubbles use theme colors

3. **SupportPage2.tsx**
   - SafeAreaView background uses theme
   - ScrollView container uses theme
   - All text uses theme text color
   - Icon color uses theme text color

## Color Palette Reference

### Light Theme
- Background: `#F7F7F7`
- Card Background: `#fff`
- Text: `#222`
- Text Secondary: `#666`
- Primary: `#6C5CE7`
- Border: `#D1C9F7`

### Dark Theme
- Background: `#1A1A1A`
- Card Background: `#2A2A2A`
- Text: `#E0E0E0`
- Text Secondary: `#B0B0B0`
- Primary: `#9D89D9`
- Border: `#3F3F3F`

## Adding Dark Theme to More Screens

To add dark theme support to any screen:

1. Import `useTheme` hook at the top
2. Call `const { theme } = useTheme();` in component
3. Wrap all static style references with inline theme colors using array syntax: `[styles.xxx, { color: theme.text }]`
4. Use theme colors for icons: `<Ionicons color={theme.text} />`
5. Update placeholder colors: `placeholderTextColor={theme.inputPlaceholder}`

## Testing the Dark Theme

1. Navigate to ProfileSettings screen (click profile icon → Profile Settings)
2. Toggle the "Dark Theme" switch
3. Watch entire app change to dark theme in real-time
4. Close and restart the app - dark theme preference is preserved
5. Toggle back to light theme to verify switching works

## Technical Details

- **State Management**: Zustand store with AsyncStorage persistence
- **Performance**: Theme colors pre-defined, no runtime computations
- **Memory**: Small overhead - single context provider
- **Compatibility**: Works with all React Native components
- **Custom Components**: Use theme colors in custom components via props

## Next Steps for Full Implementation

To complete dark theme rollout across entire app:

1. Update remaining screens (currently ~80+ screens)
2. Apply theme colors to:
   - All screen backgrounds
   - All text elements
   - All cards/containers
   - All input fields
   - All buttons
   - All icons
   - All borders

3. Recommended batch update approach:
   - Group similar screens (e.g., all settings screens)
   - Apply same pattern to each screen
   - Test in both light and dark modes
   - Commit each batch together

## Theme Type Definition

```typescript
export type Theme = {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  tabBarBackground: string;
  tabBarText: string;
  tabBarTextActive: string;
  scrollViewBackground: string;
  primary: string;
  primaryLight: string;
  success: string;
  error: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  headerBackground: string;
  bottomNavBackground: string;
  overlay: string;
  overlayLight: string;
};
```

## Troubleshooting

**Q: Theme not updating when I toggle?**
A: Ensure screen is wrapped with ThemeProvider. Check that component calls `useTheme()` hook and applies theme inline.

**Q: Dark theme not persisting after restart?**
A: Verify Zustand store has `isDarkMode` in the `partialize` function for AsyncStorage.

**Q: Colors look weird in dark mode?**
A: Check that you're using correct color from `theme` object. Verify contrast ratios for accessibility.

## Files Modified

- `src/theme/ThemeContext.tsx` - NEW
- `src/screens/ProfileSettings.tsx` - Updated
- `src/screens/Avatarhome1.tsx` - Updated
- `src/screens/SupportPage2.tsx` - Updated
- `src/navigation/AppNavigator.tsx` - Updated (wrapped with ThemeProvider)
- `src/store/useAppStore.ts` - Already configured

