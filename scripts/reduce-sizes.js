/**
 * Script to reduce all UI sizes by 10% across all screens
 * Reduces fontSize, padding, margin, width, height, borderRadius, etc.
 */

const fs = require('fs');
const path = require('path');

// Properties to reduce by 10%
const SIZE_PROPERTIES = [
    'fontSize',
    'padding',
    'paddingHorizontal',
    'paddingVertical',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'margin',
    'marginHorizontal',
    'marginVertical',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'width',
    'height',
    'maxWidth',
    'maxHeight',
    'minWidth',
    'minHeight',
    'borderRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
    'gap',
    'rowGap',
    'columnGap',
    'lineHeight',
    'top',
    'bottom',
    'left',
    'right',
];

// Directories to process
const DIRECTORIES = [
    path.join(__dirname, '..', 'src', 'screens'),
    path.join(__dirname, '..', 'src', 'components'),
];

let totalFilesProcessed = 0;
let totalChanges = 0;

function reduceSize(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Reduce by 10%
    const reduced = num * 0.9;

    // Round to 1 decimal place to avoid floating point issues
    return Math.round(reduced * 10) / 10;
}

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let fileChanges = 0;

        // Process StyleSheet.create blocks
        const styleSheetRegex = /StyleSheet\.create\({[\s\S]*?\}\);/g;
        content = content.replace(styleSheetRegex, (styleBlock) => {
            let updatedBlock = styleBlock;

            SIZE_PROPERTIES.forEach((prop) => {
                // Match property: value patterns (handles numbers with optional decimals)
                const propRegex = new RegExp(`(${prop}:\\s*)(\\d+\\.?\\d*)([,\\s])`, 'g');

                updatedBlock = updatedBlock.replace(propRegex, (match, prefix, value, suffix) => {
                    const reduced = reduceSize(value);
                    if (reduced !== parseFloat(value)) {
                        fileChanges++;
                        totalChanges++;
                    }
                    return `${prefix}${reduced}${suffix}`;
                });
            });

            return updatedBlock;
        });

        // Process constant definitions (e.g., FONT_SIZES, SPACING)
        const constantRegex = /(?:FONT_SIZES|SPACING|SIZES|DIMENSIONS)\s*=\s*{[\s\S]*?};/g;
        content = content.replace(constantRegex, (constantBlock) => {
            let updatedBlock = constantBlock;

            // Match all numeric values in the constant object
            const numRegex = /:\s*(\d+\.?\d*)([,\s}])/g;

            updatedBlock = updatedBlock.replace(numRegex, (match, value, suffix) => {
                const reduced = reduceSize(value);
                if (reduced !== parseFloat(value)) {
                    fileChanges++;
                    totalChanges++;
                }
                return `: ${reduced}${suffix}`;
            });

            return updatedBlock;
        });

        // Only write if changes were made
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${path.basename(filePath)}: ${fileChanges} changes`);
            totalFilesProcessed++;
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

function processDirectory(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip node_modules, build directories, etc.
                if (!['node_modules', 'build', 'android', 'ios', '__tests__'].includes(file)) {
                    processDirectory(filePath);
                }
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                processFile(filePath);
            }
        });
    } catch (error) {
        console.error(`❌ Error reading directory ${dirPath}:`, error.message);
    }
}

console.log('🚀 Starting UI size reduction (10% decrease)...\n');

DIRECTORIES.forEach((dir) => {
    if (fs.existsSync(dir)) {
        console.log(`📁 Processing directory: ${dir}\n`);
        processDirectory(dir);
    } else {
        console.log(`⚠️  Directory not found: ${dir}`);
    }
});

console.log('\n✨ Done!');
console.log(`📊 Files processed: ${totalFilesProcessed}`);
console.log(`📊 Total changes: ${totalChanges}`);
