const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = './dist'; // Compiled files

// Cleanup existing mappings if any
if (global.__tsconfigPathsCleanup) {
  global.__tsconfigPathsCleanup();
}

// Register new mappings
global.__tsconfigPathsCleanup = tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

// Cleanup on process exit
process.on('exit', () => {
  if (global.__tsconfigPathsCleanup) {
    global.__tsconfigPathsCleanup();
  }
});

// Export cleanup function for manual use
module.exports = global.__tsconfigPathsCleanup; 