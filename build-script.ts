import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Custom build script built to support transfers of the empty
 * directories that are needed for migration and seeders. On the time
 * when the script was written, there were only seeders folder with
 * seeders to be executed while migration directory was empty at the moment
 * what were causing issues with sequelize config, it was failing due to
 * empty migrations folder.
 * The custom build script can be rewritten in case if you'll find another
 * solution how to prevent sequelize from crushing because of empty seeders or
 * migrations folder. TODO
 */
const copyEmptyDirs = (sourceDir: string, destDir: string, rootDir: string) => {
  const items = fs.readdirSync(sourceDir);

  items.forEach(item => {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);

    // Exclude the dist and node_modules directories and any sub-directories within them
    if (srcPath.startsWith(rootDir + '/dist') || srcPath.startsWith(rootDir + '/node_modules')) {
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

// Define the root, source, and destination directories
const rootDir = path.resolve(__dirname); // Root directory of the project
const sourceDir = rootDir; // Source is the root directory of the project
const destDir = path.join(rootDir, 'dist'); // Destination is the dist directory

// Copy empty directories
copyEmptyDirs(sourceDir, destDir, rootDir);

console.log('Empty directories copied to dist.');
