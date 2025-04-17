"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
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
var copyEmptyDirs = function (sourceDir, destDir, rootDir) {
    var items = fs.readdirSync(sourceDir);
    items.forEach(function (item) {
        var srcPath = path.join(sourceDir, item);
        var destPath = path.join(destDir, item);
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
var rootDir = path.resolve(__dirname); // Root directory of the project
var sourceDir = rootDir; // Source is the root directory of the project
var destDir = path.join(rootDir, 'dist'); // Destination is the dist directory
// Copy empty directories
copyEmptyDirs(sourceDir, destDir, rootDir);
console.log('Empty directories copied to dist.');
