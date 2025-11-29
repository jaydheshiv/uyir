#!/usr/bin/env node
/**
 * Standardize bottomNavContainer marginBottom across all screens
 * Sets all to 31.5 (matching Avatarhome1.tsx standard)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SCREENS_DIR = path.join(__dirname, '..', 'src', 'screens');
const TARGET_MARGIN = '31.5';

// Find all TypeScript files in screens directory
const files = glob.sync(`${SCREENS_DIR}/**/*.tsx`);

let updatedCount = 0;
let skippedCount = 0;

console.log(`🔍 Found ${files.length} screen files to check\n`);

files.forEach(filePath => {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if file contains bottomNavContainer
    if (!content.includes('bottomNavContainer')) {
        return;
    }

    // Regex to match bottomNavContainer style block with marginBottom
    // Matches:
    //   bottomNavContainer: {
    //     marginBottom: 22.5,
    //   },
    // or with any whitespace variation
    const regex = /(bottomNavContainer:\s*\{\s*marginBottom:\s*)(\d+(?:\.\d+)?)(,?\s*\})/g;

    let newContent = content;
    let fileChanged = false;

    newContent = content.replace(regex, (match, prefix, currentValue, suffix) => {
        if (currentValue !== TARGET_MARGIN) {
            console.log(`  ✏️  ${fileName}: ${currentValue} → ${TARGET_MARGIN}`);
            fileChanged = true;
            return `${prefix}${TARGET_MARGIN}${suffix}`;
        }
        return match;
    });

    if (fileChanged) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        updatedCount++;
    } else if (content.includes('bottomNavContainer')) {
        skippedCount++;
    }
});

console.log(`\n✅ Complete!`);
console.log(`   Updated: ${updatedCount} files`);
console.log(`   Skipped: ${skippedCount} files (already at ${TARGET_MARGIN} or complex structure)`);
console.log(`   Total checked: ${files.length} files`);
