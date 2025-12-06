#!/usr/bin/env node
/**
 * Build verification script.
 * Ensures the build output contains all expected files.
 * Run after `npm run build` to catch build configuration issues.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Files that MUST exist after build for deployment to work
const REQUIRED_FILES = [
  // API dist files
  'apps/api/dist/index.js',
  'apps/api/dist/migrate.js',
  'apps/api/dist/db.js',
  'apps/api/dist/env.js',
  'apps/api/dist/schema.js',
  'apps/api/dist/custom-migrations.js',
  'apps/api/dist/faceClient.js',
  // API drizzle migrations
  'apps/api/drizzle/0000_plain_skin.sql',
  'apps/api/drizzle/meta/_journal.json',
  // Web dist files
  'apps/web/dist/index.html',
  // Shared dist files
  'packages/shared/dist/index.js',
];

// Directories that MUST exist
const REQUIRED_DIRS = [
  'apps/api/dist',
  'apps/api/dist/migrations',
  'apps/api/drizzle',
  'apps/web/dist',
  'packages/shared/dist',
];

// Files that should NOT exist (would indicate wrong build output structure)
const FORBIDDEN_FILES = [
  // These would indicate tsconfig rootDir issue
  'apps/api/dist/src/index.js',
  'apps/api/dist/src/migrate.js',
];

let hasErrors = false;

function checkFile(filePath, shouldExist = true) {
  const fullPath = path.join(ROOT, filePath);
  const exists = fs.existsSync(fullPath);

  if (shouldExist && !exists) {
    console.error(`❌ MISSING: ${filePath}`);
    hasErrors = true;
  } else if (!shouldExist && exists) {
    console.error(`❌ UNEXPECTED: ${filePath} (indicates build misconfiguration)`);
    hasErrors = true;
  } else if (shouldExist && exists) {
    console.log(`✓ ${filePath}`);
  }
}

function checkDir(dirPath) {
  const fullPath = path.join(ROOT, dirPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ MISSING DIR: ${dirPath}`);
    hasErrors = true;
  } else if (!fs.statSync(fullPath).isDirectory()) {
    console.error(`❌ NOT A DIR: ${dirPath}`);
    hasErrors = true;
  } else {
    console.log(`✓ ${dirPath}/`);
  }
}

console.log('🔍 Verifying build output...\n');

console.log('Checking required directories:');
for (const dir of REQUIRED_DIRS) {
  checkDir(dir);
}

console.log('\nChecking required files:');
for (const file of REQUIRED_FILES) {
  checkFile(file, true);
}

console.log('\nChecking for forbidden files (build misconfigurations):');
for (const file of FORBIDDEN_FILES) {
  checkFile(file, false);
}

if (hasErrors) {
  console.error('\n❌ Build verification FAILED');
  console.error('The build output is missing required files or has unexpected structure.');
  console.error('This would cause deployment failures on Railway.');
  process.exit(1);
} else {
  console.log('\n✅ Build verification PASSED');
  console.log('All required files exist and build structure is correct.');
}
