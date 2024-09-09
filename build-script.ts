import * as fs from 'fs-extra';
import * as path from 'path';

const copyEmptyDirs = (sourceDir: string, destDir: string, rootDir: string) => {
  const items = fs.readdirSync(sourceDir);

  items.forEach(item => {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);

    // Exclude the dist directory and any sub-directories within it
    if (srcPath.startsWith(rootDir + '/dist')) {
      return;
    }

    if (fs.lstatSync(srcPath).isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath);
      }

      // Recursively check subdirectories
      copyEmptyDirs(srcPath, destPath, rootDir);
    }
  });

  // If the source directory is empty, ensure the destination exists
  if (items.length === 0 && !fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }
};

// Define the root,w source, and destination directories
const rootDir = path.resolve(__dirname); // Root directory of the project
const sourceDir = rootDir; // Source is the root directory of the project
const destDir = path.join(rootDir, 'dist'); // Destination is the dist directory

// Copy empty directories
copyEmptyDirs(sourceDir, destDir, rootDir);

console.log('Empty directories copied to dist.');
