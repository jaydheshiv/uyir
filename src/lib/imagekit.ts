/**
 * ImageKit Helper Functions
 * 
 * This module provides utility functions to generate optimized image URLs
 * using ImageKit.io transformations. Images are still stored in DigitalOcean
 * Spaces, but ImageKit acts as a CDN + transformation layer.
 */

import { imagekitConfig } from '../config/imagekit';

/**
 * Transform an existing image URL (e.g., from DigitalOcean Spaces)
 * with ImageKit transformations
 * 
 * @param imageSrc - Full URL of the source image
 * @param transformations - Array of transformation objects
 * @returns Transformed ImageKit URL or null if imageSrc is invalid
 * 
 * @example
 * const optimizedUrl = getImagekitUrlFromSrc(
 *   'https://blr1.digitaloceanspaces.com/uyir/tenants/1/users/.../image.jpg',
 *   [
 *     { width: 300, height: 200, quality: 85, format: 'auto' }
 *   ]
 * );
 * // Returns: https://ik.imagekit.io/uyir/tr:w-300,h-200,q-85,f-auto/1/users/.../image.jpg
 */
export const getImagekitUrlFromSrc = (
    imageSrc: string | null | undefined,
    transformations: Array<Record<string, any>>
): string | null => {
    console.log('🔍 getImagekitUrlFromSrc called with:', {
        imageSrc: imageSrc ? imageSrc.substring(0, 100) : 'null/undefined',
        type: typeof imageSrc,
        transformations
    });

    if (!imageSrc || typeof imageSrc !== 'string') {
        console.log('⚠️ ImageKit: Invalid imageSrc, returning null');
        return null;
    }

    try {
        // Extract path from DigitalOcean URL
        // From: https://blr1.digitaloceanspaces.com/uyir/tenants/1/users/.../image.jpg
        // To: 1/users/.../image.jpg
        const url = new URL(imageSrc);
        let path = url.pathname;

        // Remove leading /uyir/tenants/ or /uyir/
        if (path.startsWith('/uyir/tenants/')) {
            path = path.replace('/uyir/tenants/', '');
        } else if (path.startsWith('/uyir/')) {
            path = path.replace('/uyir/', '');
        }

        console.log('📁 Extracted path from URL:', {
            original: imageSrc.substring(0, 80) + '...',
            path: path
        });

        // Build transformation string
        // { width: 300, height: 200, cropMode: 'at_max', quality: 85, format: 'auto' }
        // -> tr:w-300,h-200,cm-at_max,q-85,f-auto
        const transformParams: string[] = [];

        if (transformations && transformations.length > 0) {
            const params = transformations[0]; // Use first transformation object

            if (params.width) transformParams.push(`w-${params.width}`);
            if (params.height) transformParams.push(`h-${params.height}`);
            if (params.cropMode) transformParams.push(`cm-${params.cropMode}`);
            if (params.focus) transformParams.push(`fo-${params.focus}`);
            if (params.quality) transformParams.push(`q-${params.quality}`);
            if (params.format) transformParams.push(`f-${params.format}`);
            if (params.progressive !== undefined) transformParams.push(`pr-${params.progressive}`);
            if (params.background) transformParams.push(`bg-${params.background}`);
        }

        // Build final ImageKit URL
        // Format: https://ik.imagekit.io/uyir/tr:w-300,h-200/1/users/.../image.jpg
        const transformString = transformParams.length > 0 ? `tr:${transformParams.join(',')}` : '';
        const imagekitUrl = transformString
            ? `${imagekitConfig.urlEndpoint}${transformString}/${path}`
            : `${imagekitConfig.urlEndpoint}${path}`;

        console.log('✅ ImageKit Transform SUCCESS:', {
            original: imageSrc.substring(0, 80) + '...',
            path: path,
            transformations: transformString,
            final: imagekitUrl.substring(0, 100) + '...',
        });

        return imagekitUrl;
    } catch (error) {
        console.error('❌ ImageKit transformation failed:', error);
        console.error('❌ Failed URL:', imageSrc);
        // Fallback to original URL if transformation fails
        return imageSrc;
    }
};

/**
 * Common transformation presets for different use cases
 */
export const imagekitPresets = {
    /**
     * Profile avatar - small circular image
     */
    profileAvatar: (size: number = 120) => [
        {
            width: size * 2, // 2x for retina displays
            height: size * 2,
            cropMode: 'force', // Force exact dimensions
            focus: 'face', // AI-based face detection
            quality: 85,
            format: 'auto', // Auto WebP/AVIF conversion
        },
    ],

    /**
     * Cover photo - wide banner image
     */
    coverPhoto: (width: number, height: number) => [
        {
            width,
            height,
            cropMode: 'at_max', // Maintain aspect ratio, fit within bounds
            quality: 85,
            format: 'auto',
        },
    ],

    /**
     * Thumbnail - small preview image
     */
    thumbnail: (size: number = 150) => [
        {
            width: size,
            height: size,
            cropMode: 'pad_resize', // Add padding if needed
            background: 'F0F0F0', // Light gray background
            quality: 75,
            format: 'auto',
        },
    ],

    /**
     * Visualization/content image - optimized for viewing
     */
    contentImage: (width: number) => [
        {
            width,
            quality: 85,
            format: 'auto',
            progressive: true, // Progressive JPEG for faster perceived loading
        },
    ],
};

/**
 * Helper to apply preset transformations
 * 
 * @example
 * const avatarUrl = applyPreset(sourceUrl, 'profileAvatar', 60);
 */
export const applyPreset = (
    imageSrc: string | null | undefined,
    preset: keyof typeof imagekitPresets,
    ...args: number[]
): string | null => {
    console.log('🎨 applyPreset called:', {
        preset,
        args,
        imageSrc: imageSrc ? imageSrc.substring(0, 100) : 'null/undefined'
    });

    if (!imageSrc) {
        console.log('⚠️ applyPreset: No imageSrc provided, returning null');
        return null;
    }

    const presetFunc = imagekitPresets[preset] as (...args: number[]) => any[];
    const transformation = presetFunc(...args);
    console.log('🎨 Preset transformation params:', transformation);
    return getImagekitUrlFromSrc(imageSrc, transformation);
};
