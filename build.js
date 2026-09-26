import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const publicDir = path.join(rootDir, 'public');

console.log('Building TRIOLINE TRAVELS for Vercel production...');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy individual files
const filesToCopy = [
  'index.html',
  'styles.css',
  'script.js',
  'favicon.svg'
];

for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  const dest = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} -> public/${file}`);
  } else {
    console.warn(`Warning: ${file} does not exist at root`);
  }
}

// Copy assets folder recursively
function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const assetsSrc = path.join(rootDir, 'assets');
const assetsDest = path.join(publicDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  copyDirRecursive(assetsSrc, assetsDest);
  console.log(`Copied assets/ -> public/assets/`);
}

console.log('Build completed successfully: public/ is ready for Vercel deployment.');
