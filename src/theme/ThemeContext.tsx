import React, { createContext, useContext } from 'react';
import { useAppStore } from '../store/useAppStore';

// Define color palettes for light and dark themes
export const lightTheme = {
    // Background colors
    background: '#F7F7F7',
    cardBackground: '#fff',

    // Text colors
    text: '#222',
    textSecondary: '#666',
    textTertiary: '#999',

    // Border colors
    border: '#D1C9F7',
    borderLight: '#E0E0E0',

    // Component specific
    tabBarBackground: '#fff',
    tabBarText: '#666',
    tabBarTextActive: '#6C5CE7',
    scrollViewBackground: '#F7F7F7',

    // Buttons and accents
    primary: '#6C5CE7',
    primaryLight: '#E0D9FF',
    success: '#4CAF50',
    error: '#F44336',

    // Input colors
    inputBackground: '#fff',
    inputBorder: '#D1C9F7',
    inputText: '#222',
    inputPlaceholder: '#777777BB',

    // Specific element colors
    headerBackground: '#F7F7F7',
    bottomNavBackground: '#fff',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(255, 255, 255, 0.3)',
};

export const darkTheme = {
    // Background colors
    background: '#1A1A1A',
    cardBackground: '#2A2A2A',

    // Text colors
    text: '#E0E0E0',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',

    // Border colors
    border: '#3F3F3F',
    borderLight: '#2F2F2F',

    // Component specific
    tabBarBackground: '#2A2A2A',
    tabBarText: '#B0B0B0',
    tabBarTextActive: '#9D89D9',
    scrollViewBackground: '#1A1A1A',

    // Buttons and accents
    primary: '#9D89D9',
    primaryLight: '#3F3C5F',
    success: '#66BB6A',
    error: '#EF5350',

    // Input colors
    inputBackground: '#2A2A2A',
    inputBorder: '#3F3F3F',
    inputText: '#E0E0E0',
    inputPlaceholder: '#808080AA',

    // Specific element colors
    headerBackground: '#1A1A1A',
    bottomNavBackground: '#2A2A2A',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.8)',
    overlayLight: 'rgba(255, 255, 255, 0.1)',
};

export type Theme = typeof lightTheme;

interface ThemeContextType {
    theme: Theme;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { isDarkMode, toggleDarkMode } = useAppStore();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
