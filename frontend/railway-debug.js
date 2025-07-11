// RAILWAY DEBUG INFO - EMERGENCY BUILD
console.log('🚨 RAILWAY DEBUG INFO - EMERGENCY BUILD 🚨');
console.log('📅 Build Time:', new Date().toISOString());
console.log('🔢 Build ID:', '1736606700000');
console.log('💡 Version:', '5.0.1736606700000');
console.log('🔧 CSS Fix Applied: calc(auto + env()) -> min-height: calc(56px + env())');
console.log('⚙️ CI=false, GENERATE_SOURCEMAP=false');
console.log('🖥️ Server: Express with specific JS/CSS routes');
console.log('📁 Build Directory:', __dirname);
console.log('🔗 Expected: No more "Unexpected token <" errors');
console.log('🎯 Railway MUST rebuild with these changes');

// Export build info
module.exports = {
  buildTime: new Date().toISOString(),
  buildId: '1736606700000',
  version: '5.0.1736606700000',
  cssFixApplied: true,
  serverType: 'express',
  debug: true
}; 