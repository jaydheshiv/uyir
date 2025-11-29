#!/usr/bin/env node
/**
 * Batch Responsive Fix Script
 * 
 * This script automatically converts hardcoded pixel values to responsive values
 * across all screen files.
 * 
 * Usage: node scripts/batch-responsive-fix.js
 */

const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '..', 'src', 'screens');
const responsiveImport = `import { hp, wp, rf, getStatusBarHeight, getBottomSpace } from '../utils/responsive';`;
const safeAreaImport = `import { SafeAreaView } from 'react-native-safe-area-context';`;

// Conversion patterns
const conversions = {
    // Horizontal spacing
    'paddingHorizontal: 24': 'paddingHorizontal: wp(6)',
    'paddingHorizontal: 20': 'paddingHorizontal: wp(5)',
    'paddingHorizontal: 16': 'paddingHorizontal: wp(4)',
    'marginHorizontal: 24': 'marginHorizontal: wp(6)',
    'marginHorizontal: 20': 'marginHorizontal: wp(5)',
    'marginHorizontal: 16': 'marginHorizontal: wp(4)',

    // Vertical spacing
    'paddingVertical: 24': 'paddingVertical: hp(3)',
    'paddingVertical: 20': 'paddingVertical: hp(2.5)',
    'paddingVertical: 16': 'paddingVertical: hp(2)',
    'marginVertical: 24': 'marginVertical: hp(3)',
    'marginVertical: 20': 'marginVertical: hp(2.5)',
    'marginVertical: 16': 'marginVertical: hp(2)',

    // Top padding (common in headers)
    'paddingTop: 60': 'paddingTop: getStatusBarHeight() + hp(2)',
    'paddingTop: 50': 'paddingTop: getStatusBarHeight() + hp(1)',
    'marginTop: 60': 'marginTop: getStatusBarHeight() + hp(2)',

    // Bottom padding (common for buttons)
    'paddingBottom: 32': 'paddingBottom: getBottomSpace() + hp(2)',
    'marginBottom: 32': 'marginBottom: getBottomSpace() + hp(2)',

    // Font sizes
    'fontSize: 32': 'fontSize: rf(28)',
    'fontSize: 28': 'fontSize: rf(24)',
    'fontSize: 24': 'fontSize: rf(22)',
    'fontSize: 20': 'fontSize: rf(18)',
    'fontSize: 18': 'fontSize: rf(16)',
    'fontSize: 16': 'fontSize: rf(14)',
    'fontSize: 14': 'fontSize: rf(12)',

    // Heights
    'height: 56': 'height: hp(7)',
    'height: 48': 'height: hp(6)',
    'height: 40': 'height: hp(5)',

    // Widths (for icons, buttons, etc.)
    'width: 48': 'width: wp(12)',
    'width: 40': 'width: wp(10)',
    'width: 32': 'width: wp(8)',

    // Border radius
    'borderRadius: 28': 'borderRadius: wp(7)',
    'borderRadius: 24': 'borderRadius: wp(6)',
    'borderRadius: 20': 'borderRadius: wp(5)',
    'borderRadius: 16': 'borderRadius: wp(4)',
};

function processFile(filePath) {
    console.log(`Processing: ${path.basename(filePath)}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add responsive import if not present
    if (!content.includes('../utils/responsive') && content.includes('StyleSheet')) {
        const reactNativeImportMatch = content.match(/import.*from 'react-native';/);
        if (reactNativeImportMatch) {
            const insertAfter = reactNativeImportMatch[0];
            content = content.replace(insertAfter, `${insertAfter}\n${responsiveImport}`);
            modified = true;
        }
    }

    // Add SafeAreaView import if not present
    if (!content.includes('SafeAreaView') && content.includes('<View style={styles.container}')) {
        const reactNativeImportMatch = content.match(/import.*from 'react-native';/);
        if (reactNativeImportMatch) {
            const insertAfter = reactNativeImportMatch[0];
            content = content.replace(insertAfter, `${insertAfter}\n${safeAreaImport}`);
            modified = true;
        }
    }

    // Apply conversions
    for (const [old, newVal] of Object.entries(conversions)) {
        const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (content.match(regex)) {
            content = content.replace(regex, newVal);
            modified = true;
        }
    }

    // Replace View with SafeAreaView for container
    const containerPattern = /<View style={styles\.container}>/g;
    if (content.match(containerPattern)) {
        content = content.replace(containerPattern, '<SafeAreaView style={styles.container} edges={[\'top\', \'bottom\']}>');
        content = content.replace(/<\/View>(\s*)\);(\s*)};(\s*)export default/g, '</SafeAreaView>$1);$2};$3export default');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${path.basename(filePath)}`);
        return true;
    }

    console.log(`⏭️  Skipped: ${path.basename(filePath)} (no changes needed)`);
    return false;
}

function main() {
    const files = fs.readdirSync(screensDir)
        .filter(file => file.endsWith('.tsx'))
        .map(file => path.join(screensDir, file));

    let updatedCount = 0;

    for (const file of files) {
        if (processFile(file)) {
            updatedCount++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`Total files: ${files.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${files.length - updatedCount}`);
}

main();
