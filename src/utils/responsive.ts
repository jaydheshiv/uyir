import { Dimensions, Platform, StatusBar } from 'react-native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference - typically iPhone 11 or Pixel 5)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Responsive width calculation
 * Converts a width value based on screen width
 */
export const wp = (widthPercent: number): number => {
    return (SCREEN_WIDTH * widthPercent) / 100;
};

/**
 * Responsive height calculation
 * Converts a height value based on screen height
 */
export const hp = (heightPercent: number): number => {
    return (SCREEN_HEIGHT * heightPercent) / 100;
};

/**
 * Responsive font size
 * Scales font size based on screen width
 */
export const rf = (fontSize: number): number => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    return Math.round(fontSize * scale);
};

/**
 * Scale size proportionally
 */
export const scale = (size: number): number => {
    return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Vertical scale
 */
export const verticalScale = (size: number): number => {
    return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scale - mix of horizontal and vertical scaling
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
    return size + (scale(size) - size) * factor;
};

/**
 * Safe area padding for notched devices
 */
export const getStatusBarHeight = (): number => {
    return Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
};

/**
 * Bottom safe area for devices with gesture navigation
 */
export const getBottomSpace = (): number => {
    // For devices with gesture navigation (typically 34px on iOS)
    if (Platform.OS === 'ios' && SCREEN_HEIGHT >= 812) {
        return 34;
    }
    return 0;
};

/**
 * Check if device is small screen
 */
export const isSmallDevice = (): boolean => {
    return SCREEN_WIDTH < 375;
};

/**
 * Check if device is tablet
 */
export const isTablet = (): boolean => {
    return SCREEN_WIDTH >= 768;
};

/**
 * Get responsive padding
 */
export const getResponsivePadding = (base: number = 24): number => {
    if (isSmallDevice()) return base * 0.75;
    if (isTablet()) return base * 1.5;
    return base;
};

/**
 * Export screen dimensions
 */
export const DIMENSIONS = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    statusBarHeight: getStatusBarHeight(),
    bottomSpace: getBottomSpace(),
};

export default {
    wp,
    hp,
    rf,
    scale,
    verticalScale,
    moderateScale,
    getStatusBarHeight,
    getBottomSpace,
    isSmallDevice,
    isTablet,
    getResponsivePadding,
    DIMENSIONS,
};
