#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 FORCING NEW BUILD - Railway Cache Fix');

// 1. Update version with current timestamp
const timestamp = Date.now();
const newVersion = `2.0.${timestamp}`;

// Update package.json
const packagePath = 'frontend/package.json';
let packageContent = fs.readFileSync(packagePath, 'utf8');
packageContent = packageContent.replace(/"version": ".*"/, `"version": "${newVersion}"`);
fs.writeFileSync(packagePath, packageContent);
console.log(`✅ Updated version to ${newVersion}`);

// 2. Add timestamp to build script to force cache invalidation
const buildScriptPath = 'frontend/build.sh';
let buildScript = fs.readFileSync(buildScriptPath, 'utf8');
buildScript = buildScript.replace(
  /echo "Building frontend\.\.\."/, 
  `echo "Building frontend v${newVersion}..."`
);
fs.writeFileSync(buildScriptPath, buildScript);
console.log('✅ Updated build script');

// 3. Update railway.json with new env vars
const railwayPath = 'railway.json';
let railwayContent = fs.readFileSync(railwayPath, 'utf8');
const railwayConfig = JSON.parse(railwayContent);

// Force new build with unique environment variables
railwayConfig.deploy.buildCommand = `cd frontend && npm ci --prefer-offline --no-audit && REACT_APP_BUILD_TIME=${timestamp} npm run build`;
railwayConfig.environments.production.variables = {
  ...railwayConfig.environments.production.variables,
  REACT_APP_API_URL: 'https://backend-production-62f0.up.railway.app',
  REACT_APP_BUILD_TIME: timestamp.toString(),
  REACT_APP_VERSION: newVersion
};

fs.writeFileSync(railwayPath, JSON.stringify(railwayConfig, null, 2));
console.log('✅ Updated railway.json');

// 4. Create a unique build info file
const buildInfoPath = 'frontend/src/buildInfo.js';
const buildInfo = `// Build Info - ${new Date().toISOString()}
export const BUILD_TIME = ${timestamp};
export const VERSION = '${newVersion}';
export const API_URL = 'https://backend-production-62f0.up.railway.app';

console.log('🚀 App Version:', VERSION);
console.log('🕐 Build Time:', new Date(BUILD_TIME).toLocaleString());
console.log('🌐 API URL:', API_URL);
`;

fs.writeFileSync(buildInfoPath, buildInfo);
console.log('✅ Created build info file');

// 5. Update App.js to import build info
const appPath = 'frontend/src/App.js';
let appContent = fs.readFileSync(appPath, 'utf8');

// Add import at top
if (!appContent.includes('buildInfo')) {
  appContent = appContent.replace(
    "import './App.css';",
    "import './App.css';\nimport './buildInfo.js';"
  );
}

fs.writeFileSync(appPath, appContent);
console.log('✅ Updated App.js');

// 6. Remove old build artifacts
const artifactsToRemove = [
  'frontend/build',
  'frontend/node_modules/.cache'
];

artifactsToRemove.forEach(path => {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
    console.log(`✅ Removed ${path}`);
  }
});

console.log('\n🎯 FORCE BUILD COMPLETED!');
console.log('📋 Changes made:');
console.log(`  1. ✅ Version updated to ${newVersion}`);
console.log(`  2. ✅ Build timestamp: ${timestamp}`);
console.log('  3. ✅ Railway config updated');
console.log('  4. ✅ Build info created');
console.log('  5. ✅ Cache cleared');
console.log('\n🚀 Ready for git commit and push!'); 